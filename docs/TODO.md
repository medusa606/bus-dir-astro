# Meridian Directory - Development Todo

## Footer & Legal
- [x] Fill in privacy policy link → `/privacy`
- [x] Fill in terms of service link → `/terms`
- [x] Fill in accessibility statement link → `/accessibility`
- [x] Research and document GDPR requirements for the site → See `GDPR_REQUIREMENTS.md`
- [ ] Implement GDPR compliance features (e.g., cookie consent, data processing disclosures) → See `GDPR_IMPLEMENTATION_PLAN.md` for roadmap

## Google Maps Integration
- [X] Display Google rating and review count on listing pages

## Sub-Category Enhancements
- [X] Add sub-category filtering section below area pills
- [ ] Implement cuisine type filter functionality for search
- [ ] combine similar sub_cat for food eg fish and fish and chips
- [ ] set limit to number of sub_cats showing
- [ ] set limit to areas

## User Actions & Navigation
- [ ] Create contact/inquiry page for businesses to "List a Business"
- [ ] Update "List a Business" button to link to contact page

## Business Owner Features
- [ ] Create "Improve Your Visibility" button on listing pages
- [ ] Build business claim flow
- [ ] Implement affiliate program payment integration
- [ ] Allow business owners to manage their listings

## Restaurant Action Buttons
- [ ] Add "Book a Table" button for restaurants with dine_in flag
- [ ] Add "Order Take-Away" button for restaurants with takeaway flag
- [ ] Add "Shop Here" button for restaurants/businesses with online shop
- [ ] Create tracking system for action button clicks
- [ ] Build analytics dashboard for businesses to see traffic driven

## Tracking & Analytics
- [ ] Design click tracking schema for action buttons
- [ ] Implement click tracking on "Book a Table" button
- [ ] Implement click tracking on "Order Take-Away" button
- [ ] Implement click tracking on "Shop Here" button
- [ ] Create business analytics view to display traffic metrics
- [ ] Set up data collection and reporting

## Database Schema Updates (if needed)
- [ ] Review and update listings table schema for new fields if required
- [ ] Add click tracking table for analytics

## Marketing Strategy
- [ ] Define target audience and buyer personas
- [ ] Create content marketing plan (blog, guides, local guides)
- [ ] Develop social media strategy and content calendar
- [ ] Plan email marketing campaigns for business owners
- [ ] Create promotional materials for launch
- [ ] Establish partnerships with local influencers and organizations
- [ ] Plan paid advertising campaigns (Google Ads, social media ads)
- [ ] Create referral/word-of-mouth program
- [ ] Develop PR strategy and press release distribution
- [ ] Plan seasonal promotions and campaigns

## SEO Strategy
- [ ] Conduct keyword research for main categories and locations
- [ ] Optimize site structure for SEO (URL hierarchy, internal linking)
- [ ] Create SEO-friendly meta titles and descriptions for all pages
- [ ] Implement structured data (Schema.org markup) for listings
- [ ] Optimize Google Business Profile integration
- [ ] Create location-specific landing pages with local SEO optimization
- [ ] Build internal linking strategy for category and city pages
- [ ] Implement breadcrumb schema markup
- [ ] Create XML sitemap and robots.txt
- [ ] Set up Google Search Console and Bing Webmaster Tools
- [ ] Monitor and optimize Core Web Vitals
- [ ] Plan backlink acquisition strategy
- [ ] Create high-quality content for local search ranking
- [ ] Implement review and rating schema markup
- [ ] Optimize restaurant category pages with cuisine filters for long-tail keywords
- [ ] Monitor search rankings and optimize underperforming pages
- [ ] Plan local link building campaigns

## Content & Local Authority
- [ ] Create beginner's guides for each category
- [ ] Write city/area guides highlighting key businesses
- [ ] Create "Best of" lists for each category
- [ ] Develop case studies showing business success on platform
- [ ] Create FAQ content for common visitor questions
- [ ] Build blog with tips, trends, and local insights
- [ ] Create video content showcasing featured businesses

---

## Notes
- Consider implementing mixpanel or similar analytics tool for tracking
- Ensure all external links (booking, ordering, shop) are properly validated
- Plan affiliate program terms and conditions
- Coordinate with business owners on new features


# Other feedback to consider
- The reason: your current [...slug].astro catch-all is flexible, but it means your code has to disambiguate at runtime whether bristol/easton is a city+area or a city+category. Explicit routes make each page type's data requirements and metadata clear. With 4,000 listings, this clarity prevents bugs and makes your getStaticPaths() functions much cleaner:
src/pages/
├── index.astro                                    → /
└── [city]/
    ├── index.astro                                → /bristol/
    ├── [area]/
    │   ├── index.astro                            → /bristol/easton/
    │   ├── [category]/
    │   │   └── index.astro                        → /bristol/easton/food-and-produce/
    │   └── [business].astro                       → /bristol/easton/geppettos-pizza
    └── [category]/
        └── index.astro                            → /bristol/food-and-produce/

- at the bottom of the listing page, link to related listings and nearby listings

- [category] near me	"cafes near me"	Area page (if local pack)
- best [category] [area]	"best restaurants Bedminster"	Category+area page
- things to do in [area]	"things to do in Easton Bristol"	Area page
- These are your highest-value SEO pages because they target the searches with the most volume ("bakeries in Easton", "best cafes Bedminster"). Don't make them just a bare grid of listing cards: see @content-on-area-astro.txt
- explore @Free Traffic Growth Strategies.txt
- 