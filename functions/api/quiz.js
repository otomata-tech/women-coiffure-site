// Relais du quiz de trichologie (/quiz/) vers le tableau oto « qualiopi-trichologie » (ADR 0004).
// Seul point du site qui reçoit des données. Il valide un envoi de la page (début de
// formation, ou fin + satisfaction), puis écrit la ligne du stagiaire par sa clé
// `id_stagiaire` : le premier envoi la crée, le second la complète. Le jeton oto reste
// côté serveur (secret Pages `OTO_QUIZ_TOKEN`, portée `write` sur ce seul tableau).
// Le relais ne lit jamais la ligne ; le navigateur ne reçoit que `{ok:true}` ou une
// erreur générique.
//
// Champs admis = les 25 colonnes de la table 948 (schéma relu le 05/11/2026), qui sont
// aussi exactement ce qu'envoie public/quiz/index.html : tout changement de l'un se
// reporte dans les deux autres.

// Tableau oto `qualiopi-trichologie` (org 307 « women.distrib »).
const OTO_NS_ID = 948;
const OTO_KEY = "id_stagiaire";
const OTO_API_BASE = "https://mcp.oto.cx";
// Doit rester identique à la constante SESSION de public/quiz/index.html.
const SESSION = "Trichologie Artemoda · DAVINES Paris · 9-10/11/2026";

const MAX_BODY_BYTES = 16 * 1024;
const PRODUCTION_HOST = "www.women-coiffure.fr";
const PREVIEW_HOST_SUFFIX = ".women-coiffure.pages.dev";

const NIVEAUX = ["Découverte", "Initié·e", "Confirmé·e", "Expert·e"];
const OUI_NON = ["Oui", "Non"];
const RECONTACT = ["Oui", "Non", "Non précisé"];

// UUID v4 tiré par `crypto.randomUUID()` dans la page : rien d'autre ne désigne une ligne.
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
// `new Date().toLocaleString("fr-FR", {dateStyle:"short", timeStyle:"short"})`.
const DATE_FR = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/;
// « O1 : Acquis ; O2 : En cours ; O3 : Non acquis ; O4 : — »
const OBJECTIFS = /^O1 : (Non acquis|En cours|Acquis|—) ; O2 : (Non acquis|En cours|Acquis|—) ; O3 : (Non acquis|En cours|Acquis|—) ; O4 : (Non acquis|En cours|Acquis|—)$/;

class Invalide extends Error {}

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const refus = (status, error) => json(status, { ok: false, error });

function origineAdmise(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  // Même origine que la requête : la page du quiz poste vers son propre site.
  if (origin !== new URL(request.url).origin) return false;
  if (env.QUIZ_DEV_ORIGIN && origin === env.QUIZ_DEV_ORIGIN) return true;
  const { hostname, protocol } = new URL(origin);
  return protocol === "https:" &&
    (hostname === PRODUCTION_HOST || hostname.endsWith(PREVIEW_HOST_SUFFIX));
}

// Validateurs : chacun rend la valeur à écrire, `undefined` pour « rien à écrire »
// (une cellule vide n'écrase jamais ce que le premier envoi a posé), ou lève.
const texte = (max, requis = false) => (v) => {
  if (v === undefined || v === null || v === "") {
    if (requis) throw new Invalide();
    return undefined;
  }
  if (typeof v !== "string") throw new Invalide();
  const t = v.trim();
  if (t.length > max || (requis && !t)) throw new Invalide();
  return t || undefined;
};
const motif = (re) => (v) => {
  if (typeof v !== "string" || !re.test(v)) throw new Invalide();
  return v;
};
const parmi = (valeurs) => (v) => {
  if (!valeurs.includes(v)) throw new Invalide();
  return v;
};
const entier = (min, max, nul = false) => (v) => {
  if (v === null && nul) return undefined;
  if (!Number.isInteger(v) || v < min || v > max) throw new Invalide();
  return v;
};
const moyenne = (v) => {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 1 || v > 4) throw new Invalide();
  if (Math.round(v * 10) / 10 !== v) throw new Invalide();
  return v;
};

// Ce que porte chaque envoi, en plus de l'identité.
const IDENTITE = {
  id_stagiaire: motif(UUID_V4),
  session: parmi([SESSION]),
  nom: texte(80, true),
  prenom: texte(80, true),
  salon: texte(120),
};
const DEBUT = {
  fonction: texte(120),
  attentes: texte(2000),
  date_entree: motif(DATE_FR),
  niveau_ressenti: parmi(NIVEAUX),
  score_entree: entier(0, 100),
  niveau_entree: parmi(NIVEAUX),
  objectifs_entree: motif(OBJECTIFS),
};
const FIN = {
  date_sortie: motif(DATE_FR),
  score_sortie: entier(0, 100),
  niveau_sortie: parmi(NIVEAUX),
  progression: entier(-100, 100, true),
  objectifs_sortie: motif(OBJECTIFS),
  date_satisfaction: motif(DATE_FR),
  notes_satisfaction: texte(1500, true),
  satisfaction_moyenne: moyenne,
  recommande: parmi(OUI_NON),
  retient: texte(2000),
  ameliorer: texte(2000),
  premier_geste: texte(2000),
  recontact_suivi: parmi(RECONTACT),
};

// Rend la ligne à écrire, ou lève : le motif ne sort jamais vers le navigateur.
function ligne(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Invalide();
  // Un envoi est un début OU une fin, complet : chaque champ de son étape est présent
  // (vide permis pour les textes libres), aucun autre champ n'est admis.
  const etape = "date_entree" in body ? DEBUT : "date_sortie" in body ? FIN : null;
  if (!etape) throw new Invalide();
  const attendus = { ...IDENTITE, ...etape };
  const cles = Object.keys(body);
  if (cles.some((k) => !(k in attendus))) throw new Invalide();
  if (Object.keys(attendus).some((k) => k !== "salon" && !(k in body))) throw new Invalide();
  const row = {};
  for (const [k, valider] of Object.entries(attendus)) {
    const v = valider(body[k]);
    if (v !== undefined) row[k] = v;
  }
  if (etape === DEBUT && row.niveau_entree !== niveauDe(row.score_entree)) throw new Invalide();
  if (etape === FIN && row.niveau_sortie !== niveauDe(row.score_sortie)) throw new Invalide();
  return row;
}

// Mêmes seuils que LEVELS dans la page.
function niveauDe(p) {
  return p >= 85 ? NIVEAUX[3] : p >= 65 ? NIVEAUX[2] : p >= 40 ? NIVEAUX[1] : NIVEAUX[0];
}

async function lireCorps(request) {
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > MAX_BODY_BYTES) return null;
  const buf = await request.arrayBuffer();
  if (buf.byteLength > MAX_BODY_BYTES) return null;
  return new TextDecoder().decode(buf);
}

export async function onRequest({ request, env }) {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { allow: "POST" } });
  }
  if (!origineAdmise(request, env)) return refus(403, "forbidden");
  const ct = request.headers.get("Content-Type") || "";
  if (!ct.toLowerCase().startsWith("application/json")) return refus(415, "unsupported");

  const raw = await lireCorps(request);
  if (raw === null) return refus(413, "too_large");

  let row;
  try {
    row = ligne(JSON.parse(raw));
  } catch {
    return refus(400, "invalid");
  }

  if (!env.OTO_QUIZ_TOKEN) {
    console.error("quiz: secret OTO_QUIZ_TOKEN absent");
    return refus(503, "unavailable");
  }
  const base = env.OTO_API_BASE || OTO_API_BASE;
  let res;
  try {
    // `?key=` désigne la ligne par sa clé métier : créée si nouvelle, complétée sinon.
    res = await fetch(`${base}/api/datastores/${OTO_NS_ID}/rows?key=${OTO_KEY}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OTO_QUIZ_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(row),
    });
  } catch (e) {
    console.error("quiz: oto injoignable", e && e.message);
    return refus(502, "unavailable");
  }
  if (!res.ok) {
    // Le statut seul, jamais le corps (il peut citer la ligne).
    console.error("quiz: oto a refusé l'écriture", res.status);
    return refus(502, "unavailable");
  }
  return json(200, { ok: true });
}
