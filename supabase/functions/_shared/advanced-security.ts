// Advanced Security Middleware for Oneiros AI Platform
// Provides bot detection, rate limiting, and geographic risk assessment

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

export interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
  requiresCaptcha?: boolean;
  suspicionScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  countryCode?: string;
}

// High-risk countries by tier
const BLOCKED_COUNTRIES = ['KP', 'IR', 'SY', 'CU']; // Tier 1: OFAC sanctioned
const HIGH_RISK_COUNTRIES = ['RU', 'CN', 'BY', 'VE', 'MM', 'ZW']; // Tier 2: Enhanced monitoring
const MEDIUM_RISK_COUNTRIES = ['NG', 'RO', 'BR', 'ID', 'PK', 'BD', 'VN']; // Tier 3: Additional screening

// Suspicious User-Agent patterns
const BOT_USER_AGENTS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i,
  /^curl/i, /^wget/i, /^python-requests/i, /^java/i,
  /headless/i, /phantom/i, /selenium/i, /puppeteer/i
];

// Hash IP address for privacy
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + 'oneiros-salt-2025');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Detect bot behavior from request headers
function detectBot(headers: Headers): { isBot: boolean; confidence: number; reason?: string } {
  const userAgent = headers.get('user-agent') || '';
  const acceptLanguage = headers.get('accept-language');
  const acceptEncoding = headers.get('accept-encoding');
  const accept = headers.get('accept');
  
  let confidence = 0;
  let reason = '';

  // Check for bot user agents
  for (const pattern of BOT_USER_AGENTS) {
    if (pattern.test(userAgent)) {
      confidence += 80;
      reason = 'Suspicious user agent detected';
      break;
    }
  }

  // Missing browser headers
  if (!acceptLanguage) confidence += 15;
  if (!acceptEncoding) confidence += 15;
  if (!accept) confidence += 10;

  // Empty or very short user agent
  if (userAgent.length < 20) {
    confidence += 30;
    reason = 'Invalid user agent';
  }

  // Check for headless browser indicators
  if (userAgent.includes('HeadlessChrome') || userAgent.includes('Headless')) {
    confidence += 90;
    reason = 'Headless browser detected';
  }

  return {
    isBot: confidence >= 50,
    confidence: Math.min(confidence, 100),
    reason: confidence >= 50 ? reason : undefined
  };
}

// Check geographic risk level
async function checkGeographicRisk(
  ip: string,
  supabase: any
): Promise<{ riskLevel: 'blocked' | 'high' | 'medium' | 'low'; countryCode: string; countryName?: string }> {
  const ipHash = await hashIP(ip);

  // Check cache first
  const { data: cached } = await supabase
    .from('geo_risk_cache')
    .select('*')
    .eq('ip_hash', ipHash)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (cached) {
    return {
      riskLevel: (cached as any).risk_level as 'blocked' | 'high' | 'medium' | 'low',
      countryCode: (cached as any).country_code,
      countryName: (cached as any).country_name
    };
  }

  // Call free IP geolocation API
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) {
      console.warn('Geolocation API failed, allowing request');
      return { riskLevel: 'low', countryCode: 'UNKNOWN' };
    }

    const geoData = await response.json();
    const countryCode = geoData.country_code || 'UNKNOWN';
    const countryName = geoData.country_name;

    // Determine risk level
    let riskLevel: 'blocked' | 'high' | 'medium' | 'low';
    if (BLOCKED_COUNTRIES.includes(countryCode)) {
      riskLevel = 'blocked';
    } else if (HIGH_RISK_COUNTRIES.includes(countryCode)) {
      riskLevel = 'high';
    } else if (MEDIUM_RISK_COUNTRIES.includes(countryCode)) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    // Cache the result
    await supabase.from('geo_risk_cache').upsert({
      ip_hash: ipHash,
      country_code: countryCode,
      country_name: countryName,
      risk_level: riskLevel,
      latitude: geoData.latitude,
      longitude: geoData.longitude,
      cached_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    } as any);

    return { riskLevel, countryCode, countryName };
  } catch (error) {
    console.error('Geolocation check failed:', error);
    return { riskLevel: 'low', countryCode: 'UNKNOWN' };
  }
}

// Check for brute force attacks
async function checkBruteForce(
  ip: string,
  email: string | null,
  supabase: any
): Promise<{ isAttack: boolean; failedAttempts: number }> {
  const ipHash = await hashIP(ip);
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  // Check failed attempts in last 15 minutes
  const query = supabase
    .from('auth_attempts')
    .select('*', { count: 'exact' })
    .eq('success', false)
    .gte('created_at', fifteenMinutesAgo);

  if (email) {
    query.eq('email', email);
  } else {
    query.eq('ip_hash', ipHash);
  }

  const { count } = await query;
  const failedAttempts = count || 0;

  return {
    isAttack: failedAttempts >= 5,
    failedAttempts
  };
}

// Main security check function
export async function performSecurityCheck(
  request: Request,
  supabase: any,
  options: {
    checkGeo?: boolean;
    checkBot?: boolean;
    checkBruteForce?: boolean;
    email?: string;
  } = {}
): Promise<SecurityCheckResult> {
  const headers = request.headers;
  const ip = headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             headers.get('x-real-ip') || 
             'unknown';

  let suspicionScore = 0;
  let reason = '';
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let countryCode: string | undefined;

  // Check if IP is blacklisted
  const ipHash = await hashIP(ip);
  const { data: blacklisted } = await supabase
    .from('ip_blacklist')
    .select('*')
    .eq('ip_hash', ipHash)
    .single();

  if (blacklisted && ((blacklisted as any).permanent || new Date((blacklisted as any).blocked_until) > new Date())) {
    return {
      allowed: false,
      reason: 'Access denied',
      suspicionScore: 100,
      riskLevel: 'critical',
      requiresCaptcha: false
    };
  }

  // Bot detection
  if (options.checkBot !== false) {
    const botCheck = detectBot(headers);
    if (botCheck.isBot) {
      suspicionScore += botCheck.confidence * 0.6;
      reason = botCheck.reason || 'Bot behavior detected';
      riskLevel = botCheck.confidence > 80 ? 'critical' : 'high';

      // Log security event
      await supabase.from('security_events').insert({
        event_type: 'bot_detected',
        severity: botCheck.confidence > 80 ? 'high' : 'medium',
        ip_hash: ipHash,
        details: { confidence: botCheck.confidence, reason: botCheck.reason },
        blocked: botCheck.confidence > 80
      } as any);
    }
  }

  // Geographic risk check
  if (options.checkGeo !== false) {
    const geoCheck = await checkGeographicRisk(ip, supabase);
    countryCode = geoCheck.countryCode;

    if (geoCheck.riskLevel === 'blocked') {
      // Log blocked country access
      await supabase.from('security_events').insert({
        event_type: 'geo_anomaly',
        severity: 'critical',
        ip_hash: ipHash,
        details: { country: geoCheck.countryCode, country_name: geoCheck.countryName },
        blocked: true
      } as any);

      return {
        allowed: false,
        reason: 'Service not available in your region due to compliance requirements',
        suspicionScore: 100,
        riskLevel: 'critical',
        countryCode: geoCheck.countryCode,
        requiresCaptcha: false
      };
    }

    if (geoCheck.riskLevel === 'high') {
      suspicionScore += 30;
      riskLevel = suspicionScore > 60 ? 'high' : 'medium';
    } else if (geoCheck.riskLevel === 'medium') {
      suspicionScore += 15;
    }
  }

  // Brute force check
  if (options.checkBruteForce !== false) {
    const bruteForceCheck = await checkBruteForce(ip, options.email || null, supabase);
    if (bruteForceCheck.isAttack) {
      suspicionScore += 40;
      riskLevel = 'critical';
      reason = 'Too many failed attempts';

      // Log brute force attempt
      await supabase.from('security_events').insert({
        event_type: 'brute_force',
        severity: 'high',
        ip_hash: ipHash,
        details: { failed_attempts: bruteForceCheck.failedAttempts },
        blocked: bruteForceCheck.failedAttempts >= 10
      } as any);

      if (bruteForceCheck.failedAttempts >= 10) {
        // Temporary ban for 1 hour
        await supabase.from('ip_blacklist').upsert({
          ip_hash: ipHash,
          reason: 'Brute force attack detected',
          blocked_until: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          permanent: false,
          violation_count: bruteForceCheck.failedAttempts
        } as any);

        return {
          allowed: false,
          reason: 'Access temporarily blocked. Please try again later.',
          suspicionScore: 100,
          riskLevel: 'critical',
          countryCode,
          requiresCaptcha: false
        };
      }
    }
  }

  // Request CAPTCHA if suspicion is moderate
  const requiresCaptcha = suspicionScore >= 40 && suspicionScore < 80;

  return {
    allowed: suspicionScore < 80,
    reason: suspicionScore >= 80 ? reason || 'Security check failed' : undefined,
    suspicionScore: Math.min(suspicionScore, 100),
    riskLevel,
    countryCode,
    requiresCaptcha
  };
}

// Log authentication attempt
export async function logAuthAttempt(
  supabase: any,
  ip: string,
  attemptType: 'login' | 'signup' | 'password_reset' | 'api_key',
  success: boolean,
  email?: string,
  userId?: string,
  countryCode?: string
): Promise<void> {
  const ipHash = await hashIP(ip);
  const userAgent = 'server'; // Headers not available in this context

  await supabase.from('auth_attempts').insert({
    ip_hash: ipHash,
    email: email || null,
    user_id: userId || null,
    attempt_type: attemptType,
    success,
    country_code: countryCode || null,
    user_agent: userAgent,
    fingerprint: null,
    risk_score: success ? 0 : 10
  } as any);
}
