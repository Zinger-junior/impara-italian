// =============================================================================
// src/db/idb.ts
// A tiny promise-based wrapper over IndexedDB. No dependencies.
// Provides open + typed transaction helpers used by store.ts / repositories.ts.
// =============================================================================

export type StoreName =
  | "meta"
  | "lessonProgress"
  | "studySessions"
  | "milestones"
  | "quizResults"
  | "pronunciationAttempts";

/** Promisify an IDBRequest. */
export function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Promisify a transaction's completion. */
export function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error("Transaction aborted"));
  });
}

/**
 * Open (and upgrade) the database. The upgrade callback receives the raw db so
 * store.ts can declare object stores on version bumps.
 */
export function openDatabase(
  name: string,
  version: number,
  upgrade: (db: IDBDatabase, oldVersion: number) => void,
): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in this environment."));
  }
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(name, version);
    req.onupgradeneeded = (event) => upgrade(req.result, event.oldVersion);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("Database upgrade blocked by another open connection."));
  });
}

/** Read one record by key. Returns undefined when absent. */
export async function get<T>(db: IDBDatabase, store: StoreName, key: IDBValidKey): Promise<T | undefined> {
  const tx = db.transaction(store, "readonly");
  const result = await promisifyRequest<T | undefined>(tx.objectStore(store).get(key));
  await txDone(tx);
  return result;
}

/** Read every record in a store. */
export async function getAll<T>(db: IDBDatabase, store: StoreName): Promise<T[]> {
  const tx = db.transaction(store, "readonly");
  const result = await promisifyRequest<T[]>(tx.objectStore(store).getAll());
  await txDone(tx);
  return result;
}

/** Insert or replace a record. */
export async function put<T>(db: IDBDatabase, store: StoreName, value: T, key?: IDBValidKey): Promise<void> {
  const tx = db.transaction(store, "readwrite");
  if (key !== undefined) tx.objectStore(store).put(value, key);
  else tx.objectStore(store).put(value);
  await txDone(tx);
}

/** Bulk insert/replace within a single transaction. */
export async function putMany<T>(db: IDBDatabase, store: StoreName, values: T[]): Promise<void> {
  const tx = db.transaction(store, "readwrite");
  const os = tx.objectStore(store);
  for (const value of values) os.put(value);
  await txDone(tx);
}

/** Clear all records from a store. */
export async function clearStore(db: IDBDatabase, store: StoreName): Promise<void> {
  const tx = db.transaction(store, "readwrite");
  tx.objectStore(store).clear();
  await txDone(tx);
}
