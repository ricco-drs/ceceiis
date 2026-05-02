export const ADMIN_SECRET = "gestion-ceceiis-8f3a2c9b4e1d6f5a2b7c0d4e9f1a3b6c";

export const ADMIN = {
  base:   `/${ADMIN_SECRET}`,
  listas: `/${ADMIN_SECRET}/listas`,
  conteo: `/${ADMIN_SECRET}/conteo`,
  acta:   `/${ADMIN_SECRET}/acta`,
} as const;
