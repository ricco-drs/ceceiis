import type { AdminList, ConteoState } from "@/types/admin";

const LISTS_KEY = "admin_lists";
const CONTEO_KEY = "admin_conteo";

export const getListas = (): AdminList[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LISTS_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveListas = (lists: AdminList[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
};

export const getConteo = (): ConteoState => {
  if (typeof window === "undefined") return { electoresHabiles: "", votantes: "", votes: {} };
  try {
    return JSON.parse(localStorage.getItem(CONTEO_KEY) || "null") ?? { electoresHabiles: "", votantes: "", votes: {} };
  } catch {
    return { electoresHabiles: "", votantes: "", votes: {} };
  }
};

export const saveConteo = (state: ConteoState): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONTEO_KEY, JSON.stringify(state));
};

const LOCKED_KEY = "admin_locked";

export const getLocked = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LOCKED_KEY) === "true";
};

export const setLocked = (): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCKED_KEY, "true");
};

export const resetLocked = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCKED_KEY);
};

const DEV_MODE_KEY = "admin_dev_mode";

export const getDevMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEV_MODE_KEY) === "true";
};

export const toggleDevMode = (): boolean => {
  if (typeof window === "undefined") return false;
  const next = !getDevMode();
  localStorage.setItem(DEV_MODE_KEY, String(next));
  return next;
};

export const isEffectivelyLocked = (): boolean => {
  if (typeof window === "undefined") return false;
  return getLocked() && !getDevMode();
};
