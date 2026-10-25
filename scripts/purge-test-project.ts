// Efface définitivement un projet de test (utilisé par test-admin-projets.mjs).
export {};
// Garde-fou : refuse tout projet dont le nom ne contient pas « (à supprimer) ».
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const id = process.argv[2];
const prisma = db();
const p = await prisma.project.findUnique({ where: { id } });
if (p && p.name.includes("(à supprimer)")) {
  await prisma.project.delete({ where: { id } });
  await prisma.syncLog.deleteMany({ where: { entity: "project", entityId: id } });
  console.log(`Copie de test « ${id} » effacée.`);
} else if (p) {
  console.log(`Refus : « ${p.name} » n'est pas un projet de test.`);
}
// Lignes du journal d'activité laissées par les tests (éléments « (à supprimer) »).
await prisma.syncLog.deleteMany({ where: { message: { contains: "(à supprimer)" } } });
await prisma.$disconnect();
