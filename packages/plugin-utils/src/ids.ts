/** Generate a unique ID (8 hex chars from crypto-quality random). */
export function generateId(): string {
  const arr = new Uint8Array(4);
  // Works in both browser (crypto.getRandomValues) and Node (crypto.randomFillSync)
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Simple string hash (DJB2). Returns hex string. */
export function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}
