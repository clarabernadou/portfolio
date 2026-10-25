// Génère un composant React à partir d'un fragment des sources du prototype.
// Usage : node scripts/tools/gen.mjs <page.source.html> <début> <fin> <sortie.tsx> <NomComposant>
// Le composant reçoit v (équivalent du renderVals() de la source).
import fs from "node:fs";
import path from "node:path";
import { convert } from "./html-to-jsx.mjs";

const [file, start, end, out, name] = process.argv.slice(2);
const src = fs.readFileSync(file, "utf8");
const a = src.indexOf(start);
const b = end === "-" ? src.length : src.indexOf(end, a + start.length);
if (a < 0 || b < 0) throw new Error(`marqueurs introuvables dans ${file}`);
let jsx = convert(src.slice(a, b), 3);
// Photo de profil : retirée de la source (base64), servie depuis public/.
jsx = jsx.replace(/src=\{"data:image\/[^"]*"\}/g, 'src={"/photo-clara.jpg"}');

const body = `"use client";

import { Fragment } from "react";
import Link from "next/link";
import { css } from "@/lib/css";

// Généré depuis docs/passation/prototype-source/${path.basename(file)}
// (scripts/tools/gen.mjs) : markup et styles recopiés à l'identique.
/* eslint-disable @typescript-eslint/no-explicit-any */
export function ${name}({ v }: { v: any }) {
  return (
    <>
${jsx}
    </>
  );
}
`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, body);
console.log(`${out} : ${body.length} octets`);
