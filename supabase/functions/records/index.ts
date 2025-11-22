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

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const recordId = pathParts[pathParts.length - 1] // 마지막 경로가 ID일 수 있음

    // DELETE /records/:id
    if (req.method === 'DELETE' && recordId && recordId !== 'records') {
      const { data, error } = await supabaseAdmin
        .from('meal_records')
        .delete()
        .eq('id', recordId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return new Response(
            JSON.stringify({
              error: {
                code: 'NOT_FOUND',
                message: '기록을 찾을 수 없습니다.',
              },
            }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        console.error('Record delete error:', error)
        throw new Error('기록 삭제 중 오류가 발생했습니다.')
      }

      return new Response(
        JSON.stringify({
          message: 'Record deleted successfully',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // POST /records
    if (req.method === 'POST') {
      const body = await req.json()
      const { date, mealType, foodName, imageUrl, analysisResult } = body

      // 필수 필드 검증
      if (!date || !mealType || !foodName || !imageUrl || !analysisResult) {
        return new Response(
          JSON.stringify({
            error: {
              code: 'VALIDATION_ERROR',
              message: '필수 필드가 누락되었습니다.',
            },
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // mealType 검증
      if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) {
        return new Response(
          JSON.stringify({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'mealType은 breakfast, lunch, dinner 중 하나여야 합니다.',
            },
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // 기록 생성
      const { data, error } = await supabaseAdmin
        .from('meal_records')
        .insert({
          user_id: user.id,
          date,
          meal_type: mealType,
          food_name: foodName,
          image_url: imageUrl,
          expected_glucose_rise: analysisResult.expectedGlucoseRise,
          nutrition: analysisResult.nutrition,
          detailed_nutrition: analysisResult.detailedNutrition,
          recommendations: analysisResult.recommendations,
          analysis_result: analysisResult,
        })
        .select()
        .single()

      if (error) {
        console.error('Record insert error:', error)
        throw new Error('기록 생성 중 오류가 발생했습니다.')
      }

      return new Response(
        JSON.stringify({
          id: data.id,
          message: 'Record created successfully',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // GET /records?date=YYYY-MM-DD 또는 ?month=YYYY-MM
    if (req.method === 'GET') {
      const { date, month } = Object.fromEntries(url.searchParams)

      let query = supabaseAdmin
        .from('meal_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (date) {
        // 특정 날짜 조회
        query = query.eq('date', date)

        const { data, error } = await query

        if (error) {
          console.error('Records fetch error:', error)
          throw new Error('기록 조회 중 오류가 발생했습니다.')
        }

        return new Response(
          JSON.stringify({
            date: date,
            meals: (data || []).map((record: any) => ({
              id: record.id,
              date: record.date,
              mealType: record.meal_type,
              foodName: record.food_name,
              imageUrl: record.image_url,
              nutrition: record.nutrition,
              detailedNutrition: record.detailed_nutrition,
              expectedGlucoseRise: record.expected_glucose_rise,
              recommendations: record.recommendations,
              analysisResult: record.analysis_result,
              createdAt: record.created_at,
            })),
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      } else if (month) {
        // 월별 조회
        const [year, monthNum] = month.split('-')
        const yearInt = parseInt(year)
        const monthInt = parseInt(monthNum)

        // 해당 월의 마지막 날짜 계산
        const lastDay = new Date(yearInt, monthInt, 0).getDate()

        const startDate = `${year}-${monthNum.padStart(2, '0')}-01`
        const endDate = `${year}-${monthNum.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`

        query = query.gte('date', startDate).lte('date', endDate)

        const { data, error } = await query

        if (error) {
          console.error('Records fetch error:', error)
          throw new Error('기록 조회 중 오류가 발생했습니다.')
        }

        return new Response(
          JSON.stringify({
            month: month,
            records: (data || []).map((record: any) => ({
              id: record.id,
              date: record.date,
              mealType: record.meal_type,
              foodName: record.food_name,
              imageUrl: record.image_url,
              nutrition: record.nutrition,
              detailedNutrition: record.detailed_nutrition,
              expectedGlucoseRise: record.expected_glucose_rise,
              recommendations: record.recommendations,
              analysisResult: record.analysis_result,
              createdAt: record.created_at,
            })),
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      } else {
        // 파라미터 없으면 최근 30일 기록 반환
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const startDate = thirtyDaysAgo.toISOString().split('T')[0]

        query = query.gte('date', startDate)

        const { data, error } = await query

        if (error) {
          console.error('Records fetch error:', error)
          throw new Error('기록 조회 중 오류가 발생했습니다.')
        }

        return new Response(
          JSON.stringify({
            records: data || [],
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
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
    console.error('Records API error:', error)
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: '기록 처리 중 오류가 발생했습니다.',
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

