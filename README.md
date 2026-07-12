# ScrapYard - Scrap Yard Manager

Digital ledger replacement for a Sri Lankan scrap/computer yard (Smart Scrap Management). Built with
Next.js 14 (App Router) + Tailwind + Supabase.

## What's inside

- **Load entry** (`/loads/new`) - select supplier, tick item types, enter KG,
  rate auto-fills, subtotal and grand total calculate live. Zero manual math.
- **Bill / load slip** (`/loads/[id]`) - print button and WhatsApp share button.
- **Supplier ledger** (`/suppliers`) - every supplier's running balance,
  drill into full transaction history.
- **Stock** (`/stock`) - live kg totals per item, updated automatically by a
  database trigger the moment a load is saved. The app never writes to stock
  directly, so it can't drift out of sync.
- **Reports** (`/reports`) - daily view and monthly view (spend, stock added,
  outstanding balances by supplier).
- **Settings** (`/settings`) - add/disable item types, edit default rates,
  change password.

## New: Business Expenses + Sell Stock (with profit tracking)

If you already set up Supabase before this update, run one more script:

1. Supabase Dashboard > SQL Editor > New query
2. Paste the contents of `supabase/migration-expenses-sales.sql` and run it
3. That's it - your existing data is untouched, this only adds new tables/columns

(New installs don't need this - it's already folded into `supabase/schema.sql`.)

**Expenses** (`/expenses`) - simple cash-out tracking: date, category (Wages,
Transport, Rent, Advance to supplier, Other), amount, note. Shows on Reports
too, broken down by category per month.

**Sell Stock** (`/sales/new`) - when you resell your aggregated scrap to a
factory/buyer: pick items from current stock, enter kg and your sell price.
The app shows expected profit live as you type, using each item's average
purchase cost (calculated automatically from your load history - a moving
average across every load that ever brought that item in). Stock reduces
automatically the moment you save, exactly like it increases when a load
comes in. You can't oversell more than what's physically in the yard - the
database blocks it.

Reports (`/reports`) now also shows Sales, Profit, Expenses, and a rough
"Net cash" figure (sales income minus what you paid suppliers minus
expenses) for both the daily and monthly views.

## Original setup

## 1. Create a Supabase project

1. Go to https://supabase.com, create a free project.
2. In the SQL Editor, paste the entire contents of `supabase/schema.sql` and run it.
   This creates all tables, the auto-stock/auto-total triggers, seeds a few
   starter item types (Iron, Tin, Wire, CPU, Aluminium, Copper, Battery), and
   sets up row-level security.
3. Go to **Authentication > Users** and manually add yourself as a user
   (email + password) - this is the Owner login. There's no public sign-up
   screen by design; only you should be able to log in.

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your project's values
from **Settings > API** in Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 - it will redirect to `/login`.

## 4. Deploy

Push to GitHub, then import the repo on Vercel (or Render, following your
usual GitHub-editor to auto-redeploy workflow). Add the same two environment
variables in the hosting dashboard. That's it - the app is stateless aside
from Supabase, so any host works.

## How the "zero calculations" guarantee works

All money and stock math lives in **Postgres triggers** (see
`supabase/schema.sql`), not in the frontend:

- Adding/editing/deleting a `load_items` row automatically recalculates that
  load's `total_amount` and `balance`, and automatically adjusts the `stock`
  table (and logs it to `stock_movements` for history).
- This means even if you later build a second app, a script, or edit data
  directly in the Supabase table editor, stock and totals stay correct -
  they aren't something the app has to remember to update.

## Notes / next steps you may want

- **Excel/PDF export** on the Settings page is a stub - happy to wire up a
  proper export (e.g. CSV of any date range, or a formatted PDF ledger) next.
- **WhatsApp share** currently opens `wa.me` with a pre-filled text summary
  of the bill (not a PDF attachment - wa.me links can't attach files).
  If you want an actual PDF sent, that needs the WhatsApp Business API.
- **Offline mode** was marked optional in the brief and isn't built - the
  app requires an internet connection since it talks to Supabase directly.
- Only one role (Owner/admin) exists right now, matching your solo-operator
  setup - every logged-in user has full access.
