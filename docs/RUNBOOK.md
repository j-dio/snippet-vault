# Runbook

**Last Updated:** 2026-02-18

## Deployment

### Build for production

```bash
npm run build
```

This generates a static site in the `dist/` directory using Vite. The output is plain HTML/CSS/JS with no server-side requirements.

### Verify the build locally

```bash
npm run preview
```

This serves the `dist/` folder locally to verify the production build works correctly before deploying.

### Deploy to a static hosting provider

The `dist/` directory can be deployed to any static hosting service:

- **Vercel**: Connect the repo; Vite is auto-detected. Set environment variables in project settings.
- **Netlify**: Connect the repo; set build command to `npm run build` and publish directory to `dist`. Set environment variables in site settings.
- **GitHub Pages**: Use a GitHub Action to build and deploy the `dist/` directory.
- **Cloudflare Pages**: Connect the repo; set build command to `npm run build` and output directory to `dist`.

### Required environment variables in production

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g., `https://abc123.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public API key |

These must be set at **build time** since Vite inlines `import.meta.env.VITE_*` values during the build step. They are not read at runtime.

### Supabase production configuration

1. **Redirect URLs**: In Authentication > URL Configuration, add your production domain's callback URL:
   ```
   https://your-domain.com/auth/callback
   ```

2. **GitHub OAuth App**: Update the GitHub OAuth App's callback URL to point to your Supabase project, and the homepage URL to your production domain.

3. **SPA routing**: Since this is a single-page app using client-side routing, configure your hosting provider to redirect all paths to `index.html`. Most providers handle this automatically, but if not:
   - **Netlify**: Create a `public/_redirects` file containing `/* /index.html 200`
   - **Vercel**: Add a `vercel.json` with rewrites (usually auto-detected for Vite)
   - **Nginx**: Use `try_files $uri $uri/ /index.html`

## Common Issues and Fixes

### "Error fetching snippets" after login

**Cause**: The `snippets` table does not exist, or RLS policies are missing/misconfigured.

**Fix**:
1. Verify the `snippets` table exists in Supabase Table Editor
2. Confirm RLS is enabled and policies allow authenticated users to SELECT/INSERT/UPDATE/DELETE their own rows
3. Check that the `user_id` column has a default value of `auth.uid()` or is set by an RLS policy

### GitHub OAuth redirects to a blank page

**Cause**: The redirect URL in Supabase does not match the actual application URL.

**Fix**:
1. In Supabase dashboard > Authentication > URL Configuration, verify the redirect URL includes `/auth/callback`
2. For local development: `http://localhost:5173/auth/callback`
3. For production: `https://your-domain.com/auth/callback`
4. Ensure the GitHub OAuth App's callback URL points to `https://your-project.supabase.co/auth/v1/callback`

### "Profile not found" or profile data not loading

**Cause**: The `profiles` table or the auto-create trigger was not set up.

**Fix**:
1. Run the migration in `supabase/migrations/001_create_profiles.sql` via the Supabase SQL Editor
2. For existing users who signed up before the migration, manually insert a profile row:
   ```sql
   INSERT INTO public.profiles (id)
   SELECT id FROM auth.users
   WHERE id NOT IN (SELECT id FROM public.profiles);
   ```

### "Username is already taken" error on profile page

**Cause**: The `username` column has a UNIQUE constraint, and the chosen username is already in use.

**Fix**: This is expected behavior. The user should choose a different username. No code change needed.

### Build fails with "env is not defined" or blank page in production

**Cause**: Environment variables were not set at build time, or the variable names do not start with `VITE_`.

**Fix**:
1. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in the hosting provider's environment settings
2. Confirm the variables are available **during the build step** (not just at runtime)
3. Trigger a new build/deploy after setting the variables

### Styles look broken or CSS not loading

**Cause**: CSS Module class names are hashed at build time. Direct class name strings will not work.

**Fix**: Always import styles from `.module.css` files and use `styles.className` syntax:
```jsx
import styles from "./MyComponent.module.css";
// Correct: <div className={styles.container}>
// Wrong:   <div className="container">
```

### Toast notifications not appearing

**Cause**: The `<Toaster>` component might be missing from the render tree.

**Fix**: Verify that `<Toaster>` is rendered in `src/App.jsx` (it currently is). If you add new pages outside the `App` component tree, they will not receive toasts.

### OAuth works but email/password sign-up does not send confirmation

**Cause**: Email templates are not configured, or SMTP is not set up in Supabase.

**Fix**:
1. Supabase dashboard > Authentication > Email Templates: verify the confirmation email template exists
2. For custom SMTP: Settings > Authentication > SMTP Settings
3. Check the Supabase logs for email delivery errors

## Health Checks

### Verify Supabase connectivity

Open the browser console on the running app and check for network errors to `supabase.co`. A 401 on data requests when not logged in is expected (RLS).

### Verify authentication flow

1. Open the app in an incognito window
2. Confirm the login page loads at `/login`
3. Test GitHub OAuth sign-in (should redirect and return)
4. Test email/password sign-up (should show confirmation message)
5. After login, confirm redirect to `/` and snippets load

### Verify CRUD operations

1. Create a new snippet with title, code, language, and tags
2. Verify it appears in the grid
3. Edit the snippet and confirm changes persist
4. Delete the snippet and confirm removal
5. Test search, language filter, and tag filter

## Rollback

Since this is a static site with a Supabase backend:

- **Frontend rollback**: Redeploy a previous build artifact or revert the git commit and rebuild
- **Database rollback**: Supabase does not auto-rollback migrations. Write a reverse migration SQL script and execute it in the SQL Editor. Always test migrations on a staging project first.
