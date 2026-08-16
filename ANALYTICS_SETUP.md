# Analytics Setup Instructions

## Overview
The analytics system tracks visitor information and displays metrics from your Supabase database.

## Database Setup

### 1. Create all required tables

Run both migration files in your Supabase SQL Editor:

**Option A: Via Supabase Dashboard**
1. Navigate to Supabase Dashboard > SQL Editor
2. Copy and paste the contents of: `supabase/migrations/create_page_views_table.sql`
3. Run the query
4. Copy and paste the contents of: `supabase/migrations/create_core_tables.sql`
5. Run the query

**Option B: Via CLI**
```bash
supabase db push
```

### 2. Required Supabase Tables

The analytics dashboard displays data from these tables:

- **page_views** - Visitor tracking with paths, referrers, and timestamps
- **children** - Child profiles with names, pronouns, reading levels, and interests
- **parents** - Parent accounts with email addresses
- **chapters** - Story chapters linked to sagas
- **choices** - User choices made in stories
- **sagas** - Ongoing story sagas for each child

All tables are created by the migrations above with proper RLS policies for security.

## How It Works

### Visitor Tracking
- When a user visits the site, a unique `visitor_id` is generated and stored in `localStorage`
- Each page view is recorded in the `page_views` table with:
  - `visitor_id` - Unique identifier for the visitor
  - `visited_at` - Timestamp of the visit
  - `path` - URL path visited
  - `referrer` - Where the visitor came from
  - `user_agent` - Browser information

### Analytics Display
The analytics dashboard (password: `lucky123`) shows:

**Tabbed Interface** - Switch between different data tables:
1. **Page Views** - All visitor page views with IDs, paths, timestamps, and referrers
2. **Children** - Child profiles with names, pronouns, reading levels, and interests
3. **Parents** - Parent accounts with email addresses
4. **Chapters** - Story chapters with saga IDs, chapter numbers, and content previews
5. **Choices** - User choices with chapter IDs, child IDs, and choice text
6. **Sagas** - Story sagas with child IDs, titles, and status

Each tab shows the actual table data, not just counts.

## Privacy & Data Collection

- Visitor IDs are random UUIDs, not personally identifiable
- No cookies are used (only localStorage)
- User agent and referrer are collected for analytics only
- All data stays in your Supabase database

## Testing

1. Visit your site in a new incognito window
2. Check browser localStorage for `nq_visitor_id`
3. Visit the analytics page and verify the visitor was tracked
4. Visit again in a few minutes - should show 2 visits for same visitor ID

## Troubleshooting

**Tables showing "No [table] yet":**
- This means the table exists but is empty (no data has been added)
- Run the migrations above to create the tables if they don't exist
- Check browser console (F12) for error messages
- If you see error messages on the analytics page, the tables may not exist

**Query errors appearing:**
- Open browser console (F12) and look for "Query errors:" messages
- Common error: "relation [table] does not exist" - run the migrations
- Common error: "permission denied" - check RLS policies allow anon reads
- The error message will tell you which specific table has the issue

**Visitor tracking not working:**
- Check that the `page_views` table was created successfully
- Verify RLS policies allow anonymous inserts and reads
- Check browser localStorage for `nq_visitor_id`
- Check browser console for "Error tracking visitor" messages
