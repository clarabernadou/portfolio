// Cohérence entre le CV PDF servi par le site et les pages accueil, /cv et /ia (demande de Clara,
// 13 nov. 2026). Le PDF fait foi : intitulé, dates des expériences, niveau d'anglais et nombre de skills.
// Usage : serveur lancé (npm run dev ou npm run start), puis npm run test:cv [-- --base URL]
// Prérequis : pdftotext (poppler : brew install poppler).
import { execFileSync } from "node:child_process";

const base = process.argv.includes("--base") ? process.argv[process.argv.indexOf("--base") + 1] : "http://localhost:3000";
const CV = "/media/cv/CV_Clara_Bernadou_Developpeuse_Full_Stack.pdf";
let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? "OK   " : "ÉCHEC"} ${label}`);
  if (!ok) failures++;
};

// Texte visible d'une page : sans scripts, styles ni balises, espaces normalisés.
const texte = async (chemin) => {
  const r = await fetch(new URL(chemin, base));
  if (r.status !== 200) throw new Error(`${chemin} : ${r.status}`);
  return (await r.text())
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
};
const html = async (chemin) => (await fetch(new URL(chemin, base))).text();

// Texte du PDF, tel que le site le sert (redirections suivies).
const r = await fetch(new URL(CV, base));
check(r.status === 200 && r.headers.get("content-type")?.includes("pdf"), `${CV} sert un PDF (${r.status})`);
const pdf = execFileSync("pdftotext", ["-", "-"], { input: Buffer.from(await r.arrayBuffer()) }).toString().replace(/[ \t]+/g, " ");

const [accueil, cv, ia, iaHtml] = await Promise.all([texte("/"), texte("/cv"), texte("/ia"), html("/ia")]);
const bas = (s) => s.toLowerCase();

// 1. Intitulé : celui du PDF sur /cv, et « Développeuse full stack » en titre de l'accueil.
const intitule = pdf.match(/Développeuse Full Stack[^\n]*/)?.[0].trim();
check(!!intitule, `intitulé lu dans le PDF : « ${intitule} »`);
check(!!intitule && cv.includes(intitule), "/cv reprend l'intitulé du PDF");
check(/Développeuse full stack/i.test(accueil), "l'accueil titre « Développeuse full stack »");
for (const [page, t] of [["accueil", accueil], ["/cv", cv], ["/ia", ia]]) {
  check(!/front-end & UI|UI\/UX designer\b/i.test(t), `${page} : aucun ancien intitulé (front-end & UI/UX designer)`);
  check(!t.includes("‑"), `${page} : aucun trait d'union insécable (U+2011)`);
}

// 2. Dates des expériences (« 03/2025 – 06/2026 ») : chaque mois du PDF figure sur /cv.
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const periodes = [...pdf.matchAll(/(\d{2})\/(\d{4}) – (?:(\d{2})\/(\d{4})|Présent)/g)];
check(periodes.length >= 3, `${periodes.length} périodes lues dans le PDF`);
for (const p of periodes) {
  const debut = `${MOIS[Number(p[1]) - 1]} ${p[2]}`;
  check(bas(cv).includes(debut), `/cv : début « ${debut} » (${p[0]})`);
  if (p[3]) {
    const fin = `${MOIS[Number(p[3]) - 1]} ${p[4]}`;
    check(bas(cv).includes(fin), `/cv : fin « ${fin} » (${p[0]})`);
  }
}

// 3. Niveau d'anglais.
const anglais = pdf.match(/Anglais : ([^\n]+)/)?.[1].trim();
check(!!anglais, `anglais lu dans le PDF : « ${anglais} »`);
check(!!anglais && cv.includes(`Anglais ${anglais}`), "/cv reprend le niveau d'anglais du PDF");

// 4. Nombre de skills : le chiffre du PDF, la statistique de /ia et le nombre de cartes « Skill ».
const skills = Number(pdf.match(/(\d+) skills créés/)?.[1]);
check(skills > 0, `nombre de skills lu dans le PDF : ${skills}`);
check(ia.includes(`${skills} skills créés`), `/ia annonce ${skills} skills`);
const cartes = (iaHtml.match(/>Skill</g) ?? []).length;
check(cartes === skills, `/ia présente ${cartes} cartes de skill (attendu : ${skills})`);
check(cv.includes(`${skills} skills créés`), `/cv annonce ${skills} skills`);

console.log(failures ? `\n${failures} écart(s) entre le CV PDF et le site.` : "\nLe site est cohérent avec le CV PDF.");
process.exit(failures ? 1 : 0);
