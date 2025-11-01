// Environment-aware CORS configuration
// In production, restrict to specific domain for security
const isProd = Deno.env.get('ENVIRONMENT') === 'production';
const allowedOrigin = isProd 
  ? Deno.env.get('ALLOWED_ORIGIN') || 'https://oneiros.me'
  : '*';

export const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours
};
