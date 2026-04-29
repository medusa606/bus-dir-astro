-- Fix restaurant sub_categories by reading directly from the tags column.
-- This is more reliable than a CSV-based import as it covers all rows in the database.
-- Priority order: specific cuisine tags win; fallback to 'General' for generic tags.

UPDATE listings
SET sub_category = CASE
  -- Cuisine-specific tags (checked first, most specific wins)
  WHEN tags::text ILIKE '%"sushi"%'                                 THEN 'Sushi'
  WHEN tags::text ILIKE '%"pizza"%'                                 THEN 'Pizza'
  WHEN tags::text ILIKE '%"burger"%'                                THEN 'Burgers'
  WHEN tags::text ILIKE '%"chinese"%'                               THEN 'Chinese'
  WHEN tags::text ILIKE '%"thai"%'                                  THEN 'Thai'
  WHEN tags::text ILIKE '%"indian"%'                                THEN 'Indian'
  WHEN tags::text ILIKE '%"mexican"%'                               THEN 'Mexican'
  WHEN tags::text ILIKE '%"italian"%'                               THEN 'Italian'
  WHEN tags::text ILIKE '%"french"%'                                THEN 'French'
  WHEN tags::text ILIKE '%"spanish"%'                               THEN 'Spanish'
  WHEN tags::text ILIKE '%"japanese"%'                              THEN 'Japanese'
  WHEN tags::text ILIKE '%"korean"%'                                THEN 'Korean'
  WHEN tags::text ILIKE '%"vietnamese"%'                            THEN 'Vietnamese'
  WHEN tags::text ILIKE '%"turkish"%'                               THEN 'Turkish'
  WHEN tags::text ILIKE '%"greek"%'                                 THEN 'Greek'
  WHEN tags::text ILIKE '%"portuguese"%'                            THEN 'Portuguese'
  WHEN tags::text ILIKE '%"lebanese"%'                              THEN 'Lebanese'
  WHEN tags::text ILIKE '%"moroccan"%'                              THEN 'Moroccan'
  WHEN tags::text ILIKE '%"fish_and_chips"%'                        THEN 'Fish & Chips'
  WHEN tags::text ILIKE '%"noodle"%' OR
       tags::text ILIKE '%"noodles"%'                               THEN 'Noodles'
  WHEN tags::text ILIKE '%"ramen"%'                                 THEN 'Ramen'
  WHEN tags::text ILIKE '%"pasta"%'                                 THEN 'Pasta'
  WHEN tags::text ILIKE '%"tapas"%'                                 THEN 'Tapas'
  WHEN tags::text ILIKE '%"seafood"%'                               THEN 'Seafood'
  WHEN tags::text ILIKE '%"steak"%'                                 THEN 'Steak'
  WHEN tags::text ILIKE '%"bbq"%'     OR
       tags::text ILIKE '%"barbeque"%' OR
       tags::text ILIKE '%"barbecue"%'                              THEN 'BBQ'
  WHEN tags::text ILIKE '%"chicken"%'                               THEN 'Chicken'
  WHEN tags::text ILIKE '%"vegetarian"%'                            THEN 'Vegetarian'
  WHEN tags::text ILIKE '%"vegan"%'                                 THEN 'Vegan'
  -- Generic fallback for anything else in the restaurant category
  ELSE 'General'
END,
sub_category_slug = CASE
  WHEN tags::text ILIKE '%"sushi"%'                                 THEN 'sushi'
  WHEN tags::text ILIKE '%"pizza"%'                                 THEN 'pizza'
  WHEN tags::text ILIKE '%"burger"%'                                THEN 'burgers'
  WHEN tags::text ILIKE '%"chinese"%'                               THEN 'chinese'
  WHEN tags::text ILIKE '%"thai"%'                                  THEN 'thai'
  WHEN tags::text ILIKE '%"indian"%'                                THEN 'indian'
  WHEN tags::text ILIKE '%"mexican"%'                               THEN 'mexican'
  WHEN tags::text ILIKE '%"italian"%'                               THEN 'italian'
  WHEN tags::text ILIKE '%"french"%'                                THEN 'french'
  WHEN tags::text ILIKE '%"spanish"%'                               THEN 'spanish'
  WHEN tags::text ILIKE '%"japanese"%'                              THEN 'japanese'
  WHEN tags::text ILIKE '%"korean"%'                                THEN 'korean'
  WHEN tags::text ILIKE '%"vietnamese"%'                            THEN 'vietnamese'
  WHEN tags::text ILIKE '%"turkish"%'                               THEN 'turkish'
  WHEN tags::text ILIKE '%"greek"%'                                 THEN 'greek'
  WHEN tags::text ILIKE '%"portuguese"%'                            THEN 'portuguese'
  WHEN tags::text ILIKE '%"lebanese"%'                              THEN 'lebanese'
  WHEN tags::text ILIKE '%"moroccan"%'                              THEN 'moroccan'
  WHEN tags::text ILIKE '%"fish_and_chips"%'                        THEN 'fish-and-chips'
  WHEN tags::text ILIKE '%"noodle"%' OR
       tags::text ILIKE '%"noodles"%'                               THEN 'noodles'
  WHEN tags::text ILIKE '%"ramen"%'                                 THEN 'ramen'
  WHEN tags::text ILIKE '%"pasta"%'                                 THEN 'pasta'
  WHEN tags::text ILIKE '%"tapas"%'                                 THEN 'tapas'
  WHEN tags::text ILIKE '%"seafood"%'                               THEN 'seafood'
  WHEN tags::text ILIKE '%"steak"%'                                 THEN 'steak'
  WHEN tags::text ILIKE '%"bbq"%'     OR
       tags::text ILIKE '%"barbeque"%' OR
       tags::text ILIKE '%"barbecue"%'                              THEN 'bbq'
  WHEN tags::text ILIKE '%"chicken"%'                               THEN 'chicken'
  WHEN tags::text ILIKE '%"vegetarian"%'                            THEN 'vegetarian'
  WHEN tags::text ILIKE '%"vegan"%'                                 THEN 'vegan'
  ELSE 'general'
END
WHERE category_slug = 'restaurants';

-- Verify the results
SELECT sub_category, count(*) AS count
FROM listings
WHERE category_slug = 'restaurants'
GROUP BY sub_category
ORDER BY count DESC;
