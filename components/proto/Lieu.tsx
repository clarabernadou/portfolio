import liensData from "@/data/liens.json";
import { css } from "@/lib/css";

// « Full remote ou Vannes / Auray » : chaque lieu connu (data/liens.json, lieux)
// devient un lien vers sa carte, avec le style du prototype.
export function Lieu({ text }: { text: string }) {
  const lieux = liensData.lieux;
  const re = new RegExp(`(${lieux.map((l) => l.nom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`);
  return (
    <>
      {text.split(re).map((part, i) => {
        const l = lieux.find((x) => x.nom === part);
        return l ? (
          <a key={i} href={l.url} target={"_blank"} rel={"noopener noreferrer"} style={css(`color: inherit; text-decoration: underline; text-underline-offset: 3px`)}>
            {part}
            <span className={"visuellement-masque"}>{" (carte Google Maps)"}</span>
          </a>
        ) : (
          part
        );
      })}
    </>
  );
}
