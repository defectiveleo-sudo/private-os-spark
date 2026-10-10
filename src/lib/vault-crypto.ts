// Private Vault encryption. AES-GCM 256 with a key derived from the password by PBKDF2-SHA-256.
// The password and key are never stored: only a random salt and an encrypted check value are saved.

export const VAULT_ITERATIONS = 600_000;
const CHECK_TEXT = "PRIVATE-OS-VAULT-v1";

export type VaultMeta = {
  key: "vault";
  version: 1;
  salt: Uint8Array<ArrayBuffer>;
  iterations: number;
  checkIv: Uint8Array<ArrayBuffer>;
  check: ArrayBuffer;
};

export class WrongPasswordError extends Error {
  constructor() {
    super("That password is not correct.");
    this.name = "WrongPasswordError";
  }
}

export async function deriveVaultKey(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function encryptBytes(key: CryptoKey, bytes: BufferSource) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, bytes);
  return { iv, data };
}

/** Throws if the data was changed, damaged, or encrypted with another key. */
export function decryptBytes(key: CryptoKey, iv: Uint8Array<ArrayBuffer>, data: ArrayBuffer): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
}

export async function createVault(password: string, iterations = VAULT_ITERATIONS): Promise<{ meta: VaultMeta; key: CryptoKey }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveVaultKey(password, salt, iterations);
  const { iv, data } = await encryptBytes(key, new TextEncoder().encode(CHECK_TEXT));
  return { meta: { key: "vault", version: 1, salt, iterations, checkIv: iv, check: data }, key };
}

export async function unlockVault(meta: VaultMeta, password: string): Promise<CryptoKey> {
  const key = await deriveVaultKey(password, meta.salt, meta.iterations);
  let plain: ArrayBuffer;
  try {
    plain = await decryptBytes(key, meta.checkIv, meta.check);
  } catch {
    throw new WrongPasswordError();
  }
  if (new TextDecoder().decode(plain) !== CHECK_TEXT) throw new WrongPasswordError();
  return key;
}
