import type { Folder } from '@/types/folder';

export type KeywordContext = {
  url?: string;
  title?: string | null;
  description?: string | null;
  siteName?: string | null;
  domain?: string | null;
  metadataKeywords?: string[];
};

const STOP_WORDS = new Set([
  'about', 'above', 'across', 'after', 'again', 'against', 'all', 'almost', 'alone', 'along',
  'already', 'also', 'although', 'always', 'among', 'and', 'another', 'any', 'anybody',
  'anyone', 'anything', 'anywhere', 'are', 'area', 'areas', 'around', 'article', 'ask',
  'asked', 'asking', 'asks', 'away', 'back', 'backed', 'backing', 'backs', 'became',
  'because', 'become', 'becomes', 'been', 'before', 'began', 'behind', 'being', 'beings',
  'best', 'better', 'between', 'both', 'browse', 'business', 'but', 'came', 'cannot', 'case',
  'cases', 'certain', 'certainly', 'clear', 'clearly', 'come', 'could', 'did', 'differ',
  'different', 'differently', 'does', 'done', 'down', 'downed', 'downing', 'downs', 'during',
  'each', 'early', 'either', 'end', 'ended', 'ending', 'ends', 'enough', 'even', 'evenly',
  'ever', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'face', 'faces',
  'fact', 'facts', 'far', 'felt', 'few', 'fewer', 'find', 'finds', 'first', 'for', 'four',
  'from', 'full', 'fully', 'further', 'furthered', 'furthering', 'furthers', 'gave', 'general',
  'generally', 'get', 'gets', 'give', 'given', 'gives', 'good', 'goods', 'got', 'great',
  'greater', 'greatest', 'group', 'grouped', 'grouping', 'groups', 'had', 'has', 'have',
  'having', 'her', 'here', 'hers', 'herself', 'high', 'higher', 'highest', 'him', 'himself',
  'his', 'how', 'important', 'interest', 'interested', 'interesting', 'interests', 'into',
  'its', 'itself', 'just', 'keep', 'keeps', 'knew', 'know', 'known', 'knows', 'large',
  'largely', 'last', 'later', 'latest', 'least', 'less', 'let', 'lets', 'like', 'likely',
  'long', 'longer', 'longest', 'made', 'make', 'making', 'man', 'many', 'may', 'member',
  'members', 'men', 'might', 'more', 'most', 'mostly', 'much', 'must', 'myself', 'name',
  'necessary', 'need', 'needed', 'needing', 'needs', 'never', 'new', 'newer', 'newest',
  'next', 'nobody', 'non', 'noone', 'not', 'nothing', 'now', 'nowhere', 'number', 'numbers',
  'off', 'often', 'old', 'older', 'oldest', 'once', 'one', 'ones', 'only', 'open', 'opened',
  'opening', 'opens', 'order', 'ordered', 'ordering', 'orders', 'other', 'others', 'our',
  'out', 'over', 'own', 'part', 'parted', 'parting', 'parts', 'per', 'place', 'places',
  'point', 'pointed', 'pointing', 'points', 'possible', 'present', 'presented', 'presenting',
  'presents', 'problem', 'problems', 'put', 'puts', 'quite', 'rather', 'really', 'recent',
  'recently', 'right', 'room', 'rooms', 'said', 'same', 'saw', 'say', 'saying', 'says',
  'second', 'seconds', 'see', 'seem', 'seemed', 'seeming', 'seems', 'sees', 'several',
  'shall', 'she', 'should', 'show', 'showed', 'showing', 'shows', 'side', 'sides', 'since',
  'small', 'smaller', 'smallest', 'some', 'somebody', 'someone', 'something', 'somewhere',
  'state', 'states', 'still', 'such', 'sure', 'take', 'taken', 'than', 'that', 'the', 'their',
  'them', 'then', 'there', 'therefore', 'these', 'they', 'thing', 'things', 'think', 'thinks',
  'this', 'those', 'though', 'thought', 'thoughts', 'three', 'through', 'thus', 'today',
  'together', 'too', 'took', 'toward', 'turn', 'turned', 'turning', 'turns', 'two', 'under',
  'until', 'upon', 'use', 'used', 'uses', 'very', 'want', 'wanted', 'wanting', 'wants',
  'was', 'way', 'ways', 'well', 'wells', 'went', 'were', 'what', 'when', 'where', 'whether',
  'which', 'while', 'who', 'whole', 'whose', 'why', 'will', 'with', 'within', 'without',
  'work', 'worked', 'working', 'works', 'would', 'year', 'years', 'yet', 'you', 'young',
  'younger', 'youngest', 'your', 'yours',
  // Web / tech common noise words
  'http', 'https', 'www', 'com', 'org', 'net', 'html', 'htm', 'view', 'online', 'free', 'home',
  'page', 'post', 'share', 'login', 'signup', 'index', 'default', 'official', 'website',
]);

const FOLDER_KEYWORD_MAP: Record<string, string[]> = {
  design: [
    'design', 'ui', 'ux', 'figma', 'dribbble', 'behance', 'typography', 'font', 'fonts',
    'color', 'palette', 'illustration', 'sketch', 'icon', 'icons', 'graphic', 'branding',
    'logo', 'css', 'layout', 'tailwind', 'framer', 'prototype', 'animation', 'visual',
    'poster', 'artwork', 'mockup',
  ],
  development: [
    'dev', 'developer', 'code', 'coding', 'programming', 'software', 'github', 'gitlab',
    'npm', 'react', 'vue', 'angular', 'svelte', 'nextjs', 'javascript', 'typescript',
    'python', 'rust', 'golang', 'api', 'backend', 'frontend', 'sdk', 'graphql',
    'docker', 'database', 'sql', 'linux', 'git', 'terminal', 'bug', 'expo', 'library',
    'framework', 'compiler', 'algorithm', 'repository', 'stack', 'node', 'engine',
  ],
  travel: [
    'travel', 'trip', 'flight', 'flights', 'hotel', 'hotels', 'airbnb', 'vacation',
    'tourism', 'destination', 'destinations', 'explore', 'booking', 'airport', 'passport',
    'visiting', 'places', 'guide', 'airline', 'resort', 'itinerary', 'journey', 'wanderlust',
    'hostel', 'beaches', 'mountains', 'hiking',
  ],
  inspiration: [
    'inspiration', 'inspired', 'idea', 'ideas', 'creative', 'showcase', 'portfolio',
    'gallery', 'awesome', 'craft', 'minimal', 'aesthetic', 'concept', 'curated', 'trends',
    'moodboard', 'discovery', 'unique', 'vision', 'creativity',
  ],
  'movies & shows': [
    'movie', 'movies', 'film', 'films', 'cinema', 'show', 'shows', 'tv', 'netflix',
    'youtube', 'trailer', 'video', 'videos', 'watch', 'episode', 'series', 'imdb',
    'actor', 'streaming', 'hulu', 'disney', 'vimeo', 'documentary', 'hollywood',
    'cinematic', 'stream',
  ],
  'read later': [
    'read', 'reading', 'article', 'articles', 'blog', 'blogs', 'essay', 'essays',
    'newsletter', 'story', 'stories', 'book', 'books', 'paper', 'papers', 'medium',
    'substack', 'guide', 'tutorial', 'documentation', 'docs', 'manual', 'whitepaper',
    'deep-dive', 'analysis',
  ],
};

function cleanToken(token: string): string {
  return token.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
}

function isValidKeyword(token: string): boolean {
  if (token.length < 3 || token.length > 24) return false;
  if (/^\d+$/.test(token)) return false;
  if (STOP_WORDS.has(token)) return false;
  return /^[a-z][a-z0-9-]*[a-z0-9]$/.test(token);
}

/**
 * Extracts distinct, meaningful keywords from URL, title, description, domain,
 * and page metadata tags, sorted by relevance score.
 */
export function extractKeywords(context: KeywordContext): string[] {
  const scores = new Map<string, number>();

  const addToken = (raw: string, weight: number) => {
    const token = cleanToken(raw);
    if (isValidKeyword(token)) {
      scores.set(token, (scores.get(token) ?? 0) + weight);
    }
  };

  const addTextTokens = (text: string | null | undefined, weight: number) => {
    if (!text) return;
    const tokens = text.split(/[\s,;:|/\\()\[\]{}"'?!<>#_+=~`]+/);
    for (const raw of tokens) {
      addToken(raw, weight);
    }
  };

  // 1. Explicit metadata keywords (highest weight)
  if (context.metadataKeywords) {
    for (const kw of context.metadataKeywords) {
      addTextTokens(kw, 5);
    }
  }

  // 2. Title tokens (weight 4)
  addTextTokens(context.title, 4);

  // 3. Domain token (e.g. github.com -> github, weight 3)
  if (context.domain) {
    const base = context.domain.replace(/^www\./, '').split('.')[0];
    if (base) addToken(base, 3);
  }

  // 4. URL path segments (weight 3)
  if (context.url) {
    try {
      const parsed = new URL(context.url);
      const segments = parsed.pathname.split('/').filter(Boolean);
      for (const seg of segments) {
        const cleanedSeg = seg.replace(/\.(html?|php|aspx?)$/i, '');
        addToken(cleanedSeg, 3);
        const subTokens = cleanedSeg.split(/[-_]/);
        if (subTokens.length > 1) {
          for (const sub of subTokens) {
            addToken(sub, 2);
          }
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
  }

  // 5. Site Name (weight 2)
  addTextTokens(context.siteName, 2);

  // 6. Description (weight 1)
  addTextTokens(context.description, 1);

  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([word]) => word)
    .slice(0, 8);
}

/**
 * Predicts the most appropriate folder/shelf for a link based on its extracted keywords,
 * title, description, domain, and predefined/custom folder associations.
 */
export function suggestFolder(folders: Folder[], context: KeywordContext): Folder | null {
  if (folders.length === 0) return null;

  const keywords = extractKeywords(context);
  const textBlob = [
    context.title ?? '',
    context.description ?? '',
    context.domain ?? '',
    context.url ?? '',
  ]
    .join(' ')
    .toLowerCase();

  let bestFolder: Folder | null = null;
  let bestScore = 0;

  for (const folder of folders) {
    const nameLower = folder.name.toLowerCase();
    let score = 0;

    // Check predefined mapping rules
    for (const [key, associatedKeywords] of Object.entries(FOLDER_KEYWORD_MAP)) {
      if (nameLower.includes(key) || key.includes(nameLower)) {
        for (const kw of associatedKeywords) {
          if (keywords.includes(kw)) score += 3;
          else if (textBlob.includes(kw)) score += 1;
        }
      }
    }

    // Direct folder name tokens match
    const folderWords = nameLower.split(/[\s&/_-]+/).filter((w) => w.length >= 3);
    for (const word of folderWords) {
      if (keywords.includes(word)) score += 5;
      else if (textBlob.includes(word)) score += 2;
    }

    if (score > bestScore) {
      bestScore = score;
      bestFolder = folder;
    }
  }

  return bestScore >= 3 ? bestFolder : null;
}
