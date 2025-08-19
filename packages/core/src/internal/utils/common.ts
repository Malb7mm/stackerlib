export const range = (start: number, end: number) => {
  const array: number[] = [];
  for (let i = start; i < end; i++) {
    array.push(i);
  }
  return array;
};

export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}