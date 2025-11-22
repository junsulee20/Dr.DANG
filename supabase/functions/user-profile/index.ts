import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { getUserFromRequest } from '../_shared/auth.ts'

serve(async (req) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    // 인증 확인
    const user = await getUserFromRequest(req)
    if (!user) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다.',
          },
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Supabase 클라이언트 생성
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // GET /user/profile
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)

        if (error.code === 'PGRST116') {
          return new Response(
            JSON.stringify({
              error: {
                code: 'NOT_FOUND',
                message: '사용자를 찾을 수 없습니다.',
              },
            }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        throw new Error('프로필 조회 중 오류가 발생했습니다.')
      }

      return new Response(
        JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
          height: data.height,
          weight: data.weight,
          profileImageUrl: data.profile_image_url,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // PUT /user/profile
    if (req.method === 'PUT') {
      const contentType = req.headers.get('content-type') || ''

      let updateData: any = {
        updated_at: new Date().toISOString(),
      }

      // FormData 처리 (이미지 포함)
      if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData()
        const name = formData.get('name') as string | null
        const height = formData.get('height') as string | null
        const weight = formData.get('weight') as string | null
        const profileImage = formData.get('profileImage') as File | null

        if (name) updateData.name = name
        if (height) updateData.height = parseInt(height, 10)
        if (weight) updateData.weight = parseInt(weight, 10)

        // 프로필 이미지 업로드
        if (profileImage) {
          // 파일 크기 검증 (5MB)
          if (profileImage.size > 5 * 1024 * 1024) {
            return new Response(
              JSON.stringify({
                error: {
                  code: 'VALIDATION_ERROR',
                  message: '이미지 크기는 5MB를 초과할 수 없습니다.',
                },
              }),
              {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            )
          }

          // 이미지 타입 검증
          if (!profileImage.type.startsWith('image/')) {
            return new Response(
              JSON.stringify({
                error: {
                  code: 'VALIDATION_ERROR',
                  message: '이미지 파일만 업로드 가능합니다.',
                },
              }),
              {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            )
          }

          const fileName = `${user.id}/profile_${Date.now()}_${profileImage.name}`
          const arrayBuffer = await profileImage.arrayBuffer()

          const { error: uploadError } = await supabaseAdmin.storage
            .from('food-images')
            .upload(fileName, arrayBuffer, {
              contentType: profileImage.type,
              upsert: true,
            })

          if (uploadError) {
            console.error('Profile image upload error:', uploadError)
            throw new Error('프로필 이미지 업로드 중 오류가 발생했습니다.')
          }

          const { data: urlData } = supabaseAdmin.storage
            .from('food-images')
            .getPublicUrl(fileName)

          updateData.profile_image_url = urlData.publicUrl
        }
      } else {
        // JSON 처리 (이미지 없음)
        const body = await req.json()
        const { name, height, weight } = body

        if (name) updateData.name = name
        if (height) updateData.height = parseInt(height, 10)
        if (weight) updateData.weight = parseInt(weight, 10)
      }

      // 프로필 업데이트
      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Profile update error:', error)
        throw new Error('프로필 수정 중 오류가 발생했습니다.')
      }

      return new Response(
        JSON.stringify({
          message: 'Profile updated successfully',
          user: {
            id: data.id,
            name: data.name,
            email: data.email,
            height: data.height,
            weight: data.weight,
            profileImageUrl: data.profile_image_url,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 지원하지 않는 메서드
    return new Response(
      JSON.stringify({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: '지원하지 않는 HTTP 메서드입니다.',
        },
      }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('User profile API error:', error)
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: '프로필 처리 중 오류가 발생했습니다.',
          details: error.message,
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

