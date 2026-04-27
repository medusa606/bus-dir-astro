-- Add image_category column to store the matched illustration type
-- This enables the curation tool to display and filter by image category
ALTER TABLE listings ADD COLUMN IF NOT EXISTS image_category TEXT;

-- Populate image_category based on tag matching against TAG_TO_IMAGE_RULES
-- Rules are in priority order — first match wins
UPDATE listings
SET image_category = (
    CASE
        -- Health & Wellbeing
        WHEN tags && ARRAY['dentist', 'dental'] THEN 'dentist'
        WHEN tags && ARRAY['pharmacy', 'chemist', 'dispensary'] THEN 'pharmacy'
        WHEN tags && ARRAY['sauna', 'spa', 'steam_room'] THEN 'sauna'
        WHEN tags && ARRAY['yoga', 'pilates', 'meditation', 'wellness'] THEN 'yoga'
        WHEN tags && ARRAY['nail_salon', 'nails', 'manicure', 'pedicure'] THEN 'nail-salon'
        WHEN tags && ARRAY['barbershop', 'barber'] THEN 'barbershop'
        WHEN tags && ARRAY['hairdresser', 'hair_salon', 'salon'] THEN 'hairdresser'

        -- Food & Produce
        WHEN tags && ARRAY['cheesemonger', 'cheese'] THEN 'cheesemonger'
        WHEN tags && ARRAY['deli', 'delicatessen'] THEN 'deli'
        WHEN tags && ARRAY['sweet_shop', 'sweets', 'confectionery', 'candy'] THEN 'sweet-shop'
        WHEN tags && ARRAY['bakery', 'cake', 'donut', 'flapjacks'] THEN 'bakery'
        WHEN tags && ARRAY['supermarket'] THEN 'supermarket'
        WHEN tags && ARRAY['greengrocer', 'produce', 'veg', 'vegetables', 'fruit'] THEN 'greengrocer'
        WHEN tags && ARRAY['corner_shop', 'convenience_store'] THEN 'corner-shop'

        -- Drinks & Brewing
        WHEN tags && ARRAY['wine_bar', 'wine', 'cocktail_bar', 'cellar'] THEN 'wine-bar'
        WHEN tags && ARRAY['off_license', 'off_licence', 'bottle_shop', 'liquor_store'] THEN 'off-license'
        WHEN tags && ARRAY['brewery', 'microbrewery'] THEN 'brewery'
        WHEN tags && ARRAY['pub', 'bar', 'tavern', 'taproom'] THEN 'pub'

        -- Cafes
        WHEN tags && ARRAY['cafe', 'coffee_shop', 'coffee', 'tea', 'bubble_tea', 'brunch', 'juice'] THEN 'cafe'

        -- Restaurants
        WHEN tags && ARRAY['ice_cream', 'frozen_yogurt', 'dessert'] THEN 'ice-cream'
        WHEN tags && ARRAY['restaurant', 'fast_food', 'takeaway'] THEN 'restaurant'

        -- Fitness & Sports
        WHEN tags && ARRAY['golf', 'golf_course'] THEN 'golf-course'
        WHEN tags && ARRAY['swimming', 'pool', 'swimming_pool'] THEN 'swimming-pool'
        WHEN tags && ARRAY['gym', 'fitness', 'crossfit', 'personal_trainer'] THEN 'fitness-studio'

        -- Entertainment
        WHEN tags && ARRAY['cinema'] THEN 'cinema'
        WHEN tags && ARRAY['theatre', 'theater'] THEN 'theater'
        WHEN tags && ARRAY['live_music', 'music_venue'] THEN 'live-music'
        WHEN tags && ARRAY['nightclub', 'club'] THEN 'nightclub'

        -- Plants & Garden
        WHEN tags && ARRAY['florist', 'flowers', 'floristry'] THEN 'florist'
        WHEN tags && ARRAY['garden_centre', 'nursery', 'garden'] THEN 'garden-centre'
        WHEN tags && ARRAY['landscaping', 'landscaper', 'groundskeeper', 'lawn'] THEN 'landscaping'

        -- Services
        WHEN tags && ARRAY['shoe_shop', 'shoes', 'footwear', 'cobbler'] THEN 'shoe-shop'
        WHEN tags && ARRAY['charity_shop', 'charity', 'thrift'] THEN 'charity-shop'
        WHEN tags && ARRAY['dry_cleaning'] THEN 'dry-cleaning'
        WHEN tags && ARRAY['tailor', 'alterations'] THEN 'tailors'
        WHEN tags && ARRAY['launderette', 'laundromat', 'laundrette'] THEN 'launderette'

        -- Craft & Makers
        WHEN tags && ARRAY['pottery', 'ceramics'] THEN 'pottery'
        WHEN tags && ARRAY['weaving', 'textiles', 'knitting', 'sewing'] THEN 'weaver'

        -- Art & Design
        WHEN tags && ARRAY['photography', 'photographer', 'photography_studio'] THEN 'photography-studio'
        WHEN tags && ARRAY['arts_centre', 'gallery', 'studio'] THEN 'gallery'
        WHEN tags && ARRAY['painter', 'artist'] THEN 'painter'

        -- Home & Interiors
        WHEN tags && ARRAY['antiques', 'vintage', 'secondhand'] THEN 'antiques'
        WHEN tags && ARRAY['carpet', 'carpet_shop', 'rugs', 'flooring'] THEN 'carpet-shop'
        WHEN tags && ARRAY['lighting', 'lighting_shop', 'lamps'] THEN 'lighting-shop'
        WHEN tags && ARRAY['paint_supplies', 'paint_shop', 'decorating'] THEN 'paint-supplies'
        WHEN tags && ARRAY['tile_shop', 'tiles', 'tiling'] THEN 'tile-shop'
        WHEN tags && ARRAY['sofa', 'sofa_shop', 'sofas', 'couch'] THEN 'sofa-shop'
        WHEN tags && ARRAY['interiors', 'furniture', 'home_goods', 'homeware'] THEN 'home'

        ELSE NULL
    END
);

-- Verify: Show distribution of assigned image categories
SELECT image_category, COUNT(*) as count
FROM listings
WHERE image_category IS NOT NULL
GROUP BY image_category
ORDER BY count DESC;
