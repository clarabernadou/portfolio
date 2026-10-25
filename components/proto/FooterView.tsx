"use client";

import { Fragment } from "react";
import Link from "next/link";
import { css } from "@/lib/css";

// Généré depuis docs/passation/prototype-source/accueil.source.html
// (scripts/tools/gen.mjs) : markup et styles recopiés à l'identique.
/* eslint-disable @typescript-eslint/no-explicit-any */
export function FooterView({ v }: { v: any }) {
  return (
    <>
      <footer id={"contact"} className={"zone-sombre"} style={css(`background: linear-gradient(160deg, #1A1033 0%, #2E1065 100%); color: #C4B5FD`)}>
        {" "}
        <div className={"ft-in"} style={css(`max-width: 1200px; margin: 0 auto; padding: 4rem 2rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 2.25rem`)}>
          {" "}
          <div style={css(`display: flex; flex-direction: column; align-items: center; gap: 1.25rem; text-align: center; width: 100%`)}>
            {" "}
            <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 44px; letter-spacing: -0.04em; line-height: 1.02; color: #FFFFFF`)}>
              <span style={css(`font-weight: 800`)}>
                {"Me"}
              </span>
              {" "}
              <span style={css(`font-weight: 300; color: #C4B5FD`)}>
                {"contacter"}
              </span>
            </h2>
            {" "}
            <div className={"mail-bar"} style={css(`display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px 18px; padding: 6px 6px 6px 22px; border-radius: 32px; background: #FFFFFF; box-shadow: 0 8px 24px rgba(0,0,0,0.2); max-width: 100%`)}>
              {" "}
              <span style={css(`font-size: 17px; font-weight: 700; color: #1A1033; word-break: break-all`)}>
                {v.email}
              </span>
              {" "}
              <div style={css(`display: flex; gap: 8px`)}>
                {" "}
                <button type={"button"} onClick={v.copy} aria-live={"polite"} style={css(`min-height: 40px; padding: 0 16px; border-radius: 999px; border: 1.5px solid #6A4FB6; background: #FFFFFF; color: #6A4FB6; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer`)}>
                  <span>{v.copyLabel}</span>
                </button>
                {" "}
                <a href={`mailto:${v.email}`} style={css(`min-height: 40px; padding: 0 18px; border-radius: 999px; border: 0; background: #6A4FB6; color: #FFFFFF; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; box-sizing: border-box`)}>
                  {"Écrire"}
                </a>
                {" "}
              </div>
              {" "}
            </div>
            <p style={css(`margin: 0; font-size: 15px; line-height: 1.5; color: #C4B5FD; text-align: center`)}>
              {v.entretiens}
            </p>
            {" "}
            <ul role={"list"} aria-label={"Profils et CV"} className={"liste-nue"} style={css(`display: flex; flex-wrap: wrap; justify-content: center; gap: 10px`)}>
              <li>
              <a href={v.linkedin} target={"_blank"} rel={"noopener noreferrer"} style={css(`min-height: 44px; padding: 0 16px; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(196,181,253,0.35); color: #FFFFFF; display: inline-flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; text-decoration: none`)}>
                <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.75"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                  <rect x={"3"} y={"3"} width={"18"} height={"18"} rx={"4"} />
                  <path d={"M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"} />
                </svg>
                {"LinkedIn"}
              </a>
              </li>
              <li>
              <a href={v.github} target={"_blank"} rel={"noopener noreferrer"} style={css(`min-height: 44px; padding: 0 16px; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(196,181,253,0.35); color: #FFFFFF; display: inline-flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; text-decoration: none`)}>
                <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.75"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                  <path d={"M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5a3 3 0 0 0-.9-2.4c3-.3 6-1.4 6-6.6a5 5 0 0 0-1.4-3.6 4.7 4.7 0 0 0-.1-3.6s-1.1-.3-3.6 1.4a12.4 12.4 0 0 0-6.5 0C5.9 1.7 4.8 2 4.8 2a4.7 4.7 0 0 0-.1 3.6A5 5 0 0 0 3.3 9.2c0 5.2 3 6.3 6 6.6a3 3 0 0 0-.9 2.3V21"} />
                </svg>
                {"GitHub"}
              </a>
              </li>
              <li>
              <a href={v.cvUrl} target={"_blank"} rel={"noopener noreferrer"} style={css(`min-height: 44px; padding: 0 16px; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(196,181,253,0.35); color: #FFFFFF; display: inline-flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; text-decoration: none`)}>
                <svg width={"20"} height={"20"} viewBox={"0 0 24 24"} aria-hidden={"true"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.75"} strokeLinecap={"round"} strokeLinejoin={"round"}>
                  <path d={"M7 3h7l5 5v13H7z"} />
                  <path d={"M14 3v5h5"} />
                  <path d={"M10 13h6M10 17h6"} />
                </svg>
                {"CV · PDF"}
              </a>
              </li>
            </ul>
            {" "}
          </div>
          {" "}
          <div style={css(`width: 100%; display: flex; flex-direction: column; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid rgba(196,181,253,0.25); font-size: 14px`)}>
            <div className={"ft-row"}>
            {" "}
            <Link href={"/"} aria-label={"Clara Bernadou, accueil"} style={css(`display: inline-flex; text-decoration: none`)}>
              <div style={css(`display: flex; align-items: center`)}>
                <svg viewBox={"95 107 920 920"} width={"44"} height={"44"} role={"img"} aria-label={"Logo papillon"} style={css(`flex-shrink: 0; margin-right: -4px`)}>
                  <g transform={"translate(0,1112) scale(0.1,-0.1)"} fill={"#C4B5FD"}>
                    <path d={"M5680 9893 c-100 -41 -204 -151 -269 -286 -106 -217 -211 -576 -261 -892 -5 -27 -14 -81 -20 -120 -14 -88 -24 -163 -39 -290 -7 -55 -16 -119 -22 -143 -5 -23 -9 -70 -10 -105 -1 -55 -2 -59 -12 -37 -42 89 -159 279 -201 327 -60 67 -111 92 -188 93 -71 0 -96 -10 -148 -56 -82 -74 -117 -202 -137 -492 -5 -72 -5 -72 43 -92 27 -11 75 -34 108 -51 32 -17 60 -28 63 -26 6 7 20 108 37 286 9 85 18 157 22 160 8 9 25 -23 60 -117 18 -46 39 -98 48 -116 8 -18 38 -93 66 -167 28 -74 55 -143 60 -154 10 -22 72 -199 101 -289 11 -33 18 -63 17 -68 -2 -5 -61 40 -130 101 -70 61 -131 111 -135 112 -4 0 -42 24 -83 54 -100 71 -349 195 -392 195 -8 0 -46 11 -85 24 -39 13 -74 22 -77 19 -2 -3 -20 0 -39 6 -75 25 -359 29 -415 5 -19 -7 -44 -14 -56 -14 -13 0 -56 -11 -96 -25 -40 -14 -80 -25 -88 -25 -19 0 -224 -101 -288 -142 -135 -87 -173 -118 -297 -241 -73 -73 -150 -159 -172 -192 -22 -33 -52 -77 -68 -97 -29 -39 -102 -176 -127 -238 -7 -19 -21 -47 -31 -61 -10 -14 -21 -38 -24 -55 -4 -16 -17 -58 -30 -94 -32 -87 -67 -200 -69 -225 -2 -11 -8 -36 -14 -55 -6 -19 -13 -51 -15 -70 -3 -19 -10 -57 -17 -85 -6 -27 -13 -66 -15 -85 -2 -19 -9 -80 -15 -135 -15 -129 -33 -460 -30 -565 5 -263 11 -405 19 -445 11 -55 29 -214 40 -345 4 -47 12 -94 18 -105 6 -11 13 -39 16 -63 6 -51 21 -70 65 -89 41 -17 98 6 120 47 14 28 8 240 -8 295 -17 56 -28 563 -16 750 10 171 17 244 27 305 6 36 11 72 11 80 0 8 5 35 10 60 5 25 11 59 13 75 4 43 43 203 61 248 8 21 12 42 9 48 -3 5 1 23 9 41 9 18 23 59 31 91 8 32 24 78 35 102 11 24 20 47 20 51 0 15 145 302 169 334 15 19 33 47 40 61 7 14 30 48 52 75 21 27 49 65 63 85 13 19 59 68 103 108 112 103 177 149 340 236 32 17 178 62 243 75 102 21 323 15 368 -9 12 -6 37 -13 58 -16 47 -6 297 -128 346 -169 20 -17 58 -47 84 -66 62 -45 271 -254 323 -322 22 -29 61 -80 85 -113 25 -33 56 -73 68 -89 13 -16 32 -48 43 -70 11 -23 34 -63 50 -91 51 -85 62 -107 120 -225 31 -63 63 -126 70 -141 8 -14 24 -52 36 -85 12 -32 28 -66 35 -74 7 -9 21 -45 30 -80 9 -36 19 -69 24 -75 7 -10 43 -126 75 -245 9 -36 26 -92 36 -124 11 -33 19 -73 19 -88 0 -16 7 -45 15 -65 8 -19 15 -48 15 -64 0 -15 4 -39 10 -53 5 -15 12 -53 15 -86 3 -33 9 -70 14 -82 5 -13 11 -77 15 -143 4 -66 11 -140 17 -165 28 -134 43 -679 24 -930 -10 -128 -26 -323 -30 -360 -11 -102 -25 -205 -40 -290 -9 -52 -18 -111 -20 -130 -3 -19 -9 -55 -14 -80 -6 -25 -18 -78 -27 -119 -9 -41 -17 -84 -19 -95 -2 -21 -21 -86 -58 -206 -11 -36 -20 -72 -20 -80 0 -8 -3 -19 -7 -25 -5 -5 -15 -32 -23 -60 -21 -71 -77 -200 -165 -383 -14 -29 -31 -57 -39 -63 -7 -7 -13 -17 -13 -24 0 -7 -18 -37 -39 -66 -22 -30 -50 -67 -62 -84 -23 -32 -97 -93 -139 -115 -15 -8 -61 -14 -115 -14 -147 -2 -220 46 -358 229 -33 44 -62 87 -65 95 -3 8 -18 35 -33 60 -15 25 -35 65 -45 90 -9 25 -23 52 -30 60 -8 9 -20 35 -28 58 -9 23 -22 57 -30 75 -38 83 -96 231 -96 246 0 9 -7 30 -16 46 -9 17 -20 44 -24 60 -4 17 -22 80 -39 140 -17 61 -40 142 -51 180 -11 39 -20 87 -20 108 0 22 -6 53 -14 70 -8 18 -17 55 -19 82 -6 62 -23 187 -38 280 -16 99 -18 165 -22 552 -2 328 -3 343 -23 370 -28 38 -72 49 -128 33 -76 -21 -103 -73 -112 -210 -2 -30 -6 -82 -9 -115 -24 -246 2 -813 47 -995 6 -25 14 -70 18 -100 12 -90 28 -168 38 -187 5 -10 13 -43 17 -73 3 -30 15 -81 26 -113 10 -31 19 -64 19 -73 0 -23 58 -231 89 -319 42 -119 116 -301 128 -316 7 -8 13 -20 13 -25 0 -14 47 -103 73 -138 13 -17 35 -51 49 -76 29 -50 177 -210 194 -210 6 0 18 -7 25 -16 48 -58 273 -158 384 -172 97 -12 236 3 290 31 17 9 55 28 85 43 76 37 152 101 243 205 42 48 77 91 77 94 0 3 20 36 44 73 45 68 136 239 136 256 0 5 9 27 20 50 42 89 132 338 146 400 2 11 10 40 19 65 8 25 17 62 19 81 3 19 9 48 15 63 11 27 25 92 55 242 42 209 48 242 48 269 0 15 3 39 8 52 5 13 12 56 16 96 3 40 8 76 10 79 1 3 6 43 9 90 4 46 8 95 10 109 2 14 4 41 4 60 l1 35 27 -35 c14 -19 64 -72 110 -117 100 -98 195 -150 348 -188 108 -27 292 -35 364 -15 20 5 74 16 121 25 47 9 114 25 150 37 59 19 96 33 225 86 151 62 430 230 558 335 181 148 307 281 465 492 101 136 107 145 144 209 40 67 44 74 55 87 16 20 146 283 177 359 15 36 31 74 36 85 14 28 75 219 109 340 62 221 98 451 118 768 3 54 1 142 -5 195 -6 54 -18 160 -26 237 -76 709 -386 1288 -855 1597 -131 87 -287 145 -533 199 -93 20 -332 6 -437 -25 -254 -77 -452 -186 -646 -358 -23 -21 -44 -38 -46 -38 -2 0 0 69 4 152 9 163 1 547 -13 663 -20 166 -52 320 -112 530 -57 200 -113 312 -212 427 -122 139 -313 193 -466 131z m190 -283 c5 0 25 -24 45 -54 153 -230 261 -884 215 -1295 -5 -47 -14 -142 -21 -211 -17 -188 -61 -466 -88 -559 -6 -19 -19 -44 -30 -55 -10 -12 -54 -75 -97 -141 -99 -151 -94 -142 -128 -206 -15 -30 -34 -61 -40 -69 -7 -8 -32 -64 -56 -125 -73 -183 -72 -353 2 -432 23 -24 97 -53 138 -53 71 0 132 43 214 151 37 47 156 244 156 256 0 2 14 32 30 66 40 83 125 328 151 435 24 100 47 133 215 313 316 336 541 477 799 499 152 13 385 -27 447 -77 7 -6 23 -14 36 -18 87 -26 305 -218 401 -351 164 -229 309 -605 361 -934 4 -30 14 -86 21 -125 17 -97 18 -633 1 -740 -31 -190 -35 -211 -67 -350 -59 -251 -198 -597 -324 -800 -16 -28 -47 -77 -67 -110 -159 -262 -457 -572 -704 -731 -25 -16 -54 -35 -65 -42 -110 -69 -311 -152 -459 -187 -83 -20 -273 -22 -348 -5 -341 81 -474 485 -321 975 8 28 21 64 28 80 8 17 28 64 46 105 17 41 40 87 50 102 11 14 19 29 19 32 0 3 21 38 47 78 26 40 52 80 58 89 38 59 70 102 119 158 31 36 56 67 56 71 0 12 298 301 370 358 96 76 113 96 113 132 0 61 -75 103 -135 76 -69 -31 -212 -124 -348 -225 -291 -216 -521 -467 -644 -700 -33 -65 -33 -65 -44 -30 -22 70 -35 126 -42 184 -4 33 -12 80 -18 105 -6 25 -16 72 -22 105 -6 33 -17 81 -25 106 -9 26 -18 69 -21 95 -7 51 -24 111 -124 414 -57 173 -126 400 -136 444 -7 34 -69 235 -180 576 l-66 205 5 320 c3 176 10 363 16 415 6 52 18 172 26 265 41 471 135 900 270 1230 49 121 110 203 141 191 8 -3 20 -6 24 -6z"} />
                  </g>
                </svg>
                <span style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; letter-spacing: -0.04em; line-height: 0.9; color: #C4B5FD; display: flex; flex-direction: column`)}>
                  <span style={css(`font-weight: 300`)}>
                    {"Clara"}
                  </span>
                  {" "}
                  <span style={css(`font-weight: 800`)}>
                    {"Bernadou"}
                  </span>
                </span>
              </div>
            </Link>
            {" "}
            <div className={"ft-liens"}>
              <Link href={"/mentions-legales"} style={css(`padding: 10px 0; color: #C4B5FD`)}>
                {"Mentions légales et confidentialité"}
              </Link>
              <Link href={"/accessibilite"} style={css(`padding: 10px 0; color: #C4B5FD`)}>
                {"Accessibilité : partiellement conforme"}
              </Link>
              <Link href={"/plan-du-site"} style={css(`padding: 10px 0; color: #C4B5FD`)}>
                {"Plan du site"}
              </Link>
            </div>
            {/* Connexion : masqué tant que l'administration n'existe pas (README §16). */}
            <Link href={"/admin/connexion"} style={css(`padding: 10px 0; color: #C4B5FD; opacity: 0.75; font-size: 14px`)}>
              {"Connexion"}
            </Link>
            </div>
            <span style={css(`text-align: center`)}>{"© 2026 Clara Bernadou"}</span>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
      </footer>
      {" "}
    </>
  );
}
