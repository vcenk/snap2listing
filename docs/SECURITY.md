# Security Documentation

**Project:** snap2listing
**Last Updated:** October 23, 2024
**Status:** ✅ Security measures implemented

---

## Overview

This document outlines the security measures implemented in snap2listing to protect user data and prevent unauthorized access. All security fixes address issues identified by the Supabase Security Advisor.

---

## 1. Row Level Security (RLS)

### What is RLS?

Row Level Security ensures that users can only access data that belongs to them. Even if someone gains access to the database, they cannot view other users' private data.

### Tables with RLS Enabled

| Table | Purpose | RLS Status |
|-------|---------|------------|
| `users` | User accounts and settings | ✅ Enabled |
| `listings` | Marketplace listings | ✅ Enabled |
| `templates` | Reusable listing templates | ✅ Enabled |
| `brand_kits` | Brand styling configurations | ✅ Enabled |
| `insight_reports` | AI-generated insights | ✅ Enabled |
| `export_kits` | Bulk export configurations | ✅ Enabled |
| `export_items` | Items within export kits | ✅ Enabled |

### RLS Policy Pattern

All tables follow this security pattern:

```sql
-- SELECT: Users can view their own records
CREATE POLICY "Users can view own [table]"
  ON public.[table]
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can create records for themselves
CREATE POLICY "Users can create own [table]"
  ON public.[table]
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can modify their own records
CREATE POLICY "Users can update own [table]"
  ON public.[table]
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own records
CREATE POLICY "Users can delete own [table]"
  ON public.[table]
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Special Cases

#### export_items Table

This table has more complex policies because items are owned indirectly through `export_kits`:

```sql
CREATE POLICY "Users can view own export items"
  ON public.export_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.export_kits
      WHERE export_kits.id = export_items.export_kit_id
        AND export_kits.user_id = auth.uid()
    )
  );
```

This ensures users can only access export items that belong to their own export kits.

---

## 2. Function Security

### Search Path Vulnerability

Database functions without an immutable `search_path` are vulnerable to SQL injection attacks. We've secured all functions by adding:

```sql
SET search_path = public, pg_temp
```

This setting ensures:
- Functions only access objects in the `public` schema
- Temporary tables are accessible via `pg_temp`
- Malicious users cannot inject their own schemas

### Secured Functions

All 12 database functions have been secured:

| Function | Purpose | Security Level |
|----------|---------|----------------|
| `handle_new_user()` | Auto-create user on signup | SECURITY DEFINER + immutable search_path |
| `can_generate_image()` | Check image quota | SECURITY DEFINER + immutable search_path |
| `can_generate_video()` | Check video quota | SECURITY DEFINER + immutable search_path |
| `increment_image_usage()` | Track image usage | SECURITY DEFINER + immutable search_path |
| `increment_video_usage()` | Track video usage | SECURITY DEFINER + immutable search_path |
| `add_image_quota()` | Add image quota | SECURITY DEFINER + immutable search_path |
| `add_video_quota()` | Add video quota | SECURITY DEFINER + immutable search_path |
| `reset_monthly_usage()` | Monthly quota reset | SECURITY DEFINER + immutable search_path |
| `increment_usage()` | Generic usage tracking | SECURITY DEFINER + immutable search_path |
| `update_updated_at_column()` | Auto-update timestamps | Trigger + immutable search_path |
| `get_listings_by_channel()` | Filter listings | SECURITY DEFINER + immutable search_path + auth check |
| `get_channel_info()` | Channel statistics | SECURITY DEFINER + immutable search_path + auth check |

### SECURITY DEFINER Functions

Functions marked `SECURITY DEFINER` run with the privileges of the function creator (not the caller). This is necessary for:

1. **Auto-creating users** - The trigger needs permission to insert into `users` table
2. **Quota management** - System needs to update usage counters
3. **Cross-user queries** - Aggregate functions need to read multiple rows

All `SECURITY DEFINER` functions include authentication checks:

```sql
-- Ensure user is authenticated
IF auth.uid() IS NULL THEN
  RAISE EXCEPTION 'Not authenticated';
END IF;
```

---

## 3. Authentication Security

### Password Protection

**Status:** ⚠️ Requires Manual Configuration

Leaked password protection should be enabled in the Supabase Dashboard:

1. Go to: **Supabase Dashboard** → **Authentication** → **Policies**
2. Enable: **"Password strength and leaked password protection"**
3. Check: **"Enable leaked password protection"**

This feature checks passwords against the [HaveIBeenPwned](https://haveibeenpwned.com/) database to prevent users from using compromised passwords.

### Password Requirements

Configure minimum password requirements:

```
- Minimum length: 8 characters
- Require uppercase: Yes
- Require lowercase: Yes
- Require numbers: Yes
- Require special characters: Yes
```

### Session Management

- Session timeout: 7 days
- Refresh token rotation: Enabled
- Multi-device sessions: Allowed

---

## 4. API Security

### Environment Variables

Sensitive credentials are stored in environment variables:

```env
# Database
DATABASE_URL=postgresql://... (Server-side only)
DIRECT_URL=postgresql://... (Server-side only)
NEXT_PUBLIC_SUPABASE_URL=... (Public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=... (Public, rate-limited)
SUPABASE_SERVICE_KEY=... (Server-side only, full access)

# External APIs
FAL_KEY=... (Server-side only)
OPENAI_API_KEY=... (Server-side only)
STRIPE_SECRET_KEY=... (Server-side only)
```

**Important:**
- Never expose `SUPABASE_SERVICE_KEY` to the client
- Only `NEXT_PUBLIC_*` variables are safe for client-side use
- Server-side API keys should only be used in API routes or server components

### Rate Limiting

Implement rate limiting on sensitive endpoints:

```typescript
// Example: lib/rateLimit.ts
export async function rateLimit(userId: string, action: string) {
  const key = `${userId}:${action}`;
  const limit = 100; // requests per hour
  const window = 3600; // 1 hour in seconds

  // Check Redis or similar for rate limit
  // Throw error if exceeded
}
```

### CORS Configuration

Configure CORS to only allow requests from your domain:

```typescript
// next.config.js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
      ],
    },
  ];
}
```

---

## 5. Data Encryption

### At Rest

Supabase encrypts all data at rest using AES-256 encryption.

### In Transit

All connections use TLS 1.2+ encryption:
- Database connections: SSL required
- API requests: HTTPS only
- WebSocket connections: WSS only

---

## 6. Audit Logging

### Track Important Events

Log security-relevant events:

```sql
-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON public.audit_log
  FOR SELECT
  USING (auth.uid() = user_id);
```

### Events to Log

- User login/logout
- Password changes
- API key creation/deletion
- Data exports
- Payment transactions
- Failed authentication attempts

---

## 7. Incident Response

### Security Issue Reporting

**Email:** security@snap2listing.com

**Response Time:**
- Critical: 4 hours
- High: 24 hours
- Medium: 3 days
- Low: 7 days

### Incident Procedure

1. **Detect** - Monitor logs and alerts
2. **Contain** - Isolate affected systems
3. **Investigate** - Determine root cause
4. **Remediate** - Fix vulnerability
5. **Notify** - Inform affected users (if applicable)
6. **Document** - Record incident details

---

## 8. Compliance

### GDPR

Users have the right to:
- Access their data
- Export their data
- Delete their data
- Correct their data

Implement data deletion:

```sql
-- Delete all user data
CREATE OR REPLACE FUNCTION public.delete_user_data(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Verify user is deleting their own data
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Delete all user data (cascades will handle related tables)
  DELETE FROM public.users WHERE id = p_user_id;
END;
$$;
```

### Data Retention

- Active user data: Retained indefinitely
- Deleted user data: Purged after 30 days
- Audit logs: Retained for 1 year
- Backups: Retained for 90 days

---

## 9. Testing Security

### RLS Policy Testing

Test that users cannot access other users' data:

```typescript
// tests/security/rls.test.ts
import { createClient } from "@supabase/supabase-js";

describe("RLS Security", () => {
  test("User cannot view another user's listings", async () => {
    // Create test users
    const user1 = await createTestUser();
    const user2 = await createTestUser();

    // User 1 creates a listing
    await user1.from("listings").insert({ title: "User 1 Listing" });

    // User 2 tries to view it
    const { data } = await user2
      .from("listings")
      .select("*")
      .eq("user_id", user1.id);

    expect(data).toHaveLength(0); // Should not see user 1's data
  });
});
```

### Function Security Testing

```sql
-- Test that unauthenticated users cannot call functions
SELECT public.can_generate_image('some-user-id');
-- Should fail with authentication error
```

---

## 10. Security Checklist

### Before Production Deploy

- [ ] All tables have RLS enabled
- [ ] All functions have immutable `search_path`
- [ ] Leaked password protection enabled
- [ ] Environment variables properly secured
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] Audit logging enabled
- [ ] Security tests passing
- [ ] Backups configured
- [ ] Monitoring alerts set up

### Monthly Security Review

- [ ] Review audit logs for suspicious activity
- [ ] Update dependencies to latest versions
- [ ] Review and rotate API keys
- [ ] Check Supabase Security Advisor
- [ ] Review access logs
- [ ] Test backup restoration

---

## 11. Migration Files

Security fixes are applied through these migrations:

1. **`20241023_fix_function_search_path_security.sql`**
   - Adds immutable `search_path` to all functions
   - Adds authentication checks to query functions
   - Fixes SECURITY DEFINER privilege escalation risks

2. **`20241023_enable_rls_security.sql`**
   - Enables RLS on all public tables
   - Creates policies for data access control
   - Adds verification checks

### Applying Migrations

```bash
# Local development
supabase db push

# Production
# Run migrations through Supabase Dashboard → SQL Editor
```

---

## 12. Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-security.html)

---

**Last Reviewed:** October 23, 2024
**Next Review:** November 23, 2024
**Security Contact:** security@snap2listing.com
