// Store de la demo: estado global persistido en localStorage, con suscripción reactiva.
// Simula "la base de datos" del cliente. Toda mutación se guarda y notifica a los componentes.
import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { buildSeed } from "./seed";

const STORAGE_KEY = "gecir_demo_db_v4";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  const seed = buildSeed();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

let state = load();
const listeners = new Set();

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

export const db = {
  get() {
    return state;
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  /** Aplica una mutación: updater(draft) => newState (o muta y devuelve undefined).
   *  Tras mutar, se clona el estado para que cambien todas las referencias
   *  (necesario para que useSyncExternalStore/useMemo detecten el cambio). */
  update(updater) {
    const next = updater(state);
    if (next) state = next;
    state = structuredClone(state);
    emit();
    return state;
  },
  reset() {
    const seed = buildSeed();
    state = seed;
    emit();
  },
  nextId(key) {
    state._counters[key] = (state._counters[key] || 0) + 1;
    return state._counters[key];
  },
};

const StoreContext = createContext(db);

export function StoreProvider({ children }) {
  return <StoreContext.Provider value={db}>{children}</StoreContext.Provider>;
}

/** Hook que devuelve el estado completo y se re-renderiza ante cualquier cambio. */
export function useDb() {
  useContext(StoreContext);
  return useSyncExternalStore(db.subscribe, db.get);
}

/** Selector con re-render solo cuando cambia el slice (comparación referencial). */
export function useSelector(selector) {
  return useSyncExternalStore(db.subscribe, () => selector(db.get()));
}
