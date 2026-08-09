/** Client-side mock auth only — there is no backend, so this guards nothing an
 * attacker couldn't already read from the browser's own LocalStorage. Hashing
 * still avoids storing the raw password string. */
export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return (await hashPassword(password)) === hash;
}

/** SHA-256 of "12345678" — the documented default password for every seeded mock account. */
export const SEED_PASSWORD = "12345678";
export const SEED_PASSWORD_HASH = "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f";
