/**
 * Shared state and persistence — owned by increment inc-8.
 *
 * React Context + useReducer for reservations and compare selection,
 * persisted to localStorage. Invisible infrastructure: renders nothing.
 */
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import { isHoldExpired } from "./HoldExpiry";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ReservationStatus = "held" | "confirmed" | "cancelled" | "expired";

export interface Reservation {
  id: string;
  listingSlug: string;
  start: string;
  end: string;
  status: ReservationStatus;
  heldAt: string;
}

export interface AppState {
  reservations: Reservation[];
  compareSelection: string[];
}

export type AppAction =
  | { type: "add"; payload: Reservation }
  | { type: "confirm"; payload: { id: string } }
  | { type: "cancel"; payload: { id: string } }
  | { type: "expire"; payload: { id: string } }
  | { type: "addCompare"; payload: { slug: string } }
  | { type: "removeCompare"; payload: { slug: string } };

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "silicon-exchange-state";
const COMPARE_MAX = 4;

// ─── Reducer ─────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "add":
      return {
        ...state,
        reservations: [...state.reservations, action.payload],
      };

    case "confirm":
      return {
        ...state,
        reservations: state.reservations.map((r) =>
          r.id === action.payload.id && r.status === "held"
            ? { ...r, status: "confirmed" as const }
            : r,
        ),
      };

    case "cancel":
      return {
        ...state,
        reservations: state.reservations.map((r) =>
          r.id === action.payload.id &&
          (r.status === "held" || r.status === "confirmed")
            ? { ...r, status: "cancelled" as const }
            : r,
        ),
      };

    case "expire":
      return {
        ...state,
        reservations: state.reservations.map((r) =>
          r.id === action.payload.id && r.status === "held"
            ? { ...r, status: "expired" as const }
            : r,
        ),
      };

    case "addCompare": {
      const { slug } = action.payload;
      if (state.compareSelection.includes(slug)) return state;
      if (state.compareSelection.length >= COMPARE_MAX) return state;
      return {
        ...state,
        compareSelection: [...state.compareSelection, slug],
      };
    }

    case "removeCompare":
      return {
        ...state,
        compareSelection: state.compareSelection.filter((s) => s !== action.payload.slug),
      };

    default:
      return state;
  }
}

// ─── Persistence helpers ─────────────────────────────────────────────────────

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.reservations) && Array.isArray(parsed.compareSelection)) {
        return parsed as AppState;
      }
    }
  } catch {
    // corrupted or unavailable — fall through to defaults
  }
  return { reservations: [], compareSelection: [] };
}

function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState);

  // Persist to localStorage on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Auto-expire held reservations older than 10 minutes on mount
  useEffect(() => {
    const now = new Date();
    state.reservations.forEach((r) => {
      if (r.status === "held" && isHoldExpired(r.heldAt, now)) {
        dispatch({ type: "expire", payload: { id: r.id } });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an <AppProvider>");
  }
  return ctx;
}

// ─── No-op component (backward-compatible export) ────────────────────────────

export function SharedStateAndPersistence() {
  return null;
}
