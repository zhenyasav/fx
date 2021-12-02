export function randomString(n = 4) {
  return Math.random().toString(16).slice(2, 2 + n);
}