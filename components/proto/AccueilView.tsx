"use client";

import Link from "next/link";
import { css } from "@/lib/css";
import { CarteAlternance, FriseFormation } from "./Parcours";
import { Lieu } from "./Lieu";
import { Recommandations } from "./Recommandations";

// Généré depuis docs/passation/prototype-source/accueil-body.html
// (scripts/tools/gen.mjs) : markup et styles recopiés à l'identique.
/* eslint-disable @typescript-eslint/no-explicit-any */
export function AccueilView({ v }: { v: any }) {
  return (
    <>
      <main id={"contenu"} tabIndex={-1}>
        <section style={css(`max-width: 1200px; margin: 0 auto; padding: 2rem 2rem 2.5rem; display: flex; flex-wrap: wrap; gap: 3rem; align-items: center`)}>
          {" "}
          <div style={css(`flex: 1.45 1 460px; min-width: 0; display: flex; flex-direction: column; gap: 1.5rem`)}>
            {" "}
            <div style={css(`display: flex; flex-wrap: wrap; gap: 8px`)}>
              {" "}
              <span style={css(`display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 999px; background: #F3EFFF; font-size: 14px; font-weight: 700`)}>
                <span style={css(`width: 8px; height: 8px; border-radius: 50%; background: #067647`)} />
                {v.dispo}
              </span>
              {" "}
              <span style={css(`padding: 8px 14px; border-radius: 999px; border: 1.5px solid #B9A8EC; font-size: 14px; font-weight: 600`)}>
                <Lieu text={v.profil.lieu} />
              </span>
              {" "}
            </div>
            {" "}
            <h1 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: clamp(38px, 4vw, 54px); letter-spacing: -0.045em; line-height: 0.98`)}>
              <span style={css(`font-weight: 800; display: block`)}>
                {"Développeuse front‑end"}
              </span>
              <span style={css(`font-weight: 300; color: #6A4FB6; display: block`)}>
                {"& UI/UX designer"}
              </span>
            </h1>
            {" "}
            <p style={css(`margin: 0; font-size: 20px; line-height: 1.5; font-weight: 500; color: #5B5470`)}>
              {v.profil.accroche}
            </p>
            {" "}
            <div style={css(`display: flex; flex-wrap: wrap; gap: 12px`)}>
              <a href={"#projets"} style={css(`min-height: 48px; padding: 0 22px; border-radius: 999px; background: #6A4FB6; color: #FFFFFF; border: 2px solid #6A4FB6; display: inline-flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; text-decoration: none`)}>
                {"Voir les projets"}
              </a>
              <a href={v.cvUrl} target={"_blank"} rel={"noopener noreferrer"} style={css(`min-height: 48px; padding: 0 22px; border-radius: 999px; background: transparent; color: #1A1033; border: 2px solid #1A1033; display: inline-flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; text-decoration: none`)}>
                {"Télécharger le CV"}
              </a>
            </div>
            {" "}
          </div>
          {" "}
          <div className={"ds-panel"} style={css(`flex: 1 1 380px; min-width: 0; display: flex; flex-direction: column; gap: 14px`)}>
            {" "}
            <div style={css(`border-radius: 28px; overflow: hidden; box-shadow: 0 8px 24px rgba(26,16,51,0.08); height: 430px; display: flex; flex-direction: column`)}>
              {" "}
              <div style={css(`flex-grow: 1; background: linear-gradient(135deg, #F3EFFF 0%, #E9E2FB 100%); padding: 18px; display: flex; flex-direction: column; gap: 14px`)}>
                {" "}
                <div style={css(`display: flex; align-items: center; gap: 6px`)}>
                  <span style={css(`width: 10px; height: 10px; border-radius: 50%; background: #C4B5FD`)} />
                  <span style={css(`width: 10px; height: 10px; border-radius: 50%; background: #C4B5FD`)} />
                  <span style={css(`width: 10px; height: 10px; border-radius: 50%; background: #C4B5FD`)} />
                  <span style={css(`margin-left: 8px; font-size: 13px; font-weight: 700; color: #5B5470`)}>
                    {"Design system · ce portfolio"}
                  </span>
                </div>
                {" "}
                <div style={css(`display: flex; flex-wrap: wrap; gap: 12px; flex-grow: 1`)}>
                  {" "}
                  <div style={css(`flex: 1 1 150px; min-height: 150px; border-radius: 16px; background: #FFFFFF; display: flex; align-items: center; justify-content: center`)}>
                    <svg viewBox={"95 107 920 920"} width={"120"} height={"120"} role={"img"} aria-label={"Logo papillon de Clara Bernadou"} style={css(`flex-shrink: 0;`)}>
                      <g transform={"translate(0,1112) scale(0.1,-0.1)"} fill={"#6A4FB6"}>
                        <path d={"M5680 9893 c-100 -41 -204 -151 -269 -286 -106 -217 -211 -576 -261 -892 -5 -27 -14 -81 -20 -120 -14 -88 -24 -163 -39 -290 -7 -55 -16 -119 -22 -143 -5 -23 -9 -70 -10 -105 -1 -55 -2 -59 -12 -37 -42 89 -159 279 -201 327 -60 67 -111 92 -188 93 -71 0 -96 -10 -148 -56 -82 -74 -117 -202 -137 -492 -5 -72 -5 -72 43 -92 27 -11 75 -34 108 -51 32 -17 60 -28 63 -26 6 7 20 108 37 286 9 85 18 157 22 160 8 9 25 -23 60 -117 18 -46 39 -98 48 -116 8 -18 38 -93 66 -167 28 -74 55 -143 60 -154 10 -22 72 -199 101 -289 11 -33 18 -63 17 -68 -2 -5 -61 40 -130 101 -70 61 -131 111 -135 112 -4 0 -42 24 -83 54 -100 71 -349 195 -392 195 -8 0 -46 11 -85 24 -39 13 -74 22 -77 19 -2 -3 -20 0 -39 6 -75 25 -359 29 -415 5 -19 -7 -44 -14 -56 -14 -13 0 -56 -11 -96 -25 -40 -14 -80 -25 -88 -25 -19 0 -224 -101 -288 -142 -135 -87 -173 -118 -297 -241 -73 -73 -150 -159 -172 -192 -22 -33 -52 -77 -68 -97 -29 -39 -102 -176 -127 -238 -7 -19 -21 -47 -31 -61 -10 -14 -21 -38 -24 -55 -4 -16 -17 -58 -30 -94 -32 -87 -67 -200 -69 -225 -2 -11 -8 -36 -14 -55 -6 -19 -13 -51 -15 -70 -3 -19 -10 -57 -17 -85 -6 -27 -13 -66 -15 -85 -2 -19 -9 -80 -15 -135 -15 -129 -33 -460 -30 -565 5 -263 11 -405 19 -445 11 -55 29 -214 40 -345 4 -47 12 -94 18 -105 6 -11 13 -39 16 -63 6 -51 21 -70 65 -89 41 -17 98 6 120 47 14 28 8 240 -8 295 -17 56 -28 563 -16 750 10 171 17 244 27 305 6 36 11 72 11 80 0 8 5 35 10 60 5 25 11 59 13 75 4 43 43 203 61 248 8 21 12 42 9 48 -3 5 1 23 9 41 9 18 23 59 31 91 8 32 24 78 35 102 11 24 20 47 20 51 0 15 145 302 169 334 15 19 33 47 40 61 7 14 30 48 52 75 21 27 49 65 63 85 13 19 59 68 103 108 112 103 177 149 340 236 32 17 178 62 243 75 102 21 323 15 368 -9 12 -6 37 -13 58 -16 47 -6 297 -128 346 -169 20 -17 58 -47 84 -66 62 -45 271 -254 323 -322 22 -29 61 -80 85 -113 25 -33 56 -73 68 -89 13 -16 32 -48 43 -70 11 -23 34 -63 50 -91 51 -85 62 -107 120 -225 31 -63 63 -126 70 -141 8 -14 24 -52 36 -85 12 -32 28 -66 35 -74 7 -9 21 -45 30 -80 9 -36 19 -69 24 -75 7 -10 43 -126 75 -245 9 -36 26 -92 36 -124 11 -33 19 -73 19 -88 0 -16 7 -45 15 -65 8 -19 15 -48 15 -64 0 -15 4 -39 10 -53 5 -15 12 -53 15 -86 3 -33 9 -70 14 -82 5 -13 11 -77 15 -143 4 -66 11 -140 17 -165 28 -134 43 -679 24 -930 -10 -128 -26 -323 -30 -360 -11 -102 -25 -205 -40 -290 -9 -52 -18 -111 -20 -130 -3 -19 -9 -55 -14 -80 -6 -25 -18 -78 -27 -119 -9 -41 -17 -84 -19 -95 -2 -21 -21 -86 -58 -206 -11 -36 -20 -72 -20 -80 0 -8 -3 -19 -7 -25 -5 -5 -15 -32 -23 -60 -21 -71 -77 -200 -165 -383 -14 -29 -31 -57 -39 -63 -7 -7 -13 -17 -13 -24 0 -7 -18 -37 -39 -66 -22 -30 -50 -67 -62 -84 -23 -32 -97 -93 -139 -115 -15 -8 -61 -14 -115 -14 -147 -2 -220 46 -358 229 -33 44 -62 87 -65 95 -3 8 -18 35 -33 60 -15 25 -35 65 -45 90 -9 25 -23 52 -30 60 -8 9 -20 35 -28 58 -9 23 -22 57 -30 75 -38 83 -96 231 -96 246 0 9 -7 30 -16 46 -9 17 -20 44 -24 60 -4 17 -22 80 -39 140 -17 61 -40 142 -51 180 -11 39 -20 87 -20 108 0 22 -6 53 -14 70 -8 18 -17 55 -19 82 -6 62 -23 187 -38 280 -16 99 -18 165 -22 552 -2 328 -3 343 -23 370 -28 38 -72 49 -128 33 -76 -21 -103 -73 -112 -210 -2 -30 -6 -82 -9 -115 -24 -246 2 -813 47 -995 6 -25 14 -70 18 -100 12 -90 28 -168 38 -187 5 -10 13 -43 17 -73 3 -30 15 -81 26 -113 10 -31 19 -64 19 -73 0 -23 58 -231 89 -319 42 -119 116 -301 128 -316 7 -8 13 -20 13 -25 0 -14 47 -103 73 -138 13 -17 35 -51 49 -76 29 -50 177 -210 194 -210 6 0 18 -7 25 -16 48 -58 273 -158 384 -172 97 -12 236 3 290 31 17 9 55 28 85 43 76 37 152 101 243 205 42 48 77 91 77 94 0 3 20 36 44 73 45 68 136 239 136 256 0 5 9 27 20 50 42 89 132 338 146 400 2 11 10 40 19 65 8 25 17 62 19 81 3 19 9 48 15 63 11 27 25 92 55 242 42 209 48 242 48 269 0 15 3 39 8 52 5 13 12 56 16 96 3 40 8 76 10 79 1 3 6 43 9 90 4 46 8 95 10 109 2 14 4 41 4 60 l1 35 27 -35 c14 -19 64 -72 110 -117 100 -98 195 -150 348 -188 108 -27 292 -35 364 -15 20 5 74 16 121 25 47 9 114 25 150 37 59 19 96 33 225 86 151 62 430 230 558 335 181 148 307 281 465 492 101 136 107 145 144 209 40 67 44 74 55 87 16 20 146 283 177 359 15 36 31 74 36 85 14 28 75 219 109 340 62 221 98 451 118 768 3 54 1 142 -5 195 -6 54 -18 160 -26 237 -76 709 -386 1288 -855 1597 -131 87 -287 145 -533 199 -93 20 -332 6 -437 -25 -254 -77 -452 -186 -646 -358 -23 -21 -44 -38 -46 -38 -2 0 0 69 4 152 9 163 1 547 -13 663 -20 166 -52 320 -112 530 -57 200 -113 312 -212 427 -122 139 -313 193 -466 131z m190 -283 c5 0 25 -24 45 -54 153 -230 261 -884 215 -1295 -5 -47 -14 -142 -21 -211 -17 -188 -61 -466 -88 -559 -6 -19 -19 -44 -30 -55 -10 -12 -54 -75 -97 -141 -99 -151 -94 -142 -128 -206 -15 -30 -34 -61 -40 -69 -7 -8 -32 -64 -56 -125 -73 -183 -72 -353 2 -432 23 -24 97 -53 138 -53 71 0 132 43 214 151 37 47 156 244 156 256 0 2 14 32 30 66 40 83 125 328 151 435 24 100 47 133 215 313 316 336 541 477 799 499 152 13 385 -27 447 -77 7 -6 23 -14 36 -18 87 -26 305 -218 401 -351 164 -229 309 -605 361 -934 4 -30 14 -86 21 -125 17 -97 18 -633 1 -740 -31 -190 -35 -211 -67 -350 -59 -251 -198 -597 -324 -800 -16 -28 -47 -77 -67 -110 -159 -262 -457 -572 -704 -731 -25 -16 -54 -35 -65 -42 -110 -69 -311 -152 -459 -187 -83 -20 -273 -22 -348 -5 -341 81 -474 485 -321 975 8 28 21 64 28 80 8 17 28 64 46 105 17 41 40 87 50 102 11 14 19 29 19 32 0 3 21 38 47 78 26 40 52 80 58 89 38 59 70 102 119 158 31 36 56 67 56 71 0 12 298 301 370 358 96 76 113 96 113 132 0 61 -75 103 -135 76 -69 -31 -212 -124 -348 -225 -291 -216 -521 -467 -644 -700 -33 -65 -33 -65 -44 -30 -22 70 -35 126 -42 184 -4 33 -12 80 -18 105 -6 25 -16 72 -22 105 -6 33 -17 81 -25 106 -9 26 -18 69 -21 95 -7 51 -24 111 -124 414 -57 173 -126 400 -136 444 -7 34 -69 235 -180 576 l-66 205 5 320 c3 176 10 363 16 415 6 52 18 172 26 265 41 471 135 900 270 1230 49 121 110 203 141 191 8 -3 20 -6 24 -6z"} />
                      </g>
                    </svg>
                  </div>
                  {" "}
                  <div style={css(`flex: 1 1 170px; border-radius: 16px; background: #FFFFFF; padding: 14px; display: flex; flex-direction: column; gap: 8px`)}>
                    <span style={css(`font-size: 13px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #5B5470`)}>
                      {"Couleurs"}
                    </span>
                    <div style={css(`display: flex; align-items: center; gap: 8px`)}>
                      <span style={css(`width: 22px; height: 22px; border-radius: 6px; background: #1A1033; border: 1px solid #E4DCF7; flex-shrink: 0`)} />
                      <span style={css(`font-size: 13px; font-weight: 700`)}>
                        {"Encre"}
                      </span>
                      <span style={css(`font-size: 13px; color: #5B5470; margin-left: auto`)}>
                        {"#1A1033"}
                      </span>
                    </div>
                    <div style={css(`display: flex; align-items: center; gap: 8px`)}>
                      <span style={css(`width: 22px; height: 22px; border-radius: 6px; background: #6A4FB6; border: 1px solid #E4DCF7; flex-shrink: 0`)} />
                      <span style={css(`font-size: 13px; font-weight: 700`)}>
                        {"Améthyste"}
                      </span>
                      <span style={css(`font-size: 13px; color: #5B5470; margin-left: auto`)}>
                        {"#6A4FB6"}
                      </span>
                    </div>
                    <div style={css(`display: flex; align-items: center; gap: 8px`)}>
                      <span style={css(`width: 22px; height: 22px; border-radius: 6px; background: #C4B5FD; border: 1px solid #E4DCF7; flex-shrink: 0`)} />
                      <span style={css(`font-size: 13px; font-weight: 700`)}>
                        {"Lilas"}
                      </span>
                      <span style={css(`font-size: 13px; color: #5B5470; margin-left: auto`)}>
                        {"#C4B5FD"}
                      </span>
                    </div>
                    <div style={css(`display: flex; align-items: center; gap: 8px`)}>
                      <span style={css(`width: 22px; height: 22px; border-radius: 6px; background: #F3EFFF; border: 1px solid #E4DCF7; flex-shrink: 0`)} />
                      <span style={css(`font-size: 13px; font-weight: 700`)}>
                        {"Brume"}
                      </span>
                      <span style={css(`font-size: 13px; color: #5B5470; margin-left: auto`)}>
                        {"#F3EFFF"}
                      </span>
                    </div>
                    <div style={css(`display: flex; align-items: center; gap: 8px`)}>
                      <span style={css(`width: 22px; height: 22px; border-radius: 6px; background: #5B5470; border: 1px solid #E4DCF7; flex-shrink: 0`)} />
                      <span style={css(`font-size: 13px; font-weight: 700`)}>
                        {"Ardoise"}
                      </span>
                      <span style={css(`font-size: 13px; color: #5B5470; margin-left: auto`)}>
                        {"#5B5470"}
                      </span>
                    </div>
                  </div>
                  {" "}
                </div>
                {" "}
                <div style={css(`display: flex; flex-wrap: wrap; gap: 12px`)}>
                  {" "}
                  <div style={css(`flex: 1 1 150px; border-radius: 16px; background: #FFFFFF; padding: 14px; display: flex; align-items: center; gap: 14px`)}>
                    <span style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 34px; font-weight: 800; letter-spacing: -0.04em; color: #6A4FB6`)}>
                      {"Aa"}
                    </span>
                    <span style={css(`display: flex; flex-direction: column; font-size: 13px; color: #5B5470`)}>
                      <b style={css(`color: #1A1033`)}>
                        {"Bricolage Grotesque"}
                      </b>
                      {"Titres"}
                    </span>
                  </div>
                  {" "}
                  <div style={css(`flex: 1 1 150px; border-radius: 16px; background: #FFFFFF; padding: 14px; display: flex; align-items: center; gap: 14px`)}>
                    <span style={css(`font-size: 32px; font-weight: 500`)}>
                      {"Aa"}
                    </span>
                    <span style={css(`display: flex; flex-direction: column; font-size: 13px; color: #5B5470`)}>
                      <b style={css(`color: #1A1033`)}>
                        {"Manrope"}
                      </b>
                      {"Textes"}
                    </span>
                  </div>
                  {" "}
                  <div style={css(`flex: 1 1 170px; border-radius: 16px; background: #FFFFFF; padding: 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap`)}>
                    <span style={css(`padding: 8px 14px; border-radius: 999px; background: #6A4FB6; color: #FFFFFF; font-size: 13px; font-weight: 700`)}>
                      {"Bouton"}
                    </span>
                    <span style={css(`padding: 4px 10px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #B9A8EC; color: #6A4FB6; font-size: 14px; font-weight: 700`)}>
                      {"Tag"}
                    </span>
                  </div>
                  {" "}
                </div>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </section>
        <section aria-label={"En bref"} style={css(`max-width: 1200px; margin: 0 auto; padding: 0 2rem 4.5rem`)}>
          <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(160px, 100%), 1fr)); gap: 1px; background: #E4DCF7; border: 1px solid #E4DCF7; border-radius: 20px; overflow: hidden`)}>
            <li style={css(`background: #FFFFFF; padding: 22px 24px; display: flex; flex-direction: column; gap: 4px; color: #1A1033`)}>
              <span style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 40px; font-weight: 800; letter-spacing: -0.04em; color: #6A4FB6`)}>
                {"4"}
              </span>{" "}
              <span style={css(`font-size: 15px; font-weight: 700`)}>
                {"formations OpenClassrooms"}
              </span>
            </li>
            <li style={css(`background: #FFFFFF; padding: 22px 24px; display: flex; flex-direction: column; gap: 4px; color: #1A1033`)}>
              <span style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 40px; font-weight: 800; letter-spacing: -0.04em; color: #6A4FB6`)}>
                {"Bac+5"}
              </span>{" "}
              <span style={css(`font-size: 15px; font-weight: 700`)}>
                {"Full Stack Java & Angular"}
              </span>
            </li>
            <li style={css(`background: #FFFFFF; padding: 22px 24px; display: flex; flex-direction: column; gap: 4px; color: #1A1033`)}>
              <span style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 40px; font-weight: 800; letter-spacing: -0.04em; color: #6A4FB6`)}>
                {"40"}
              </span>{" "}
              <span style={css(`font-size: 15px; font-weight: 700`)}>
                {"projets, dont 23 avec livrables"}
              </span>
            </li>
            <li style={css(`background: #FFFFFF; padding: 22px 24px; display: flex; flex-direction: column; gap: 4px; color: #1A1033`)}>
              <span style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 40px; font-weight: 800; letter-spacing: -0.04em; color: #6A4FB6`)}>
                {"2"}
              </span>{" "}
              <span style={css(`font-size: 15px; font-weight: 700`)}>
                {"alternances depuis 2023"}
              </span>
            </li>
          </ul>
        </section>
        <section id={"projets"} style={css(`max-width: 1200px; margin: 0 auto; padding: 0 2rem 4.5rem; display: flex; flex-direction: column; gap: 1.5rem`)}>
          {" "}
          <div style={css(`display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 1rem`)}>
            <div style={css(`display: flex; flex-direction: column; gap: 10px`)}>
              <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 44px; letter-spacing: -0.04em; line-height: 1.02; color: #1A1033`)}>
                <span style={css(`font-weight: 800`)}>
                  {"Projets"}
                </span>
                {" "}
                <span style={css(`font-weight: 300; color: #6A4FB6`)}>
                  {"sélectionnés"}
                </span>
              </h2>
            </div>
            <Link href={"/projets"} style={css(`padding: 12px 0; font-size: 16px; font-weight: 700`)}>
              {"Les 40 projets →"}
            </Link>
          </div>
          {" "}
          <div style={css(`display: flex; flex-direction: column; gap: 12px`)}>
            <h3 style={css(`margin: 0; font-size: 14px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>
              {"En entreprise"}
            </h3>
            <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 1.25rem`)}>
              {v.homeEntreprise.map((c: any) => (
                <li key={c.id}>
                  <Link href={`/projets/${c.id}`} style={css(`text-decoration: none; color: #1A1033; border-radius: 22px; background: #FFFFFF; border: 1px solid #E4DCF7; border-top: 4px solid #6A4FB6; padding: 24px; display: flex; flex-direction: column; gap: 12px; height: 100%; box-sizing: border-box`)}>
                    {" "}
                    <div style={css(`display: flex; justify-content: space-between; align-items: center; gap: 8px`)}>
                      <span style={css(`font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>
                        {c.eyebrow}
                      </span>
                    </div>
                    {" "}
                    <h4 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; overflow-wrap: break-word`)}>
                      {c.name}
                    </h4>
                    {" "}
                    <span style={css(`font-size: 16px; line-height: 1.5; color: #5B5470; overflow-wrap: break-word`)}>
                      {c.line}
                    </span>
                    {" "}
                    <ul role={"list"} className={"liste-nue"} style={css(`display: flex; gap: 6px; flex-wrap: wrap; align-content: flex-end; min-height: 64px; margin-top: auto`)}>
                      {c.tags.map((t: string, i_t: number) => (
                        <li key={i_t} style={css(`padding: 4px 10px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #B9A8EC; color: #6A4FB6; font-size: 14px; font-weight: 700`)}>
                          {t}
                        </li>
                      ))}
                    </ul>
                    {" "}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {" "}
          <div style={css(`display: flex; flex-direction: column; gap: 12px`)}>
            <h3 style={css(`margin: 0; font-size: 14px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>
              {"Développement"}
            </h3>
            <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 1.25rem`)}>
              {v.homeDev.map((c: any) => (
                <li key={c.id}>
                  <Link href={`/projets/${c.id}`} style={css(`text-decoration: none; color: #1A1033; border-radius: 22px; background: #FFFFFF; border: 1px solid #E4DCF7; border-top: 4px solid #6A4FB6; padding: 24px; display: flex; flex-direction: column; gap: 12px; height: 100%; box-sizing: border-box`)}>
                    {" "}
                    <div style={css(`display: flex; justify-content: space-between; align-items: center; gap: 8px`)}>
                      <span style={css(`font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>
                        {c.eyebrow}
                      </span>
                    </div>
                    {" "}
                    <h4 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; overflow-wrap: break-word`)}>
                      {c.name}
                    </h4>
                    {" "}
                    <span style={css(`font-size: 16px; line-height: 1.5; color: #5B5470; overflow-wrap: break-word`)}>
                      {c.line}
                    </span>
                    {" "}
                    <ul role={"list"} className={"liste-nue"} style={css(`display: flex; gap: 6px; flex-wrap: wrap; align-content: flex-end; min-height: 64px; margin-top: auto`)}>
                      {c.tags.map((t: string, i_t: number) => (
                        <li key={i_t} style={css(`padding: 4px 10px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #B9A8EC; color: #6A4FB6; font-size: 14px; font-weight: 700`)}>
                          {t}
                        </li>
                      ))}
                    </ul>
                    {" "}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {" "}
          <div style={css(`display: flex; flex-direction: column; gap: 12px`)}>
            <h3 style={css(`margin: 0; font-size: 14px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>
              {"Design"}
            </h3>
            <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 1.25rem`)}>
              {v.homeDesign.map((c: any) => (
                <li key={c.id}>
                  <Link href={`/projets/${c.id}`} style={css(`text-decoration: none; color: #1A1033; border-radius: 22px; background: #FFFFFF; border: 1px solid #E4DCF7; border-top: 4px solid #6A4FB6; padding: 24px; display: flex; flex-direction: column; gap: 12px; height: 100%; box-sizing: border-box`)}>
                    {" "}
                    <div style={css(`display: flex; justify-content: space-between; align-items: center; gap: 8px`)}>
                      <span style={css(`font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #5B5470`)}>
                        {c.eyebrow}
                      </span>
                    </div>
                    {" "}
                    <h4 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 26px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; overflow-wrap: break-word`)}>
                      {c.name}
                    </h4>
                    {" "}
                    <span style={css(`font-size: 16px; line-height: 1.5; color: #5B5470; overflow-wrap: break-word`)}>
                      {c.line}
                    </span>
                    {" "}
                    <ul role={"list"} className={"liste-nue"} style={css(`display: flex; gap: 6px; flex-wrap: wrap; align-content: flex-end; min-height: 64px; margin-top: auto`)}>
                      {c.tags.map((t: string, i_t: number) => (
                        <li key={i_t} style={css(`padding: 4px 10px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #B9A8EC; color: #6A4FB6; font-size: 14px; font-weight: 700`)}>
                          {t}
                        </li>
                      ))}
                    </ul>
                    {" "}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {" "}
        </section>
        <section id={"parcours"} style={css(`background: linear-gradient(135deg, #F3EFFF 0%, #E9E2FB 100%); padding: 4.5rem 0`)}>
          {" "}
          <div style={css(`max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: flex; flex-direction: column; gap: 1.75rem`)}>
            {" "}
            <div style={css(`display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 1rem`)}>
              <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 44px; letter-spacing: -0.04em; line-height: 1.02; color: #1A1033`)}>
                <span style={css(`font-weight: 800`)}>
                  {"Parcours"}
                </span>
                {" "}
                <span style={css(`font-weight: 300; color: #6A4FB6`)}>
                  {"en alternance"}
                </span>
              </h2>
              <Link href={"/cv"} style={css(`padding: 12px 0; font-size: 16px; font-weight: 700`)}>
                {"Voir le CV →"}
              </Link>
            </div>
            {" "}
            <ul role={"list"} className={"liste-nue"} style={css(`display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: 1.25rem`)}>
              {v.alternances.map((e: any, i_e: number) => (
                <li key={i_e} style={css(`display: grid`)}>
                  <CarteAlternance e={e} />
                </li>
              ))}
            </ul>
            {" "}
            <div style={css(`display: flex; flex-direction: column; gap: 22px; padding: 28px; border-radius: 24px; background: #FFFFFF`)}>
              <h3 style={css(`margin: 0; font-size: 14px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #5B5470`)}>
                {"Formations OpenClassrooms"}
              </h3>
              <ol className={"tl"} aria-label={"Formations OpenClassrooms, de la plus ancienne à la plus récente"}>
                {v.frise.map((f: any, i_f: number) => (
                  <FriseFormation key={i_f} f={f} />
                ))}
              </ol>
            </div>
            {" "}
          </div>
          {" "}
        </section>
        <section className={"zone-sombre"} style={css(`background: linear-gradient(160deg, #1A1033 0%, #2E1065 100%); padding: 4.5rem 0`)}>
          <div style={css(`max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: flex; flex-wrap: wrap; gap: 3rem; align-items: center`)}>
            {" "}
            <div style={css(`flex: 1.3 1 400px; display: flex; flex-direction: column; gap: 16px`)}>
              <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 44px; letter-spacing: -0.04em; line-height: 1.02; color: #FFFFFF`)}>
                <span style={css(`font-weight: 800`)}>
                  {"L’IA,"}
                </span>
                {" "}
                <span style={css(`font-weight: 300; color: #C4B5FD`)}>
                  {"au quotidien"}
                </span>
              </h2>
              <p style={css(`margin: 0; font-size: 19px; line-height: 1.55; color: #C4B5FD`)}>
                {"J’utilise l’IA tous les jours pour développer, concevoir et produire du contenu. Je choisis l’outil le plus adapté à chaque tâche, et je crée des skills et des routines pour mon équipe et pour moi."}
              </p>
              <Link href={"/ia"} style={css(`align-self: flex-start; min-height: 48px; padding: 0 22px; border-radius: 999px; background: #FFFFFF; color: #1A1033; display: inline-flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 800; text-decoration: none`)}>
                {"Ma façon de travailler avec l’IA"}
                <span aria-hidden={"true"}>
                  {"→"}
                </span>
              </Link>
            </div>
            {" "}
            <div style={css(`flex: 1 1 380px; display: flex; flex-direction: column; gap: 14px`)}>
              <div style={css(`border-radius: 22px; background: rgba(255,255,255,0.06); border: 1px solid rgba(196,181,253,0.35); padding: 22px; display: flex; flex-direction: column; gap: 12px`)}>
                <span style={css(`font-size: 14px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #C4B5FD`)}>
                  {"Mon IA de prédilection"}
                </span>
                <span style={css(`font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 34px; font-weight: 800; letter-spacing: -0.04em; color: #FFFFFF`)}>
                  {"Claude"}
                </span>
                <ul role={"list"} className={"liste-nue"} style={css(`display: flex; gap: 6px; flex-wrap: wrap`)}>
                  <li style={css(`padding: 5px 10px; border-radius: 8px; background: rgba(196,181,253,0.12); border: 1px solid rgba(196,181,253,0.55); color: #C4B5FD; font-size: 14px; font-weight: 700`)}>
                    {"Claude Code"}
                  </li>
                  <li style={css(`padding: 5px 10px; border-radius: 8px; background: rgba(196,181,253,0.12); border: 1px solid rgba(196,181,253,0.55); color: #C4B5FD; font-size: 14px; font-weight: 700`)}>
                    {"Claude Design"}
                  </li>
                  <li style={css(`padding: 5px 10px; border-radius: 8px; background: rgba(196,181,253,0.12); border: 1px solid rgba(196,181,253,0.55); color: #C4B5FD; font-size: 14px; font-weight: 700`)}>
                    {"Claude Cowork"}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section aria-labelledby={"recos"} style={css(`max-width: 1200px; margin: 0 auto; padding: 4.5rem 2rem; display: flex; flex-direction: column; gap: 1.5rem`)}>
          <div id={"recos"}>
            <h2 style={css(`margin: 0; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-variation-settings: 'opsz' 96; font-size: 44px; letter-spacing: -0.04em; line-height: 1.02; color: #1A1033`)}>
              <span style={css(`font-weight: 800`)}>
                {"Ils"}
              </span>
              {" "}
              <span style={css(`font-weight: 300; color: #6A4FB6`)}>
                {"me recommandent"}
              </span>
            </h2>
          </div>
          <Recommandations items={v.recos} />
        </section>
      </main>
    </>
  );
}
