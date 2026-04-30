## ✅ Data Normalization - COMPLETE

Your sub_category values have been normalized to lowercase:
- Kebab → kebab
- American → american  
- Asian → asian
- Sandwich → sandwich
- And 30 more records...

**34 records updated** ✅

---

## ⚠️ RLS Policy - NEEDS MANUAL FIX

The anon key (used by your website) is returning 0 records due to RLS (Row-Level Security) policy.

### Quick Fix (2 minutes):

1. **Go to**: https://app.supabase.com/project/ecrupbqtlhuisqmybleu
2. **Click**: "SQL Editor" (left sidebar)
3. **Click**: "+ New Query"
4. **Paste this SQL**:
```sql
DROP POLICY IF EXISTS "anon_select_listings" ON public.listings;
CREATE POLICY "anon_select_listings" ON public.listings
  FOR SELECT
  USING (true);
```
5. **Click**: "Run"

This creates a SELECT policy that allows anonymous users to read the listings table (no modifications, only reads).

### After Running the SQL:

```bash
npm run build
npm run preview
```

Your website should now display all listings!

---

## Why This Happens

- **Service key** (admin): Can write/update data ✅
- **Anon key** (website): Needs RLS policy to read data ⚠️
- RLS was blocking reads → now we allow them with a policy

This keeps your data secure (no unauthorized writes) while allowing public read access.
