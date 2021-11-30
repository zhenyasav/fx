const MAX_LENGTH = 60;
export const ellipsis = (s, n = MAX_LENGTH) => s.length > n ? s.slice(0, n / 2 - 3) + "..." + s.slice(s.length - n / 2 - 3) : s;
