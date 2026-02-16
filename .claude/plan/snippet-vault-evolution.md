# Implementation Plan: Snippet Vault Evolution

## Current State Analysis

**Stack**: React 19 + Vite 7 + Supabase + CSS Modules (Zinc dark theme)
**Auth**: Magic link OTP only (`signInWithOtp` in `App.jsx:129`)
**Database**: Supabase `snippets` table (`id`, `title`, `code`, `language`, `use_case`, `tags`, `created_at`, user_id via RLS default)
**State**: All in `App.jsx` via useState/useEffect, no router
**Components**: LoginForm, Header, SnippetForm, SnippetCard, CodeBlock, EmptyState, LoadingSpinner
**Styling**: CSS Modules with Linear/Vercel-inspired glassmorphism dark theme

### Key Architecture Gaps
- No routing (single-page conditional render in App.jsx:260-361)
- No user profiles table
- `languageDisplayNames` duplicated in `Header.jsx:6-25` and `CodeBlock.jsx:6-25`
- Auth only supports magic link — no OAuth, no email/password
- No public/private snippet visibility
- No collections or favorites

---

## Task Type
- [x] Fullstack

---

## Phase 1: Auth & Accounts

### 1.1 Add React Router
**Why**: Needed for OAuth callback handling (`/auth/callback`), profile pages, public snippet URLs, and proper navigation.

**New dependency**: `react-router-dom`

**Steps**:
1. Install `react-router-dom`
2. Create route structure:
   ```
   /              → Home (snippet vault, requires auth)
   /login         → LoginPage
   /auth/callback → OAuth callback handler
   /profile       → User profile page
   /s/:id         → Public snippet view (Phase 4)
   ```
3. Refactor `main.jsx` to wrap `<App />` in `<BrowserRouter>`
4. Refactor `App.jsx`:
   - Extract auth state into a context provider (`AuthProvider`)
   - Move snippet logic into a dedicated `VaultPage` component
   - Add `<Routes>` with `<ProtectedRoute>` wrapper
5. Create `src/contexts/AuthContext.jsx`:
   - Manages session state via `onAuthStateChange`
   - Exposes `session`, `user`, `profile`, `signOut`, `loading`
   - Fetches user profile on auth state change

**Files**:
| File | Operation | Description |
|------|-----------|-------------|
| `src/main.jsx` | Modify | Wrap in BrowserRouter |
| `src/App.jsx` | Refactor | Extract to routes + AuthProvider |
| `src/contexts/AuthContext.jsx` | Create | Auth context with session + profile |
| `src/components/ProtectedRoute.jsx` | Create | Redirect to /login if unauthenticated |
| `src/pages/VaultPage.jsx` | Create | Move snippet logic from App.jsx |
| `src/pages/LoginPage.jsx` | Create | Auth page with multiple providers |
| `src/pages/AuthCallback.jsx` | Create | Handle OAuth redirect |
| `src/pages/ProfilePage.jsx` | Create | User profile management |

### 1.2 Replace Magic Link with GitHub OAuth + Email/Password
**Why**: Developers expect GitHub OAuth. Magic link is friction for a dev tool.

**Supabase Dashboard Config Required** (manual steps):
1. Enable GitHub OAuth provider in Supabase Auth settings
2. Create GitHub OAuth App at github.com/settings/developers
3. Set callback URL: `https://<supabase-project>.supabase.co/auth/v1/callback`
4. Enable email/password provider (likely already enabled)
5. Optionally enable Google OAuth

**Steps**:
1. Replace `LoginForm.jsx` with a new `LoginPage.jsx`:
   - "Continue with GitHub" button (primary, prominent)
   - Email/password form with sign up / sign in toggle
   - Optional: "Continue with Google" button
2. Add auth methods to `AuthContext`:
   ```pseudo
   signInWithGitHub() → supabase.auth.signInWithOAuth({ provider: 'github' })
   signInWithEmail(email, password) → supabase.auth.signInWithPassword(...)
   signUpWithEmail(email, password) → supabase.auth.signUp(...)
   signOut() → supabase.auth.signOut()
   ```
3. Create `AuthCallback.jsx` page:
   - Handles the redirect from OAuth providers
   - Parses hash fragment tokens
   - Redirects to `/` on success
4. Update `Header.jsx` to show user avatar + name from profile

**Files**:
| File | Operation | Description |
|------|-----------|-------------|
| `src/pages/LoginPage.jsx` | Create | Multi-provider login page |
| `src/pages/AuthCallback.jsx` | Create | OAuth redirect handler |
| `src/components/LoginForm.jsx` | Delete | Replaced by LoginPage |
| `src/components/LoginForm.module.css` | Delete | Replaced by LoginPage styles |
| `src/pages/LoginPage.module.css` | Create | Login page styles |
| `src/contexts/AuthContext.jsx` | Modify | Add OAuth + email/password methods |

### 1.3 User Profiles Table
**Why**: Store username, avatar, preferred languages, bio. GitHub OAuth provides avatar_url automatically.

**Supabase SQL Migration**:
```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  preferred_languages TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.raw_user_meta_data->>'preferred_username', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Steps**:
1. Run SQL migration in Supabase SQL editor
2. Create `ProfilePage.jsx` with editable fields:
   - Display name, username, bio, preferred languages (multi-select)
   - Avatar from GitHub (read-only, pulled from OAuth)
3. Fetch profile in `AuthContext` when session changes
4. Display avatar + name in `Header.jsx`

**Files**:
| File | Operation | Description |
|------|-----------|-------------|
| `src/pages/ProfilePage.jsx` | Create | Profile editing page |
| `src/pages/ProfilePage.module.css` | Create | Profile page styles |
| `src/contexts/AuthContext.jsx` | Modify | Fetch/update profile |
| `src/components/Header.jsx` | Modify | Show user avatar + profile link |
| `src/components/Header.module.css` | Modify | Avatar styles |

---

## Phase 2: Schema & Data Model

### 2.1 Enhanced Snippets Schema
**Supabase SQL Migration**:
```sql
-- Add new columns to snippets
ALTER TABLE public.snippets
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fork_source_id UUID REFERENCES public.snippets(id) ON DELETE SET NULL;

-- Collections table
CREATE TABLE public.collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Collection policies
CREATE POLICY "Users can view own collections"
  ON public.collections FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can manage own collections"
  ON public.collections FOR ALL
  USING (auth.uid() = user_id);

-- Updated snippet policies for public visibility
DROP POLICY IF EXISTS "Users can view own snippets" ON public.snippets;
CREATE POLICY "Users can view own or public snippets"
  ON public.snippets FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);
```

### 2.2 Frontend: Tags, Visibility, Favorites, Collections

**Steps**:
1. Update `SnippetForm.jsx`:
   - Add visibility toggle (public/private)
   - Add collection selector dropdown
   - Tags already implemented
2. Update `SnippetCard.jsx`:
   - Add favorite toggle button (heart icon)
   - Show public/private badge
   - Show collection name if assigned
3. Create `CollectionsPanel.jsx`:
   - Sidebar or dropdown to create/manage collections
   - Drag-and-drop snippets into collections (stretch goal)
4. Update `Header.jsx`:
   - Add "Favorites" filter button
   - Add collection filter dropdown
5. Update data layer in `VaultPage.jsx`:
   - Fetch with collection join
   - Toggle favorite via Supabase update
   - Filter by collection

**Files**:
| File | Operation | Description |
|------|-----------|-------------|
| `src/components/SnippetForm.jsx` | Modify | Add visibility toggle + collection selector |
| `src/components/SnippetCard.jsx` | Modify | Add favorite button + public badge |
| `src/components/CollectionsPanel.jsx` | Create | Collection management UI |
| `src/components/Header.jsx` | Modify | Add favorites + collection filters |
| `src/pages/VaultPage.jsx` | Modify | Enhanced data fetching + filtering |

### 2.3 Search Improvements

**Steps**:
1. Add Supabase full-text search using `tsvector`:
   ```sql
   -- Add search vector column
   ALTER TABLE public.snippets ADD COLUMN IF NOT EXISTS fts tsvector
     GENERATED ALWAYS AS (
       to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(use_case, ''))
     ) STORED;

   CREATE INDEX snippets_fts_idx ON public.snippets USING gin(fts);
   ```
2. Update search in `VaultPage.jsx` to use `.textSearch('fts', query)` for server-side search
3. Keep client-side code search as fallback for code content matching

---

## Phase 3: AI Features (Claude Cookbooks Integration)

### 3.1 Supabase Edge Function: Auto-Describe Snippets
**Pattern from**: `claude-cookbooks/capabilities/summarization/`

**Steps**:
1. Initialize Supabase Edge Functions: `supabase functions new describe-snippet`
2. Create edge function:
   ```typescript
   // supabase/functions/describe-snippet/index.ts
   import Anthropic from "@anthropic-ai/sdk"

   Deno.serve(async (req) => {
     const { code, language, title } = await req.json()
     const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

     const message = await client.messages.create({
       model: "claude-sonnet-4-5-20250929",
       max_tokens: 150,
       messages: [{
         role: "user",
         content: `You are a developer tools assistant. Given this ${language} code snippet titled "${title}", write a concise one-sentence description of what it does and when you'd use it. Just the description, nothing else.\n\n${code}`
       }]
     })

     return new Response(JSON.stringify({
       description: message.content[0].text
     }), { headers: { "Content-Type": "application/json" } })
   })
   ```
3. Add "Auto-describe" button in `SnippetForm.jsx` next to use_case field
4. Call edge function from React, populate use_case field with response

**Files**:
| File | Operation | Description |
|------|-----------|-------------|
| `supabase/functions/describe-snippet/index.ts` | Create | Claude summarization edge function |
| `src/components/SnippetForm.jsx` | Modify | Add auto-describe button |

### 3.2 Supabase Edge Function: Auto-Tag Snippets
**Pattern from**: `claude-cookbooks/capabilities/classification/`

**Steps**:
1. Create edge function `auto-tag`:
   ```typescript
   // Classify snippet and suggest tags
   // Input: { code, language, title }
   // Output: { tags: string[], category: string }
   ```
2. Add "Suggest tags" button in `SnippetForm.jsx`
3. Display suggested tags as clickable pills, user confirms which to add

### 3.3 Semantic Search with pgvector
**Pattern from**: `claude-cookbooks/third_party/Embeddings/` + `claude-cookbooks/capabilities/RAG/`

**Steps**:
1. Enable `pgvector` extension in Supabase:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ALTER TABLE public.snippets ADD COLUMN IF NOT EXISTS embedding vector(1536);
   CREATE INDEX snippets_embedding_idx ON public.snippets
     USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
   ```
2. Create edge function `embed-snippet`:
   - On snippet create/update, generate embedding via Voyage AI or OpenAI embeddings API
   - Store in `embedding` column
3. Create edge function `semantic-search`:
   - Takes natural language query
   - Generates query embedding
   - Uses `<=>` cosine distance operator to find similar snippets
4. Add "AI Search" toggle in Header search bar
   - When enabled, search hits the semantic-search edge function
   - When disabled, uses existing text search

**Files**:
| File | Operation | Description |
|------|-----------|-------------|
| `supabase/functions/embed-snippet/index.ts` | Create | Generate embeddings on save |
| `supabase/functions/semantic-search/index.ts` | Create | Semantic search endpoint |
| `src/components/Header.jsx` | Modify | Add AI search toggle |
| `src/pages/VaultPage.jsx` | Modify | Semantic search integration |

---

## Phase 4: Social & Sharing

### 4.1 Public Snippet Pages
**Steps**:
1. Add route `/s/:id` for public snippet view
2. Create `PublicSnippetPage.jsx`:
   - Fetches snippet by ID (only if `is_public = true`)
   - Displays code with syntax highlighting
   - Shows author info from profiles table
   - "Fork to my vault" button for logged-in users
   - Copy button, share URL display
3. Add "Share" button to `SnippetCard.jsx` (only for public snippets)
   - Copies `/s/:id` URL to clipboard

### 4.2 Browse Community Snippets
**Steps**:
1. Add route `/explore` for browsing public snippets
2. Create `ExplorePage.jsx`:
   - Grid of public snippets from all users
   - Filter by language, tags, popularity (view_count)
   - Search across public snippets
   - "Fork" button to copy to your vault

### 4.3 Fork/Copy Mechanism
**Steps**:
1. Add `fork_source_id` reference on snippets table (already in Phase 2 migration)
2. Create fork function:
   - Copies snippet to current user's vault
   - Sets `fork_source_id` to original
   - Shows "Forked from [username]" attribution on card

**Files**:
| File | Operation | Description |
|------|-----------|-------------|
| `src/pages/PublicSnippetPage.jsx` | Create | Public snippet view |
| `src/pages/PublicSnippetPage.module.css` | Create | Styles |
| `src/pages/ExplorePage.jsx` | Create | Community browsing |
| `src/pages/ExplorePage.module.css` | Create | Styles |
| `src/components/SnippetCard.jsx` | Modify | Add share + fork buttons |
| `src/App.jsx` | Modify | Add new routes |

---

## Implementation Order & Dependencies

```
Phase 1.1 (Router)
    |
    v
Phase 1.2 (Auth) ──> Phase 1.3 (Profiles)
                         |
                         v
                   Phase 2.1 (Schema)
                    |           |
                    v           v
              Phase 2.2      Phase 2.3
              (UI)           (Search)
                    |           |
                    v           v
              Phase 3.1      Phase 3.3
              (AI Describe)  (Semantic Search)
                    |
                    v
              Phase 3.2
              (Auto-tag)
                    |
                    v
              Phase 4.1 (Public Pages)
                    |
                    v
              Phase 4.2 (Explore)
                    |
                    v
              Phase 4.3 (Fork)
```

---

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| GitHub OAuth requires Supabase dashboard config | Document exact steps; test with local Supabase CLI first |
| Existing users with magic link lose access | Keep email/password as fallback; existing sessions remain valid |
| Schema migrations on live data | Run ALTER TABLE with IF NOT EXISTS; no destructive changes |
| Edge Function cold starts affect UX | Show loading states; use `Deno.serve` for fast startup |
| pgvector embedding costs | Only embed on create/update, not on every page load; use efficient model |
| `languageDisplayNames` duplication | Extract to shared `src/constants/languages.js` in Phase 1 refactor |
| Large context window for AI describe | Truncate code to first 200 lines before sending to Claude |

---

## New Dependencies

| Package | Phase | Purpose |
|---------|-------|---------|
| `react-router-dom` | 1 | Client-side routing |
| `@anthropic-ai/sdk` | 3 | Claude API (Edge Functions only, not client-side) |

---

## Environment Variables (New)

```env
# Existing
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# New (Supabase Edge Functions secrets, NOT in .env)
ANTHROPIC_API_KEY=...           # Set via: supabase secrets set ANTHROPIC_API_KEY=sk-...
VOYAGE_API_KEY=...              # Set via: supabase secrets set VOYAGE_API_KEY=... (Phase 3.3)
```

---

## Shared Code Extraction (Prep Step)

Before starting Phase 1, extract duplicated code:

1. Create `src/constants/languages.js`:
   - Move `languageDisplayNames` map (duplicated in `Header.jsx:6-25` and `CodeBlock.jsx:6-25`)
   - Move language `<option>` list from `SnippetForm.jsx:174-191`
2. Import from single source in all three files

---

## SESSION_ID
- CODEX_SESSION: N/A (codeagent-wrapper not available)
- GEMINI_SESSION: N/A (codeagent-wrapper not available)
