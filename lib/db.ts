"use client";

/**
 * Stockage des souvenirs (photos, vidéos courtes, empreintes du canvas).
 * IndexedDB garde les blobs en local, sur l'appareil : rien ne part sur un
 * serveur, le rituel reste privé.
 */

export interface Souvenir {
  id: string;
  /** Numéro d'étape (1..5), ou 0 pour l'empreinte du cœur. */
  step: number;
  kind: "image" | "video";
  mime: string;
  blob: Blob;
  caption: string;
  createdAt: number;
}

const DB_NAME = "silent";
const DB_VERSION = 1;
const STORE = "souvenirs";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB indisponible"));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: "id" });
          store.createIndex("step", "step");
          store.createIndex("createdAt", "createdAt");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const request = run(transaction.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `s-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function listSouvenirs(): Promise<Souvenir[]> {
  const all = await tx<Souvenir[]>("readonly", (store) => store.getAll() as IDBRequest<Souvenir[]>);
  return all.sort((a, b) => a.step - b.step || a.createdAt - b.createdAt);
}

export async function addSouvenir(entry: Souvenir): Promise<void> {
  await tx("readwrite", (store) => store.add(entry) as IDBRequest<IDBValidKey>);
}

export async function updateSouvenir(entry: Souvenir): Promise<void> {
  await tx("readwrite", (store) => store.put(entry) as IDBRequest<IDBValidKey>);
}

export async function deleteSouvenir(id: string): Promise<void> {
  await tx("readwrite", (store) => store.delete(id) as IDBRequest<undefined>);
}

export async function clearSouvenirs(): Promise<void> {
  await tx("readwrite", (store) => store.clear() as IDBRequest<undefined>);
}
