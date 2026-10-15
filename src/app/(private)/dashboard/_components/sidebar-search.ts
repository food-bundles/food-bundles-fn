// Fuzzy search over the admin sidebar links. Always returns something: when nothing
// matches, it falls back to the links whose words are closest to the query.

export interface SearchableLink {
  label: string;
  href: string;
  parentLabel?: string;
  keywords?: string[];
  icon: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface SearchResult<T extends SearchableLink> {
  results: T[];
  /** true when no link matched and `results` are just the closest guesses */
  isFallback: boolean;
}

const MAX_RESULTS = 8;
const FALLBACK_RESULTS = 5;

const normalize = (s: string) =>
  s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();

const words = (s: string) => normalize(s).split(" ").filter(Boolean);

function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[b.length];
}

const isSubsequence = (needle: string, hay: string) => {
  let i = 0;
  for (const ch of hay) if (ch === needle[i]) i++;
  return i === needle.length;
};

/** How well one query token matches one word (0 = not at all). */
function tokenScore(token: string, word: string) {
  if (word === token) return 10;
  if (word.startsWith(token)) return 8;
  if (token.length >= 2 && word.includes(token)) return 6;

  // Typos: compare against the word and against its prefix of the same length
  if (token.length >= 3) {
    const allowed = token.length >= 7 ? 2 : 1;
    const d = Math.min(
      levenshtein(token, word),
      levenshtein(token, word.slice(0, token.length)),
    );
    if (d <= allowed) return 5 - d;
    if (isSubsequence(token, word)) return 2;
  }
  return 0;
}

function linkFields(link: SearchableLink) {
  return [
    { words: words(link.label), weight: 3 },
    { words: words(link.keywords?.join(" ") ?? ""), weight: 2 },
    { words: words(link.parentLabel ?? ""), weight: 1.5 },
    { words: words(link.href.replace("/dashboard", "")), weight: 1 },
  ];
}

function scoreLink(link: SearchableLink, query: string, tokens: string[]) {
  const fields = linkFields(link);
  let total = 0;
  let matched = 0;

  for (const token of tokens) {
    let best = 0;
    for (const field of fields) {
      for (const word of field.words) {
        best = Math.max(best, tokenScore(token, word) * field.weight);
      }
    }
    if (best > 0) matched++;
    total += best;
  }

  if (!total) return 0;
  if (matched === tokens.length) total += 20; // every word of the query hit
  if (normalize(link.label).includes(query)) total += 15; // whole phrase in the label
  return total;
}

/** Closeness of the query to the link's nearest word, used only for the fallback. */
function similarity(link: SearchableLink, query: string) {
  let best = 0;
  for (const field of linkFields(link)) {
    for (const word of field.words) {
      const d = levenshtein(query, word.slice(0, Math.max(query.length, 1)));
      best = Math.max(best, (1 - d / Math.max(query.length, word.length, 1)) * field.weight);
    }
  }
  return best;
}

export function searchLinks<T extends SearchableLink>(links: T[], rawQuery: string): SearchResult<T> {
  const query = normalize(rawQuery);
  if (!query) return { results: [], isFallback: false };
  const tokens = query.split(" ");

  const scored = links
    .map((link) => ({ link, score: scoreLink(link, query, tokens) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length) {
    return { results: scored.slice(0, MAX_RESULTS).map((s) => s.link), isFallback: false };
  }

  const closest = links
    .map((link) => ({ link, score: similarity(link, query.replace(/ /g, "")) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, FALLBACK_RESULTS)
    .map((s) => s.link);

  return { results: closest, isFallback: true };
}

/** Splits a label into parts, marking those that match a query token, for highlighting. */
export function highlightParts(label: string, rawQuery: string) {
  const tokens = words(rawQuery).filter((t) => t.length >= 1);
  if (!tokens.length) return [{ text: label, match: false }];

  const escaped = tokens
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");

  return label
    .split(re)
    .filter(Boolean)
    .map((text) => ({ text, match: tokens.includes(text.toLowerCase()) }));
}
