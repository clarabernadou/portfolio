import { deflateSync } from "node:zlib";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CapturesSite } from "@/components/proto/CapturesSite";
import { avecDimensions, lireDimensions } from "@/lib/captures-dimensions";
import { capturesMontrees, formatCapture, lignesOccupees, type FormatCapture } from "@/lib/captures-format";

// En-têtes d'images minimales, construits à la main.
function png(l: number, h: number) {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "ascii");
  b.writeUInt32BE(l, 16);
  b.writeUInt32BE(h, 20);
  return new Uint8Array(Buffer.concat([b, deflateSync(Buffer.alloc(0))]));
}
function jpeg(l: number, h: number) {
  // SOI, APP0 (16 octets), SOF0.
  const app0 = Buffer.from([0xff, 0xe0, 0x00, 0x10, ...Buffer.from("JFIF\0"), 1, 1, 0, 0, 1, 0, 1, 0, 0]);
  const sof = Buffer.alloc(19);
  sof.set([0xff, 0xc0, 0x00, 0x11, 0x08]);
  sof.writeUInt16BE(h, 5);
  sof.writeUInt16BE(l, 7);
  return new Uint8Array(Buffer.concat([Buffer.from([0xff, 0xd8]), app0, sof]));
}
function webpVp8x(l: number, h: number) {
  const b = Buffer.alloc(30);
  b.write("RIFF", 0, "ascii");
  b.write("WEBP", 8, "ascii");
  b.write("VP8X", 12, "ascii");
  b.writeUIntLE(l - 1, 24, 3);
  b.writeUIntLE(h - 1, 27, 3);
  return new Uint8Array(b);
}

describe("lecture des dimensions", () => {
  it("PNG, JPEG et WebP", () => {
    expect(lireDimensions(png(1024, 76))).toEqual({ largeur: 1024, hauteur: 76 });
    expect(lireDimensions(jpeg(800, 82))).toEqual({ largeur: 800, hauteur: 82 });
    expect(lireDimensions(webpVp8x(1626, 207))).toEqual({ largeur: 1626, hauteur: 207 });
  });

  it("format inconnu ou fichier tronqué : null", () => {
    expect(lireDimensions(new Uint8Array([1, 2, 3, 4]))).toBeNull();
    expect(lireDimensions(jpeg(800, 82).subarray(0, 12))).toBeNull();
    expect(lireDimensions(new Uint8Array(0))).toBeNull();
  });

  it("adresse relative : capture inchangée, sans appel réseau", async () => {
    const c = { url: "/c1.png", alt: "Capture 1" };
    expect(await avecDimensions([c])).toEqual([c]);
  });
});

describe("format selon le ratio", () => {
  it("normal entre 0,6 et 2,2 ; large au-delà ; haute en deçà ; normal sans dimensions", () => {
    expect(formatCapture({ largeur: 1193, hauteur: 604 })).toBe("normal"); // 1,98
    expect(formatCapture({ largeur: 942, hauteur: 1426 })).toBe("normal"); // 0,66
    expect(formatCapture({ largeur: 1024, hauteur: 76 })).toBe("large"); // 13,5
    expect(formatCapture({ largeur: 937, hauteur: 348 })).toBe("large"); // 2,69
    expect(formatCapture({ largeur: 332, hauteur: 1102 })).toBe("haute"); // 0,30
    expect(formatCapture({})).toBe("normal");
    expect(formatCapture({ largeur: 0, hauteur: 10 })).toBe("normal");
  });
});

describe("placement et limite de 2 lignes", () => {
  const N = (k: number): FormatCapture[] => Array(k).fill("normal");

  it("cases normales : même règle qu'avant (2 lignes, au moins 4 cases en une colonne)", () => {
    expect(capturesMontrees(N(8), 4)).toBe(8);
    expect(capturesMontrees(N(9), 4)).toBe(7);
    expect(capturesMontrees(N(5), 1)).toBe(3);
    expect(capturesMontrees(N(4), 1)).toBe(4);
    expect(capturesMontrees(N(20), null)).toBe(20);
  });

  it("une capture large prend une ligne entière, qui ne compte pas dans les 2 lignes", () => {
    expect(lignesOccupees(["normal", "large", "normal"], 4)).toBe(2);
    // design-plateforme-fruggr : haute, 4 normales, 3 bandeaux.
    const fiche: FormatCapture[] = ["haute", "normal", "normal", "normal", "normal", "large", "large", "large"];
    expect(capturesMontrees(fiche, 4)).toBe(8);
    expect(capturesMontrees(fiche, 3)).toBe(8);
  });

  it("une capture haute occupe 2 lignes d'une colonne", () => {
    expect(lignesOccupees(["haute", "normal", "normal"], 2)).toBe(2);
    expect(lignesOccupees(["normal", "haute"], 1)).toBe(3);
  });

  it("le collage regroupe toujours au moins 2 captures", () => {
    const m = capturesMontrees(["haute", "normal", "normal", "normal", "normal"], 2);
    expect(m).toBeLessThanOrEqual(3);
    expect(capturesMontrees(N(3), 1)).toBe(3);
  });
});

describe("rendu de la galerie", () => {
  const html = (captures: Parameters<typeof CapturesSite>[0]["captures"]) => renderToStaticMarkup(<CapturesSite captures={captures} />);

  it("bandeau : image entière sur toute la largeur, jamais agrandie au-delà de sa taille native", () => {
    const h = html([{ url: "/b.png", alt: "Bandeau", largeur: 1024, hauteur: 76 }]);
    expect(h).toContain("grid-column:1 / -1");
    expect(h).toContain('width="1024" height="76"');
    expect(h).toContain("max-width:1024px");
    expect(h).toContain("object-fit:contain");
    expect(h).not.toContain("object-fit:cover");
  });

  it("capture haute : image entière sur 2 lignes", () => {
    const h = html([{ url: "/m.png", alt: "Mobile", largeur: 332, hauteur: 1102 }]);
    expect(h).toContain("grid-row:span 2");
    expect(h).toContain("object-fit:contain");
    expect(h).toContain("max-width:332px");
  });

  it("captures sans dimensions ou de ratio normal : HTML identique à la référence", () => {
    const cap = (n: number) => ({ url: `/c${n}.png`, alt: `Capture ${n}` });
    const avant = html([cap(1), cap(2), cap(3)]);
    const normales = html([1, 2, 3].map((n) => ({ ...cap(n), largeur: 1200, hauteur: 800 })));
    expect(normales).toBe(avant);
  });
});
