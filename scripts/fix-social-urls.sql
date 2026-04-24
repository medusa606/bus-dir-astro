-- Fix social media columns that store bare handles instead of full URLs.
-- Run against the businesses table in Supabase.
-- Each UPDATE only touches rows where the value exists but lacks a protocol prefix.

UPDATE listings
SET social_instagram = 'https://www.instagram.com/' || social_instagram
WHERE social_instagram IS NOT NULL
  AND social_instagram <> ''
  AND social_instagram NOT LIKE 'http%';

UPDATE listings
SET social_facebook = 'https://www.facebook.com/' || social_facebook
WHERE social_facebook IS NOT NULL
  AND social_facebook <> ''
  AND social_facebook NOT LIKE 'http%';

UPDATE listings
SET social_twitter = 'https://x.com/' || social_twitter
WHERE social_twitter IS NOT NULL
  AND social_twitter <> ''
  AND social_twitter NOT LIKE 'http%';

-- TikTok handles may be stored as 'handle' or '@handle'; normalise to 'https://www.tiktok.com/@handle'
UPDATE listings
SET social_tiktok = 'https://www.tiktok.com/@' || LTRIM(social_tiktok, '@')
WHERE social_tiktok IS NOT NULL
  AND social_tiktok <> ''
  AND social_tiktok NOT LIKE 'http%';

-- LinkedIn company pages; adjust the prefix if personal profiles (/in/) are also stored
UPDATE listings
SET social_linkedin = 'https://www.linkedin.com/company/' || social_linkedin
WHERE social_linkedin IS NOT NULL
  AND social_linkedin <> ''
  AND social_linkedin NOT LIKE 'http%';

-- YouTube handles may be stored as 'handle' or '@handle'
UPDATE listings
SET social_youtube = 'https://www.youtube.com/@' || LTRIM(social_youtube, '@')
WHERE social_youtube IS NOT NULL
  AND social_youtube <> ''
  AND social_youtube NOT LIKE 'http%';
