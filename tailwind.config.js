// tailwind.config.js
// Valeurs fournies dans docs/passation/tailwind.config.js (charte graphique).
// Seul l'ajout de `content` était nécessaire : le fichier fourni ne le précisait pas.
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      // Échelle typographique relevée d'un cran le 23 octobre 2026 (CLAUDE.md
      // « Typographie ») : plus aucun texte sous 13 px. Les tailles de 20 px et
      // plus (text-xl et au-delà) restent celles de Tailwind.
      fontSize: {
        xs: "13px",
        sm: "15px",
        base: "17px",
        lg: "19px",
      },
      colors: {
        encre: "#1A1033",
        amethyste: "#6A4FB6",
        lilas: "#C4B5FD",
        brume: "#F3EFFF",
        ardoise: "#5B5470",
        nuit: "#2E1065",
        bordure: "#E4DCF7",
        "bordure-tag": "#B9A8EC",
      },
      fontFamily: {
        titre: ["Bricolage Grotesque", "system-ui", "sans-serif"],
        texte: ["Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        14: "14px",
        card: "16px",
        lg: "20px",
        22: "22px",
        24: "24px",
        xl: "28px",
        pill: "999px",
      },
      boxShadow: {
        doux: "0 8px 24px rgb(26 16 51 / 0.08)",
        forte: "0 8px 24px rgb(0 0 0 / 0.2)",
        modale: "0 8px 24px rgb(26 16 51 / 0.18)",
      },
      backgroundImage: {
        nuit: "linear-gradient(160deg, #1A1033, #2E1065)",
        halo: "linear-gradient(135deg, #F3EFFF, #E9E2FB)",
      },
    },
  },
};

export default config;
