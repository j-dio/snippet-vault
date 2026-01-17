# Snippet Vault

A modern React application for storing and managing code snippets with Supabase authentication and database backend.

## Features

- **Magic Link Authentication** - Secure passwordless login via email
- **Code Snippet Management** - Create, edit, delete, and copy code snippets
- **Syntax Highlighting** - Support for 16+ programming languages with VS Code-inspired dark theme
- **Search & Filter** - Search by title/code, filter by language, and multi-select tag filtering
- **Sorting Options** - Sort by date, title, or language
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Accessibility** - ARIA labels, semantic HTML, and keyboard navigation support
- **Smooth Animations** - Fade-in cards, slide-down dialogs, and transitions

## Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Supabase (Auth + PostgreSQL)
- **Styling:** CSS Modules with custom properties
- **Notifications:** react-hot-toast
- **Syntax Highlighting:** react-syntax-highlighter

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/snippet-vault.git
   cd snippet-vault
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

### Database Setup

Run the migration script in your Supabase SQL editor to create the required table and indexes:

```sql
-- See migration.sql for the complete schema
```

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   ├── CodeBlock.jsx       # Syntax highlighted code display
│   ├── EmptyState.jsx      # Empty/no results states
│   ├── Header.jsx          # App header with search/filters
│   ├── LoadingSpinner.jsx  # Loading indicator
│   ├── LoginForm.jsx       # Magic link login form
│   ├── SnippetCard.jsx     # Individual snippet display
│   └── SnippetForm.jsx     # Add/edit snippet form
├── styles/
│   └── theme.module.css    # CSS custom properties
├── App.jsx                 # Main application component
├── App.module.css          # App-level styles
├── index.css               # Global styles
└── supabaseClient.js       # Supabase client configuration
```

## License

MIT
