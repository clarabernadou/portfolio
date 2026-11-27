import { describe, expect, it } from "vitest";
import { normaliserTypo as n, normaliserTypoProfond } from "@/lib/typographie";

const F = "\u202F";
const I = "\u00A0";

describe("typographie française", () => {
  it("apostrophe ’ entre deux lettres", () => {
    expect(n("Développeur d'application")).toBe("Développeur d’application");
    expect(n("l'équipe aujourd'hui")).toBe("l’équipe aujourd’hui");
  });

  it("guillemets « » avec espaces insécables", () => {
    expect(n('le bouton "Publier"')).toBe(`le bouton «${I}Publier${I}»`);
    expect(n("“Govern all your AI”")).toBe(`«${I}Govern all your AI${I}»`);
    expect(n("la vidéo ‘Govern’ ici")).toBe(`la vidéo «${I}Govern${I}» ici`);
    expect(n("« quick win »")).toBe(`«${I}quick win${I}»`);
  });

  it("espace fine insécable avant ; ? ! : % € et insécable entre nombre et unité", () => {
    expect(n("Stack : React")).toBe(`Stack${F}: React`);
    expect(n("Pourquoi? Parce que!")).toBe(`Pourquoi${F}? Parce que${F}!`);
    expect(n("réduit de 12 % ; 98,2%")).toBe(`réduit de 12${F}%${F}; 98,2${F}%`);
    expect(n("35 h par mois, 2 Mo")).toBe(`35${I}h par mois, 2${I}Mo`);
    expect(n("5 mini-applications")).toBe("5 mini-applications");
  });

  it("points de suspension, tiret d'incise, séparateur", () => {
    expect(n("et plus...")).toBe("et plus…");
    expect(n("2023 - 2025, Full-Stack, mobile-first")).toBe("2023 – 2025, Full-Stack, mobile-first");
    expect(n("Projet personnel | nov. 2026")).toBe("Projet personnel · nov. 2026");
  });

  it("ne touche ni aux adresses, ni au code, ni aux puces Markdown", () => {
    expect(n("https://exemple.fr/a?b=c")).toBe("https://exemple.fr/a?b=c");
    expect(n("contact@clarabernadou.fr")).toBe("contact@clarabernadou.fr");
    expect(n("CV_Clara_Bernadou.pdf")).toBe("CV_Clara_Bernadou.pdf");
    expect(n("voir `npm run test:cv` d'abord")).toBe("voir `npm run test:cv` d’abord");
    expect(n("- **Point** : un\n- deux")).toBe(`- **Point**${F}: un\n- deux`);
    expect(n("10:30")).toBe("10:30");
  });

  it("une deuxième passe ne change rien", () => {
    const t = `Stack : "React" - l'équipe ; 12 % et 35 h...`;
    expect(n(n(t))).toBe(n(t));
  });

  it("objets : clés techniques ignorées", () => {
    const o = { id: "l'id", name: "J.A.R.V.I.S d'abord", href: "/projets/x?y", tags: ["aujourd'hui"], captures: [{ url: "/a'b.png", alt: "l'écran" }] };
    expect(normaliserTypoProfond(o)).toEqual({ id: "l'id", name: "J.A.R.V.I.S d’abord", href: "/projets/x?y", tags: ["aujourd’hui"], captures: [{ url: "/a'b.png", alt: "l’écran" }] });
  });
});
