# Contributing Guide

**Last Updated:** 2026-02-18

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- A Supabase project (free tier works)
- A GitHub OAuth App (for GitHub sign-in)

## Environment Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd snippet-vault
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from your Supabase project dashboard under Settings > API.

### 3. Set up Supabase

#### Database tables

Run the migration to create the `profiles` table:

```sql
-- supabase/migrations/001_create_profiles.sql
-- Execute this in the Supabase SQL Editor
```

The `snippets` table must also exist with these columns:

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key, auto-generated |
| `title` | text | Required |
| `use_case` | text | Optional description |
| `code` | text | Required |
| `language` | text | Programming language identifier |
| `tags` | text[] | Array of tag strings |
| `created_at` | timestamptz | Auto-generated |
| `user_id` | uuid | FK to auth.users, set via RLS |

Ensure Row Level Security (RLS) is enabled on both tables so users only see their own data.

#### Authentication providers

In the Supabase dashboard:

1. **GitHub OAuth**: Authentication > Providers > GitHub
   - Create a GitHub OAuth App at https://github.com/settings/developers
   - Set the callback URL to `https://your-project.supabase.co/auth/v1/callback`
   - Copy the Client ID and Client Secret into Supabase

2. **Email/Password**: Authentication > Providers > Email
   - Ensure "Enable Email Signup" is on
   - Confirm email template is configured for email verification

3. **Redirect URLs**: Authentication > URL Configuration
   - Add `http://localhost:5173/auth/callback` for local development
   - Add your production URL equivalent for deployment

### 4. Start development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev` | `vite` | Start dev server with hot module replacement on port 5173 |
| `npm run build` | `vite build` | Production build to `dist/` directory |
| `npm run preview` | `vite preview` | Serve the production build locally for verification |
| `npm run lint` | `eslint .` | Run ESLint across all source files |

## Project Structure

```
snippet-vault/
  src/
    main.jsx                  # App entry point (BrowserRouter + AuthProvider)
    App.jsx                   # Route definitions and layout
    supabaseClient.js         # Supabase client initialization
    index.css                 # Global styles
    contexts/
      AuthContext.jsx          # Authentication state and methods
    constants/
      languages.js             # Language options shared across components
    pages/
      LoginPage.jsx            # Login/signup page
      LoginPage.module.css
      AuthCallback.jsx         # OAuth redirect handler
      VaultPage.jsx            # Main snippet management page
      VaultPage.module.css
      ProfilePage.jsx          # User profile editor
      ProfilePage.module.css
    components/
      Header.jsx               # Top navigation with search and filters
      Header.module.css
      SnippetForm.jsx           # Create/edit snippet form
      SnippetForm.module.css
      SnippetCard.jsx           # Snippet display card
      SnippetCard.module.css
      CodeBlock.jsx             # Syntax-highlighted code viewer
      CodeBlock.module.css
      EmptyState.jsx            # Empty state component
      EmptyState.module.css
      LoadingSpinner.jsx        # Loading indicator
      LoadingSpinner.module.css
  supabase/
    migrations/
      001_create_profiles.sql   # Profiles table, RLS policies, and auto-create trigger
  public/                       # Static assets
  docs/                         # Project documentation
```

## Development Workflow

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make changes** and verify locally with `npm run dev`.

3. **Run linting** before committing:
   ```bash
   npm run lint
   ```

4. **Commit** using conventional commit format:
   ```
   feat: add snippet export feature
   fix: resolve tag filter not clearing
   refactor: extract search logic into hook
   ```

5. **Push** and open a pull request against `main`.

## Code Conventions

- **CSS Modules**: Each component/page uses a co-located `.module.css` file for scoped styling
- **Immutable state updates**: Always use spread operator or functional setState, never mutate state directly
- **No console.log in production code**: Use toast notifications for user-facing messages
- **Shared constants**: Language options are defined once in `src/constants/languages.js`
- **AuthContext**: All authentication logic goes through `useAuth()` hook, not direct Supabase calls in components

## Adding a New Page

1. Create `src/pages/YourPage.jsx` and `src/pages/YourPage.module.css`
2. Add a `<Route>` entry in `src/App.jsx`
3. If the page requires authentication, wrap with a `Navigate` guard (see existing routes in `App.jsx`)

## Adding a New Component

1. Create `src/components/YourComponent.jsx` and `src/components/YourComponent.module.css`
2. Import and use in the relevant page component

## Database Changes

1. Create a new migration file in `supabase/migrations/` with incrementing number prefix (e.g., `002_add_favorites.sql`)
2. Include the full SQL for tables, RLS policies, and any triggers
3. Test the migration against your Supabase project via the SQL Editor
4. Document new columns/tables in CLAUDE.md
