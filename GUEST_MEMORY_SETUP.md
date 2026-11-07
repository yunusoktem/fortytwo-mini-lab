# Prey AI Lab guest memory setup

Guest memory is browser-scoped and does not require user accounts.

## 1. Create the database table

Open the Supabase project SQL Editor and run the contents of `supabase/schema.sql`.

## 2. Add server environment variables in Vercel

Add these variables to the Prey AI Lab Vercel project:

- `SUPABASE_URL`: the project URL from Supabase Project Settings → API.
- `SUPABASE_SERVICE_ROLE_KEY`: the server-side service role key from Supabase Project Settings → API.
- Keep the existing `FORTYTWO_API_KEY`.

Do not use a `NEXT_PUBLIC_` prefix for the service role key. It must never be exposed to the browser.

Redeploy after adding the variables.

## 3. How it works

- The browser creates a random UUID and stores it as `prey-guest-id` in localStorage.
- Chat requests include that UUID.
- The server loads the saved memory summary and adds it to the model context.
- Recent turns are stored in Supabase; every fifth user turn triggers a compact memory refresh using Fortytwo.
- The sidebar includes a control to delete that browser identity's saved memory.

Memory refreshes use an additional Fortytwo model call every five user turns, so they consume additional API credits.

## Limitations

This is not an account system. Memory follows the same browser profile on the same device. Clearing site data, using private browsing, or switching devices creates a different identity. Anyone with access to the browser profile can use that browser's saved identity. Do not store credentials or highly sensitive information in guest memory.
