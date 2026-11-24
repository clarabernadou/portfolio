// Dimensions réelles des captures du site (24 nov. 2026), pour choisir leur format d'affichage
// (lib/captures-format.ts). Lues dans l'en-tête du fichier (PNG, JPEG, WebP, GIF) au moment où la page est
// construite : rien n'est enregistré en base. En cas d'échec, la capture garde l'affichage habituel.
import type { ProjectCapture } from "./types";

export type Dimensions = { largeur: number; hauteur: number };

/** Largeur et hauteur lues dans les premiers octets d'une image, ou null si le format n'est pas reconnu. */
export function lireDimensions(b: Uint8Array): Dimensions | null {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const ascii = (debut: number, fin: number) => String.fromCharCode(...b.subarray(debut, fin));
  const ok = (d: Dimensions | null) => (d && d.largeur > 0 && d.hauteur > 0 ? d : null);
  try {
    // PNG : bloc IHDR.
    if (b.length >= 24 && v.getUint32(0) === 0x89504e47) return ok({ largeur: v.getUint32(16), hauteur: v.getUint32(20) });
    // GIF.
    if (b.length >= 10 && ascii(0, 3) === "GIF") return ok({ largeur: v.getUint16(6, true), hauteur: v.getUint16(8, true) });
    // WebP : VP8X (étendu), VP8 (avec perte) ou VP8L (sans perte).
    if (b.length >= 30 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
      const bloc = ascii(12, 16);
      const u24 = (i: number) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);
      if (bloc === "VP8X") return ok({ largeur: 1 + u24(24), hauteur: 1 + u24(27) });
      if (bloc === "VP8 ") return ok({ largeur: v.getUint16(26, true) & 0x3fff, hauteur: v.getUint16(28, true) & 0x3fff });
      if (bloc === "VP8L") {
        const x = v.getUint32(21, true);
        return ok({ largeur: 1 + (x & 0x3fff), hauteur: 1 + ((x >>> 14) & 0x3fff) });
      }
      return null;
    }
    // JPEG : premier segment SOF (hors DHT, JPG et DAC).
    if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i + 9 < b.length) {
        if (b[i] !== 0xff) {
          i++;
          continue;
        }
        const m = b[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return ok({ largeur: v.getUint16(i + 7), hauteur: v.getUint16(i + 5) });
        if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7) || m === 0xff) {
          i += m === 0xff ? 1 : 2;
          continue;
        }
        i += 2 + v.getUint16(i + 2);
      }
    }
  } catch {
    // Fichier tronqué ou mal formé : affichage habituel.
  }
  return null;
}

// Une adresse Vercel Blob ne change pas de contenu : les dimensions lues restent valables pour tout le processus.
const cache = new Map<string, Promise<Dimensions | null>>();

async function dimensionsDe(url: string): Promise<Dimensions | null> {
  if (!/^https:\/\//.test(url)) return null;
  let p = cache.get(url);
  if (!p) {
    p = fetch(url, { headers: { Range: "bytes=0-65535" }, signal: AbortSignal.timeout(8000) })
      .then(async (r) => (r.ok ? lireDimensions(new Uint8Array(await r.arrayBuffer())) : null))
      .catch(() => null);
    cache.set(url, p);
    // Un échec (réseau, délai) n'est pas gardé : la prochaine construction réessaie.
    p.then((d) => d ?? cache.delete(url));
  }
  return p;
}

/** Captures complétées de leurs dimensions réelles, quand elles ont pu être lues. */
export async function avecDimensions(captures: ProjectCapture[]): Promise<ProjectCapture[]> {
  return Promise.all(
    captures.map(async (c) => {
      const d = await dimensionsDe(c.url);
      return d ? { ...c, largeur: d.largeur, hauteur: d.hauteur } : c;
    }),
  );
}
