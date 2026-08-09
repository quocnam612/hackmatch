const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

export function stripDiacritics(input: string): string {
  return input
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/** Derives a username from a display name's given (last) word, e.g. "Nguyễn An" -> "an". */
export function suggestUsername(name: string): string {
  const words = stripDiacritics(name).trim().split(/\s+/).filter(Boolean);
  const given = words[words.length - 1] ?? "user";
  return given.toLowerCase().replace(/[^a-z0-9]/g, "");
}
