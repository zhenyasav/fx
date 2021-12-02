export function removeScope(s: string) {
  const split = s.split("/");
  return split.length > 1 ? split.slice(1).join("/") : split[0];
}
