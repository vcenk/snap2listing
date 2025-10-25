# Leaked Password Protection Setup Guide

**Date:** October 23, 2024
**Status:** ⚠️ Manual Configuration Required

---

## Overview

Leaked password protection prevents users from using passwords that have been exposed in data breaches. This security feature checks passwords against the [HaveIBeenPwned](https://haveibeenpwned.com/) database.

---

## Why This Matters

- **350+ billion** passwords have been leaked in data breaches
- **60%** of users reuse passwords across multiple sites
- **81%** of data breaches involve weak or stolen passwords
- Leaked passwords can be used for credential stuffing attacks

---

## Setup via Supabase Dashboard

### Step 1: Navigate to Auth Settings

1. Go to: **https://supabase.com/dashboard**
2. Select your project: **snap2listing**
3. Click: **Authentication** (in left sidebar)
4. Click: **Policies** tab

### Step 2: Enable Password Protection

Scroll to the **"Password Protection"** section and enable:

- ✅ **Leaked password protection**
  - Uses HaveIBeenPwned API
  - Checks on signup and password change
  - Blocks commonly breached passwords

- ✅ **Password strength requirements**
  - Minimum length: 8 characters
  - Require uppercase letters
  - Require lowercase letters
  - Require numbers
  - Require special characters

### Step 3: Save Configuration

Click **"Save"** at the bottom of the page.

---

## Setup via Supabase CLI (Alternative)

If you prefer using the CLI:

```bash
# Update auth configuration
supabase auth update \\
  --enable-password-strength=true \\
  --password-min-length=8 \\
  --password-require-uppercase=true \\
  --password-require-lowercase=true \\
  --password-require-numbers=true \\
  --password-require-symbols=true

# Enable leaked password protection
supabase auth update \\
  --enable-leaked-password-protection=true
```

---

## How It Works

### On Signup

```
User enters password
  ↓
Check password strength (local)
  ✓ Length >= 8 characters
  ✓ Contains uppercase
  ✓ Contains lowercase
  ✓ Contains number
  ✓ Contains special character
  ↓
Check against HaveIBeenPwned API
  ↓
If password is leaked:
  ✗ Show error: "This password has been leaked in a data breach"
  ✗ Require user to choose a different password
  ↓
If password is safe:
  ✓ Allow signup
```

### Privacy Protection

The HaveIBeenPwned API uses **k-anonymity**:

1. Password is hashed using SHA-1
2. Only the **first 5 characters** of the hash are sent to the API
3. API returns all leaked hashes starting with those 5 characters
4. Client checks if full hash is in the returned list
5. Full password is **never** sent to HaveIBeenPwned

**Example:**

```
Password: "MyPassword123"
SHA-1 Hash: "34819d7b634dbbeef5f1f5ed96e5682b0fcaa9e1"
Sent to API: "34819"  ← Only first 5 characters
API Returns: List of ~500 hashes starting with "34819"
Client Checks: Is full hash in list? → Yes (leaked)
```

---

## Testing

### Test with Known Leaked Password

```typescript
// This password is known to be leaked
const leakedPassword = "password123";

const { data, error } = await supabase.auth.signUp({
  email: "test@example.com",
  password: leakedPassword,
});

// Expected error:
// "Password is too common or has been leaked in a data breach"
```

### Test with Strong Password

```typescript
// Strong, unique password
const strongPassword = "J8#mK9!pL2@nQ4";

const { data, error } = await supabase.auth.signUp({
  email: "test@example.com",
  password: strongPassword,
});

// Expected: Success (unless this specific password is leaked)
```

---

## User Experience

### Signup Form Validation

Update your signup form to show helpful errors:

```typescript
// components/auth/SignupForm.tsx
const handleSignup = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("leaked")) {
      setError(
        "This password has been found in a data breach. " +
        "Please choose a different password for your security."
      );
    } else if (error.message.includes("weak") || error.message.includes("strength")) {
      setError(
        "Password must be at least 8 characters and include " +
        "uppercase, lowercase, numbers, and special characters."
      );
    } else {
      setError(error.message);
    }
  }
};
```

### Password Strength Indicator

Add a visual indicator for password strength:

```typescript
// lib/utils/passwordStrength.ts
export function checkPasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  return {
    score,
    strength: score < 3 ? "weak" : score < 5 ? "medium" : "strong",
    checks,
  };
}
```

```tsx
// Component
const [password, setPassword] = useState("");
const strength = checkPasswordStrength(password);

return (
  <div>
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    <div className="password-strength">
      Strength: {strength.strength}
      <ul>
        <li className={strength.checks.length ? "valid" : "invalid"}>
          ✓ At least 8 characters
        </li>
        <li className={strength.checks.uppercase ? "valid" : "invalid"}>
          ✓ Uppercase letter
        </li>
        <li className={strength.checks.lowercase ? "valid" : "invalid"}>
          ✓ Lowercase letter
        </li>
        <li className={strength.checks.number ? "valid" : "invalid"}>
          ✓ Number
        </li>
        <li className={strength.checks.special ? "valid" : "invalid"}>
          ✓ Special character
        </li>
      </ul>
    </div>
  </div>
);
```

---

## Configuration Options

### Adjust Password Requirements

If 8 characters is too strict for your use case:

```bash
# More lenient (not recommended)
supabase auth update --password-min-length=6

# More strict (recommended for sensitive data)
supabase auth update --password-min-length=12
```

### Disable Specific Requirements

```bash
# Don't require special characters (not recommended)
supabase auth update --password-require-symbols=false
```

---

## Monitoring

### Track Blocked Passwords

Add logging to track how many signups are blocked:

```typescript
// lib/analytics/trackPasswordBlocked.ts
export async function trackPasswordBlocked(reason: string) {
  await supabase
    .from("security_events")
    .insert({
      event_type: "password_blocked",
      reason,
      timestamp: new Date().toISOString(),
    });
}
```

### Monthly Report

Check how many users are affected:

```sql
SELECT
  DATE_TRUNC('month', timestamp) AS month,
  reason,
  COUNT(*) AS blocked_count
FROM security_events
WHERE event_type = 'password_blocked'
GROUP BY month, reason
ORDER BY month DESC;
```

---

## Troubleshooting

### Issue: "Password is weak" but meets all requirements

**Cause:** Password might be a common dictionary word or pattern.

**Solution:**
- Encourage users to use password managers
- Suggest randomly generated passwords
- Provide "Generate Password" button

### Issue: HaveIBeenPwned API is slow

**Cause:** Network latency to external API.

**Solution:**
- Show loading indicator during signup
- Add timeout (5 seconds)
- Fall back to local checks if API fails

```typescript
const signupWithTimeout = async (email: string, password: string) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), 5000)
  );

  try {
    const result = await Promise.race([
      supabase.auth.signUp({ email, password }),
      timeoutPromise,
    ]);
    return result;
  } catch (error) {
    if (error.message === "Timeout") {
      // Proceed anyway or show error
      console.warn("Password check timed out");
    }
    throw error;
  }
};
```

---

## Compliance

### GDPR

Leaked password checking is GDPR-compliant because:
- No full password is ever transmitted
- Only partial hash is sent to HaveIBeenPwned
- No personal data is stored by the API
- Users benefit from increased security

### Disclosure

Consider adding to your privacy policy:

> "To protect your account, we check passwords against known data breaches using the HaveIBeenPwned API. Your password is never sent in full - only a partial hash is transmitted using k-anonymity."

---

## Verification Checklist

After setup, verify:

- [ ] Leaked password protection is enabled in Supabase dashboard
- [ ] Password strength requirements are configured
- [ ] Signup form shows appropriate error messages
- [ ] Password strength indicator is displayed
- [ ] Known leaked passwords are blocked (test with "password123")
- [ ] Strong passwords are accepted
- [ ] Error handling works for API timeouts
- [ ] Privacy policy is updated

---

## Additional Resources

- [HaveIBeenPwned API Docs](https://haveibeenpwned.com/API/v3)
- [k-Anonymity Explained](https://en.wikipedia.org/wiki/K-anonymity)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

---

**Status:** ⚠️ **MANUAL CONFIGURATION REQUIRED**

Go to Supabase Dashboard → Authentication → Policies to enable leaked password protection.

---

*Last Updated: October 23, 2024*
