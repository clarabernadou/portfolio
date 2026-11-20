// 20 nov. 2026 : mise en forme des contextes de tous les projets (demande de Clara : même règle partout).
// Aucun mot ne change : seulement des marques (lib/texte-formate.tsx), vérifié avant écriture.
//   - la phrase de cadre (première phrase) forme un paragraphe à part ;
//   - **gras** : 1 ou 2 réalisations clés (livrable, résultat, chiffre), jamais une technologie (déjà en étiquette) ;
//   - *italique* : titres d'œuvres seulement.
// La base est partagée avec le site en ligne, dont le code doit déjà savoir lire ces marques :
// appliquer seulement avec le déploiement de la branche texte-formate.
// Par défaut, simulation (avant / après). Avec --appliquer : écriture, après une sauvegarde (npm run db:backup).
// Rien n'est écrit pour un projet dont le texte a déjà des marques, ou dont un passage n'est pas trouvé une seule fois.
// Usage : npx tsx scripts/maj-contextes-mise-en-forme.ts [--appliquer]
export {};
process.loadEnvFile(".env.local");
const { db } = await import("../lib/db");
const prisma = db();

const MARQUES: Record<string, { gras: string[]; italique?: string[] }> = {
  jarvis: { gras: ["5 mini-applications du quotidien", "design system commun"] },
  portfolio: { gras: ["de la charte graphique à la mise en ligne sur Vercel", "administration réservée à mon compte GitHub"] },
  "audit-fruggr": { gras: ["Audit UX de la version française du site WordPress de Fruggr"] },
  "repositionnement-fruggr": { gras: ["plus de 30 sites", "démo vidéo en anglais"] },
  "refonte-site-d4b": { gras: ["conçu l'UX/UI sur Figma", "développé les pages clés sur WordPress"] },
  "design-plateforme-fruggr": { gras: ["refontes et évolutions de la plateforme SaaS", "75 pull requests mergées"] },
  intuitlearn: { gras: ["classé les constats par gravité", "plan d'action priorisé (P0 à P2)"] },
  watchedthis: { gras: ["Conception de l'identité graphique, maquettes et développement complet"] },
  "les-bambinets": { gras: ["un brief, des wireframes et un prototype interactif"] },
  "equi-libre": { gras: ["l'architecture de l'information", "tris de cartes"] },
  avenirs: { gras: ["style guide", "une landing page et une application mobile first"] },
  foodles: { gras: ["13 hypothèses UX", "5 participants"] },
  "les-cordons-bleus": { gras: ["brief UX complet", "UX Business Model Canvas"] },
  cafeo: { gras: ["atelier de co-conception en Design Thinking", "parcours utilisateur idéal"] },
  "camping-luxe": { gras: ["auditer l'expérience utilisateur", "rapport de recommandations concrètes"] },
  "hero-lines": { gras: ["recherche secondaire", "personas cibles"] },
  "your-car-your-way": { gras: ["document d'architecture", "POC complet"] },
  "maison-en-place": { gras: ["plan de tests de qualité et de sécurité", "plan de sauvegarde des données"] },
  catasterre: { gras: ["supervision d'une équipe technique", "sprint backlog"] },
  bobapp: { gras: ["démarche d'intégration et de livraison continues", "conteneurisation de chaque partie"] },
  deliveryfit: { gras: ["dossier de cadrage complet", "budget prévisionnel"] },
  livrai: { gras: ["audit fonctionnel et technique de l'existant", "cahier des charges fonctionnel et technique"] },
  "monde-de-dev": { gras: ["l'application complète", "fiche de choix techniques"] },
  numdev: { gras: ["Tests automatisés", "rapports de couverture"] },
  genz: { gras: ["veille technologique", "document d'architecture détaillé"] },
  chatop: { gras: ["l'API REST d'un portail de mise en relation entre locataires et propriétaires"] },
  telesport: { gras: ["application de suivi des statistiques des Jeux Olympiques"] },
  hrnet: { gras: ["converti une application existante en jQuery vers une architecture React", "rapport comparatif d'analyse des performances"] },
  "argent-bank": { gras: ["front-end d'une application bancaire responsive", "authentification sécurisée des utilisateurs"] },
  sportsee: { gras: ["tableau de bord d'analytics", "graphiques avancés"] },
  kasa: { gras: ["plateforme de location immobilière"] },
  "learn-home": { gras: ["user stories", "maquettes sur Figma"] },
  billed: { gras: ["résolu les anomalies", "tests unitaires et d'intégration"] },
  "les-petits-plats": { gras: ["fiche d'investigation", "algorithme de recherche rapide en JavaScript natif"] },
  fisheye: { gras: ["site web accessible"] },
  gameon: { gras: ["modale d'inscription", "validation complète des champs du formulaire"] },
  groupomania: { gras: ["réseau social interne", "système de modération sécurisé"] },
  piiquante: { gras: ["API sécurisée"] },
  kanap: { gras: ["interface dynamique en JavaScript", "plan de test"] },
  "la-chouette-agence": { gras: ["référencement SEO et de la performance"] },
  ohmyfood: { gras: ["intégration mobile-first"] },
  booki: { gras: ["maquette de la page d'accueil"] },
  "saga-films-fruggr": { gras: ["saga de 3 films", "développé seule les films en motion design"], italique: ["See your AI", "Own your AI", "Stay ahead of AI"] },
  "supports-visuels-fruggr": { gras: ["signatures e-mail, bannières LinkedIn et fonds Teams", "miniatures de la chaîne YouTube"] },
};

const sansMarques = (t: string) => t.replace(/\*\*|\*/g, "").replace(/\s+/g, " ").trim();
const occurrences = (t: string, s: string) => t.split(s).length - 1;

const ps = await prisma.project.findMany({ where: { deletedAt: null }, orderBy: { position: "asc" }, select: { id: true, context: true } });
const ecritures: { id: string; context: string }[] = [];
let erreurs = 0;
for (const p of ps) {
  const m = MARQUES[p.id];
  if (!m) {
    console.error(`✗ ${p.id} : aucune règle (projet ajouté depuis ?).`);
    erreurs++;
    continue;
  }
  if (/\*\*|(^|\s)\*\S/.test(p.context)) {
    console.log(`= ${p.id} : déjà mis en forme, laissé tel quel.`);
    continue;
  }
  let t = p.context;
  // Phrase de cadre : la première phrase, en paragraphe à part (si le texte n'en a pas déjà).
  const fin = t.indexOf(". ");
  if (fin > 0 && !t.slice(0, fin + 2).includes("\n")) t = `${t.slice(0, fin + 1)}\n\n${t.slice(fin + 2)}`;
  const absents = [...m.gras, ...(m.italique ?? [])].filter((s) => occurrences(t, s) !== 1);
  if (absents.length) {
    console.error(`✗ ${p.id} : passage absent ou répété : ${absents.join(" | ")}`);
    erreurs++;
    continue;
  }
  for (const s of m.gras) t = t.replace(s, `**${s}**`);
  for (const s of m.italique ?? []) t = t.replace(s, `*${s}*`);
  if (sansMarques(t) !== sansMarques(p.context)) {
    console.error(`✗ ${p.id} : le texte changerait, rien n'est écrit.`);
    erreurs++;
    continue;
  }
  ecritures.push({ id: p.id, context: t });
  console.log(`\n## ${p.id}\n${t}`);
}
console.log(`\n${ecritures.length} contextes mis en forme, ${erreurs} erreur(s).`);
if (erreurs) process.exit(1);
if (!process.argv.includes("--appliquer")) {
  console.log("Simulation : rien n'est écrit. Relancer avec --appliquer (après npm run db:backup), au déploiement de texte-formate.");
  process.exit(0);
}
for (const e of ecritures) await prisma.project.update({ where: { id: e.id }, data: { context: e.context } });
console.log("Écrit.");
process.exit(0);
