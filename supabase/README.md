# Setting up the real database (Supabase)

Do these once, in order. Takes about 10 minutes.

## 1. Create your project

1. Go to **supabase.com** → **Start your project** → sign up (GitHub sign-in is fastest).
2. **New project** → name it `zaynkar` → set a database password (save it) → pick a region → **Create project**. Wait ~1–2 minutes.

## 2. Turn off email confirmation (recommended)

So customers can sign up and start picking items right away, without waiting for a confirmation email:

**Authentication → Providers → Email** → turn off **"Confirm email"** → Save.

(You can turn this back on later if you'd rather customers confirm their email first — the app handles both cases either way.)

## 3. Run the database setup

**SQL Editor → New query** → open `supabase/schema.sql` from this project, paste its entire contents → **Run**.

This creates every table, security rule, and the photo/video storage bucket. Safe to run once.

## 4. Create the admin account

This makes `zenabkareem` / `kareemobs155` actually work as the admin login.

1. **Authentication → Users → Add user → Create new user**
   - Email: `zenabkareem@zaynkar-admin.internal`
   - Password: `kareemobs155`
   - Tick **"Auto Confirm User"**
   - Create user
2. Copy the new user's **ID** (looks like `a1b2c3d4-...`) from the users list.
3. **SQL Editor → New query**, paste this (replace `PASTE_ID_HERE` with the ID you copied), then **Run**:
   ```sql
   insert into admin_users (user_id) values ('PASTE_ID_HERE');
   ```

That's it — `/admin/login` on the site now works with that username and password.

## 5. Connect the website to your project

**Project Settings → API** → copy:

- **Project URL**
- **anon public** key (not the `service_role` one)

Send both of these back, and the connection gets wired in and the site goes live with the real database.

### If you want to run it yourself locally

Create a file named `.env.local` in the project folder (copy `.env.example` and rename it), and fill in:

```
VITE_SUPABASE_URL=your project url
VITE_SUPABASE_ANON_KEY=your anon public key
```

Then restart `npm run dev`.
