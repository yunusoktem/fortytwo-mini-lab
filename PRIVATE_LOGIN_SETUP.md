# Prey AI Lab — private owner login

This branch adds a single-owner sign-in gate. It does not create a public registration flow.

## Vercel environment variables

Set these for Production (and Preview only if you want preview deployments accessible):

- `FORTYTWO_API_KEY`: existing Fortytwo API key.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key (legacy anon key also works if that is what the project exposes).
- `SUPABASE_URL`: same Supabase project URL, server-side.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role key; server-side only, never prefix it with NEXT_PUBLIC.
- `PREY_OWNER_EMAIL`: the one permitted owner email address.
- `NEXT_PUBLIC_PREY_OWNER_EMAIL`: same owner email, used only to pre-check the login form. Server authorization still uses PREY_OWNER_EMAIL.

## Supabase Auth setup

1. In Supabase Authentication → Providers → Email, enable email/password sign-in.
2. Disable new user signups / set `Enable sign ups` off. Do not enable anonymous sign-ins.
3. In Authentication → Users, create the owner account manually with the authorized email. Set a strong password and confirm the email as appropriate.
4. In Authentication → URL Configuration, add the deployed app URL and `https://YOUR-DOMAIN/auth/callback` to the allowed redirect URLs.

## Database

Run `supabase/schema.sql` in the Supabase SQL Editor. Memory is keyed to the authenticated Supabase user ID, not a browser UUID. The service-role key is used only in server routes after checking the signed session and owner email.

## Important

- Keep the service-role key secret.
- The app remains private only after the Vercel environment variables are set and the deployment is live.
- Existing guest-memory rows are not automatically migrated. They remain in the old table until you decide whether to remove them.
- This change is on a feature branch and has not been deployed or production-tested.
