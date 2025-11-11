import app from './app';
import { config } from './config/env';

const PORT = config.server.port;
const HOST = '0.0.0.0'; // IPv4 + IPv6 모두 허용

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🌐 Server is listening on ${HOST}:${PORT}`);
  console.log(`📝 Environment: ${config.server.nodeEnv}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
});

