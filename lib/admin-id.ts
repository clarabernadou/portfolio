// Règle d'accès à l'administration (ADMIN-et-SYNCHRONISATION.md, §2) : un seul
// compte, identifié par son identifiant numérique GitHub (ADMIN_GITHUB_ID),
// jamais par le nom d'utilisateur, le nom affiché ou l'e-mail.
// Sans dépendance serveur, pour être utilisée par proxy.ts et par les tests.
export function isAdminGithubId(id: unknown, adminId = process.env.ADMIN_GITHUB_ID): boolean {
  if (!adminId || !/^\d+$/.test(adminId)) return false;
  if (typeof id !== "string" && typeof id !== "number") return false;
  return String(id) === adminId;
}
