# Cloud accounts setup (Supabase)

This turns on real sign-up / sign-in so each learner's progress is **private to
their account** and **synced across devices**. It's free on Supabase's free tier.
Takes about 15 minutes, one time.

If you skip this, the app still works — it just runs in **local-only mode** (no
login, progress saved only in that one browser).

---

## 1. Create a Supabase project
1. Go to **https://supabase.com** → sign up (free) → **New project**.
2. Give it a name and a database password (save the password somewhere).
3. Wait ~2 minutes for it to finish provisioning.

## 2. Get your two keys
In the project: **Project Settings** (gear icon) → **API**. Copy:
- **Project URL** → this is your `VITE_SUPABASE_URL`
- **Project API keys → `anon` `public`** → this is your `VITE_SUPABASE_ANON_KEY`

(The `anon` key is meant to be used in a browser. Privacy is enforced by the
row-level security rules below, not by hiding the key.)

## 3. Create the storage table + privacy rules
In the project: **SQL Editor** → **New query** → paste this and click **Run**:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
```

Those three policies mean a logged-in user can only ever read or write **their own**
row — nobody can see anyone else's progress.

## 4. (Recommended) Let sign-ups log in immediately
By default Supabase makes new users confirm their email before they can sign in.
To skip that while you're getting started:
**Authentication → Sign In / Providers → Email** → turn **off** "Confirm email" → Save.
(You can turn it back on later.)

## 5. Local development
1. In the project folder, copy `.env.example` to `.env.local`.
2. Paste your two values into `.env.local`.
3. Then:
   ```bash
   npm install
   npm run dev
   ```
   You should see the sign-in screen. Create an account and you're in.

## 6. Netlify (production)
1. In Netlify: **Site configuration → Environment variables → Add a variable**.
2. Add **both**:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon public key
3. Trigger a redeploy (**Deploys → Trigger deploy → Deploy site**), or just push a commit.

## 7. Allow your site URL (needed for password-reset links)
In Supabase: **Authentication → URL Configuration**:
- Set **Site URL** to your live URL (e.g. `https://your-site.netlify.app`).
- Under **Redirect URLs**, add the same URL (and `http://localhost:5173` for local dev).
This lets the "Forgot password" email link return people to your app.

That's it. Sign up on the live site and your progress will follow you to any device
you log in from.

---

### How syncing works (so you know what to expect)
- On **login**, your saved snapshot is pulled from Supabase into the browser.
- As you study, a snapshot is pushed back automatically (after you move between
  pages, when you switch away from the tab, and every 30 seconds).
- On **sign out**, local data is cleared from that browser; it's safe in the cloud.
- **Reset all progress** (Settings) clears both local and cloud back to a clean start.
