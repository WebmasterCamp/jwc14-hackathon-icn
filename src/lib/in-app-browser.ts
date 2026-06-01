/**
 * Detection helpers for in-app browsers (LINE, Facebook, Instagram, etc.).
 *
 * Google blocks OAuth sign-in inside embedded webviews with a
 * "disallowed_useragent" / 403 error, so we need to detect these environments
 * and ask the user to open the page in a real browser instead.
 */

type InAppBrowser = {
  /** Machine-readable key for the detected app. */
  key: string;
  /** Human-readable name shown to the user. */
  name: string;
};

/**
 * Patterns matched against the user-agent string. Order matters only for the
 * reported name — the first match wins.
 */
const IN_APP_PATTERNS: { key: string; name: string; test: RegExp }[] = [
  { key: "line", name: "LINE", test: /\bLine\//i },
  { key: "facebook", name: "Facebook", test: /\bFB(AN|AV|_IAB|IOS|DV)\b|FB_IAB|FBAN|FBAV/i },
  { key: "messenger", name: "Messenger", test: /\bMessenger\b/i },
  { key: "instagram", name: "Instagram", test: /\bInstagram\b/i },
  { key: "tiktok", name: "TikTok", test: /musical_ly|Bytedance|BytedanceWebview|TikTok/i },
  { key: "wechat", name: "WeChat", test: /MicroMessenger/i },
  { key: "kakao", name: "KakaoTalk", test: /KAKAOTALK/i },
  { key: "snapchat", name: "Snapchat", test: /Snapchat/i },
  { key: "twitter", name: "X (Twitter)", test: /Twitter/i },
  { key: "linkedin", name: "LinkedIn", test: /LinkedInApp/i },
];

/**
 * Inspect a user-agent string and return the matching in-app browser, or
 * `null` for a normal browser. Pass an explicit UA for testing; defaults to
 * the current navigator on the client.
 */
export function detectInAppBrowser(
  userAgent?: string
): InAppBrowser | null {
  const ua =
    userAgent ??
    (typeof navigator !== "undefined" ? navigator.userAgent : "");

  if (!ua) return null;

  for (const pattern of IN_APP_PATTERNS) {
    if (pattern.test.test(ua)) {
      return { key: pattern.key, name: pattern.name };
    }
  }

  return null;
}

/** True when the current environment is an in-app browser. */
export function isInAppBrowser(userAgent?: string): boolean {
  return detectInAppBrowser(userAgent) !== null;
}
