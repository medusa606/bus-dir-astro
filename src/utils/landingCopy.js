/**
 * landingCopy.js
 *
 * Generates SEO metadata and editorial prose for "best of" landing pages
 * that don't have a hand-crafted markdown file in src/content/landing/.
 * All copy is built from live listing data so every page has unique content.
 */

import { slugToTitle } from './helpers.js';
import { TOPIC_TAXONOMY } from './topicTaxonomy.js';

const CURRENT_YEAR = new Date().getFullYear();

/** "Best Cafes in Bristol" / "Best Breakfast in Clifton, Bristol" */
export function buildLandingH1(citySlug, areaSlug, topicSlug) {
    const topic = TOPIC_TAXONOMY[topicSlug];
    const label = topic?.pluralLabel || slugToTitle(topicSlug);
    const cityTitle = slugToTitle(citySlug);

    if (areaSlug) {
        const areaTitle = slugToTitle(areaSlug);
        return `Best ${label} in ${areaTitle}, ${cityTitle}`;
    }
    return `Best ${label} in ${cityTitle}`;
}

/** "Best Cafes in Bristol 2026 — Locale" */
export function buildSeoTitle(citySlug, areaSlug, topicSlug) {
    const h1 = buildLandingH1(citySlug, areaSlug, topicSlug);
    return `${h1} ${CURRENT_YEAR} — Locale`;
}

/**
 * "Discover the best cafes in Bristol, hand-picked by our local team.
 *  From [TopName] to [SecondName] — find your new favourite spot."
 */
export function buildMetaDescription(citySlug, areaSlug, topicSlug, count, topPicks) {
    const topic = TOPIC_TAXONOMY[topicSlug];
    const label = topic?.pluralLabel?.toLowerCase() || slugToTitle(topicSlug).toLowerCase();
    const cityTitle = slugToTitle(citySlug);
    const locationPhrase = areaSlug
        ? `in ${slugToTitle(areaSlug)}, ${cityTitle}`
        : `in ${cityTitle}`;

    const topName = topPicks?.[0]?.name;
    const secondName = topPicks?.[1]?.name;

    let tail = '';
    if (topName && secondName) {
        tail = ` From ${topName} to ${secondName} — find your new favourite.`;
    } else if (topName) {
        tail = ` Featuring ${topName} and more.`;
    }

    return `Discover the best ${label} ${locationPhrase}, hand-picked by our local team.${tail}`;
}

/**
 * Generates a 2–3 paragraph intro using live listing data.
 * Pulls editorial notes from editors_choice listings to make it feel authentic.
 */
export function buildTemplateIntro(citySlug, areaSlug, topicSlug, count, topPicks) {
    const topic = TOPIC_TAXONOMY[topicSlug];
    const label = topic?.pluralLabel?.toLowerCase() || slugToTitle(topicSlug).toLowerCase();
    const singularLabel = topic?.label?.toLowerCase() || slugToTitle(topicSlug).toLowerCase();
    const cityTitle = slugToTitle(citySlug);
    const locationPhrase = areaSlug
        ? `${slugToTitle(areaSlug)}, ${cityTitle}`
        : cityTitle;

    const countPhrase = count > 10
        ? `With over ${Math.floor(count / 5) * 5} options to choose from`
        : `With ${count} carefully chosen picks`;

    const editorialPick = topPicks?.find(l => l.ranking_tier === 'editors_choice');
    const editorialNote = editorialPick?.editors_notes
        ? `Take ${editorialPick.name} — ${editorialPick.editors_notes.split('.')[0].trim().toLowerCase()}.`
        : '';

    return `${locationPhrase} has a lot to offer when it comes to ${label}, and sorting the brilliant from the ordinary takes local knowledge. This is our curated rundown — not an algorithm, not a sponsored ranking, just places we genuinely rate.\n\n${countPhrase}, we've done the legwork so you don't have to. Every listing here has been reviewed by our team and meets our bar for quality, atmosphere, and value. ${editorialNote}`.trim();
}

/**
 * Generates 2 editorial body sections from the top editors_choice and recommended picks.
 * Returns array of { heading, body } matching the markdown sections[] schema.
 */
export function buildTemplateSections(topPicks, topicSlug) {
    const topic = TOPIC_TAXONOMY[topicSlug];
    const label = topic?.label?.toLowerCase() || slugToTitle(topicSlug).toLowerCase();
    const sections = [];

    const editorialPicks = topPicks?.filter(l => l.ranking_tier === 'editors_choice').slice(0, 2) || [];
    const recommended = topPicks?.filter(l => l.ranking_tier === 'recommended').slice(0, 2) || [];

    if (editorialPicks.length > 0) {
        const names = editorialPicks.map(l => l.name).join(' and ');
        const note = editorialPicks[0].editors_notes || editorialPicks[0].description || '';
        const excerpt = note ? note.split('.').slice(0, 2).join('.').trim() + '.' : '';
        sections.push({
            heading: `Our top picks for ${label}`,
            body: `${names} stand${editorialPicks.length === 1 ? 's' : ''} out as the pick${editorialPicks.length > 1 ? 's' : ''} of the bunch. ${excerpt} These are the places we keep coming back to — and the ones our readers ask about most.`,
        });
    }

    if (recommended.length > 0) {
        const names = recommended.map(l => l.name).join(' and ');
        sections.push({
            heading: 'Also worth knowing about',
            body: `Beyond our top picks, ${names} ${recommended.length === 1 ? 'is' : 'are'} well worth your time. Consistently well-reviewed and popular with locals, ${recommended.length === 1 ? 'it earns' : 'they earn'} a place on any shortlist.`,
        });
    }

    return sections;
}

/**
 * Full content object for pages without a markdown file.
 * Matches the structure of a parsed content collection entry's data + body.
 */
export function buildTemplateContent(citySlug, areaSlug, topicSlug, listings) {
    const TIER_ORDER = { editors_choice: 0, recommended: 1, google_ranked: 2, standard: 3 };
    const topPicks = [...listings]
        .sort((a, b) => (TIER_ORDER[a.ranking_tier] ?? 3) - (TIER_ORDER[b.ranking_tier] ?? 3))
        .slice(0, 6);

    const topic = TOPIC_TAXONOMY[topicSlug];
    const count = listings.length;

    return {
        title: buildLandingH1(citySlug, areaSlug, topicSlug),
        seoTitle: buildSeoTitle(citySlug, areaSlug, topicSlug),
        description: buildMetaDescription(citySlug, areaSlug, topicSlug, count, topPicks),
        intro: buildTemplateIntro(citySlug, areaSlug, topicSlug, count, topPicks),
        sections: buildTemplateSections(topPicks, topicSlug),
        featuredIds: [],
        topic: topicSlug,
        topicType: topic?.queryType?.startsWith('tags') ? 'tag' : topic?.queryType === 'category_slug' ? 'category' : 'area',
        city: citySlug,
        area: areaSlug || null,
    };
}
