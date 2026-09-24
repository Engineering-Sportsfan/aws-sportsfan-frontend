import posthog from 'posthog-js';

/**
 * Clickstream & Product Analytics Service (PostHog)
 * Covers L0 and L1 KPIs for SportsFan360
 */

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function getSafePostHog() {
  if (!isClient()) return null;
  return posthog;
}

/**
 * L1: Signup / Registration Completion
 */
export function trackSignup(
  userId: string,
  properties?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    method?: string;
  }
): void {
  const ph = getSafePostHog();
  if (!ph) return;

  try {
    const email = properties?.email || (userId.includes('@') ? userId : undefined);
    const resolvedId = userId.includes('@') ? userId.replace(/[@.]/g, '_') : userId;
    const fullName = [properties?.firstName, properties?.lastName].filter(Boolean).join(' ').trim();
    const displayName = fullName || email?.split('@')[0] || userId;

    ph.identify(resolvedId, {
      email,
      $email: email,
      name: displayName,
      $name: displayName,
      signup_method: properties?.method || 'email_otp',
      signup_date: new Date().toISOString(),
    });

    if (userId !== resolvedId) {
      try { ph.alias(userId, resolvedId); } catch (e) {}
    }

    ph.capture('signup_completed', {
      user_id: resolvedId,
      email,
      signup_method: properties?.method || 'email_otp',
      timestamp: new Date().toISOString(),
      $set: {
        email,
        $email: email,
        name: displayName,
        $name: displayName,
      }
    });
  } catch (err) {
    console.warn('[Analytics] Failed to track signup:', err);
  }
}

/**
 * Auth: Login Success
 */
export function trackLoginSuccess(
  userId: string,
  properties?: {
    email?: string;
    name?: string;
    role?: string;
    method?: 'email_password' | 'google' | 'phone_otp' | string;
  }
): void {
  const ph = getSafePostHog();
  if (!ph) return;

  try {
    const email = properties?.email || (userId.includes('@') ? userId : undefined);
    const displayName = properties?.name || email?.split('@')[0] || userId;

    ph.identify(userId, {
      email,
      $email: email,
      name: displayName,
      $name: displayName,
      role: properties?.role || 'user',
      last_login: new Date().toISOString(),
    });

    ph.capture('login_successful', {
      user_id: userId,
      email,
      role: properties?.role || 'user',
      login_method: properties?.method || 'email_password',
      timestamp: new Date().toISOString(),
      $set: {
        email,
        $email: email,
        name: displayName,
        $name: displayName,
        role: properties?.role || 'user',
        last_login: new Date().toISOString(),
      }
    });
  } catch (err) {
    console.warn('[Analytics] Failed to track login success:', err);
  }
}

/**
 * Auth: Login Failed
 */
export function trackLoginFailed(
  email: string,
  properties?: {
    reason?: string;
    status_code?: number;
    method?: 'email_password' | 'google' | string;
  }
): void {
  const ph = getSafePostHog();
  if (!ph) return;

  try {
    ph.capture('login_failed', {
      email,
      reason: properties?.reason || 'invalid_credentials',
      status_code: properties?.status_code || 401,
      login_method: properties?.method || 'email_password',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Analytics] Failed to track login failure:', err);
  }
}

/**
 * L1: Discovery - % Completing Fan DNA
 */
export function trackFanDNACompleted(data: {
  purpose?: string | null;
  tags?: string[];
  sportStyle?: string;
  notificationsEnabled?: boolean;
}): void {
  const ph = getSafePostHog();
  if (!ph) return;

  try {
    ph.capture('fan_dna_completed', {
      purpose: data.purpose,
      selected_tags: data.tags || [],
      tag_count: data.tags?.length || 0,
      sport_style: data.sportStyle,
      notifications_enabled: !!data.notificationsEnabled,
      timestamp: new Date().toISOString(),
    });

    if (ph.people) {
      ph.people.set({
        fan_dna_completed: true,
        preferred_tags: data.tags || [],
        sport_style: data.sportStyle,
      });
    }
  } catch (err) {
    console.warn('[Analytics] Failed to track Fan DNA completion:', err);
  }
}

/**
 * L1: Personalisation - % Following >= 1 Interest
 */
export function trackInterestFollowed(
  interestType: 'sport' | 'team' | 'player' | 'league' | string,
  interestName: string,
  totalInterests?: number
): void {
  const ph = getSafePostHog();
  if (!ph) return;

  try {
    ph.capture('interest_followed', {
      interest_type: interestType,
      interest_name: interestName,
      total_interests: totalInterests,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Analytics] Failed to track interest followed:', err);
  }
}

/**
 * L1: Routing - % Reaching Recommended Feature
 */
export function trackRecommendedFeatureVisited(
  featureName: string,
  source: string = 'direct'
): void {
  const ph = getSafePostHog();
  if (!ph) return;

  try {
    ph.capture('recommended_feature_visited', {
      feature_name: featureName,
      source,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Analytics] Failed to track recommended feature visit:', err);
  }
}

/**
 * L1: Aha Moment & Retention Anchor - Meaningful Interaction
 * Emits both the specific event and a consolidated 'meaningful_interaction'
 */
export function trackMeaningfulInteraction(
  interactionType:
    | 'poll_vote'
    | 'submit_prediction'
    | 'reaction'
    | 'comment'
    | 'ask_dolly'
    | 'enter_room'
    | string,
  metadata?: Record<string, any>
): void {
  const ph = getSafePostHog();
  if (!ph) return;

  try {
    let isFirst = false;
    if (isClient()) {
      const KEY = 'sf360_has_meaningful_interaction';
      if (!localStorage.getItem(KEY)) {
        localStorage.setItem(KEY, 'true');
        isFirst = true;
      }
    }

    ph.capture('meaningful_interaction', {
      interaction_type: interactionType,
      is_first_interaction: isFirst,
      room_name: metadata?.room_name || metadata?.roomName || 'GENERAL',
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Analytics] Failed to track meaningful interaction:', err);
  }
}

/**
 * L1: Identity - % Creating Social / Profile Signals
 */
export function trackProfileSignalCreated(
  signalType: 'bio' | 'avatar' | 'username' | 'social_link' | string,
  metadata?: Record<string, any>
): void {
  const ph = getSafePostHog();
  if (!ph) return;

  try {
    ph.capture('profile_signal_created', {
      signal_type: signalType,
      ...metadata,
      timestamp: new Date().toISOString(),
    });

    if (ph.people) {
      ph.people.set({
        has_profile_signal: true,
        last_profile_update: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('[Analytics] Failed to track profile signal:', err);
  }
}

/**
 * L1: Advocacy - Shares / Invites / Referrals
 */
export function trackAdvocacy(
  actionType: 'content_shared' | 'invite_sent' | 'referral_completed' | string,
  metadata?: Record<string, any>
): void {
  const ph = getSafePostHog();
  if (!ph) return;

  try {
    ph.capture('advocacy_action', {
      action_type: actionType,
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Analytics] Failed to track advocacy action:', err);
  }
}
