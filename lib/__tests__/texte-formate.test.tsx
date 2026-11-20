import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { blocs, texteBrut, TexteFormate } from "../texte-formate";

const DEMO = "Projet perso.\n\nUne démo est ouverte :\n- Identifiant : **demo**\n- Mot de passe : *secret*\nTout se parcourt.";

describe("texte formaté", () => {
  it("découpe paragraphes, listes et retours à la ligne", () => {
    expect(blocs(DEMO)).toEqual([
      { type: "p", lignes: ["Projet perso."] },
      { type: "p", lignes: ["Une démo est ouverte :"] },
      { type: "ul", items: ["Identifiant : **demo**", "Mot de passe : *secret*"] },
      { type: "p", lignes: ["Tout se parcourt."] },
    ]);
  });

  it("rend gras, italique et puces, sans interpréter le HTML", () => {
    const html = renderToStaticMarkup(<TexteFormate texte={DEMO + "\n<b>x</b> _ici_"} style={"font-size: 17px"} />);
    expect(html).toContain("<strong>demo</strong>");
    expect(html).toContain("<em>secret</em>");
    expect(html).toContain("<em>ici</em>");
    expect(html.match(/<li/g)).toHaveLength(2);
    expect(html).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(html).toContain("Tout se parcourt.<br/>");
  });

  it("laisse un astérisque isolé et un tiret au milieu d'une ligne", () => {
    expect(texteBrut("5 * 3 - 2 et 2*3")).toBe("5 * 3 - 2 et 2*3");
  });

  it("donne une version brute sur une ligne", () => {
    expect(texteBrut(DEMO)).toBe("Projet perso. Une démo est ouverte : Identifiant : demo Mot de passe : secret Tout se parcourt.");
  });
});
