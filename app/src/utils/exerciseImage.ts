import exerciseImages from '../data/exerciseImages.json';

const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'to', 'with', 'and', 'or', 'per', 'leg', 'legs', 'arm', 'arms',
  'each', 'side', 'alternating', 'assisted',
]);

function tokenize(name: string): Set<string> {
  return new Set(
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 1 && !STOP_WORDS.has(word)),
  );
}

const indexed = exerciseImages.map((entry) => ({
  ...entry,
  tokens: tokenize(entry.name),
}));

const cache = new Map<string, string | null>();

export function findExerciseImageUrl(exerciseName: string): string | null {
  if (cache.has(exerciseName)) return cache.get(exerciseName)!;

  const queryTokens = tokenize(exerciseName);
  let best: { image: string; score: number } | null = null;

  for (const candidate of indexed) {
    let overlap = 0;
    for (const token of queryTokens) {
      if (candidate.tokens.has(token)) overlap += 1;
    }
    const union = new Set([...queryTokens, ...candidate.tokens]).size;
    const score = union === 0 ? 0 : overlap / union;
    if (!best || score > best.score) {
      best = { image: candidate.image, score };
    }
  }

  const url = best && best.score >= 0.3 ? `${BASE_URL}${best.image}` : null;
  cache.set(exerciseName, url);
  return url;
}
