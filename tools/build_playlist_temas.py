#!/usr/bin/env python3
"""Genera los datos de playlist_temas.html a partir de tools/playlist_seminario3.json.

Cada video se clasifica por palabras clave de su título y canal: la sección
principal es la primera que coincide según PRIORITY (o la de OVERRIDES), y todas
las que coinciden se guardan como etiquetas para la búsqueda.

Uso:  python3 tools/build_playlist_temas.py
Reescribe el bloque entre los marcadores DATA-START / DATA-END del HTML.
"""
import html as htmllib
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tools" / "playlist_seminario3.json"
PAGE = ROOT / "playlist_temas.html"


def fold(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


# (id, nombre, descripción, palabras clave), en el orden en que se muestran.
SECTIONS = [
    ("ia", "Inteligencia artificial",
     "ChatGPT, OpenAI, redes neuronales, IA generativa, robots y el debate sobre máquinas que «piensan».",
     ["ai", "ia", "a.i", "artificial", "chatgpt", "openai", "neural", "neuron", "backpropagation",
      "dall", "stable diffusion", "dreamfusion", "alphago", "deepmind", "sentient", "godfather of ai",
      "robot", "robotic", "humanoid", "machines like men", "smarter than humans", "agent", "inteligencia",
      "pause giant", "how does artificial", "regresion lineal", "huang", "vibe-coded", "anthropic",
      "navier-stokes", "supercomputer"]),
    ("bigtech", "Big Tech y plataformas",
     "Google, Meta, Apple, Amazon, Microsoft, Twitter y TikTok: su poder, sus pleitos y sus modelos de negocio.",
     ["google", "meta", "facebook", "instagram", "whatsapp", "apple", "app store", "ios", "amazon", "bezos",
      "microsoft", "twitter", "tiktok", "musk", "zuckerberg", "metaverse", "big tech", "netflix",
      "consorcios digitales", "youtube", "twitch", "streamers", "booking", "reddit", "nvidia", "intel",
      "ley de servicios digitales", "internet is dying"]),
    ("datos", "Algoritmos, datos y vigilancia",
     "Algoritmos, big data, burbujas de filtro, privacidad, ciudades inteligentes y Estados que vigilan.",
     ["algorithm", "algoritm", "big data", "data", "datos", "filter bubble", "confirmation bias",
      "surveillance", "vigilancia", "policial", "smart cities", "knows everything", "privacy",
      "data protection", "esposito", "artificial communication", "uncertainty in the digital"]),
    ("ciber", "Ciberseguridad y hackeo",
     "Gobiernos y hospitales hackeados, fugas de datos, phreaking y cómo una canción puede tumbar una computadora.",
     ["hack", "hacked", "hacks", "phreaking", "crash a computer", "terabyte", "steal", "spy", "espia"]),
    ("geo", "Geopolítica de la tecnología",
     "La carrera tecnológica entre EE. UU., China, Europa, India y Corea; chips, regulación y guerra con drones.",
     ["china", "chinese", "india", "korea", "germany", "alemania", "eu ", "the eu", "russia", "africa",
      "ukraine", "drones", "war contractors", "chip", "taiwan", "taiwanes", "nueva ruta de la seda",
      "soviet", "australia", "albanese", "empire", "brics", "tariffs", "regulation", "uk government"]),
    ("finanzas", "Finanzas, fraudes y mercados",
     "GameStop, BlackRock, esquemas Ponzi y piramidales, cripto y blockchain, crisis bancarias y microfinanzas.",
     ["gamestop", "wall street", "wallstreet", "blackrock", "aladdin", "asset manager", "ponzi",
      "pyramid", "multilevel", "scam", "credit suisse", "banking", "ftx", "inflacion", "hipotecas",
      "day trading", "trader", "lose $20 billion", "microfinance", "blockchain", "bitcoin", "crypto",
      "stock crash", "ipo", "economia", "economy", "lawsuit", "settled", "money"]),
    ("emprendimiento", "Emprendimiento, startups e innovación",
     "Unicornios, startups en India, África y Brasil, M-Pesa, innovación educativa y el mito del emprendedor.",
     ["startup", "startups", "unicorns", "entrepreneur", "entrepreneurship", "emprend", "m-pesa",
      "mobile payment", "teachers", "tunapanda", "open badges", "innovation", "innovations", "innovacion",
      "garaje", "silicon valley", "tortilla", "prototipos", "autos electricos", "real estate",
      "faked foods", "big business", "make money", "women build businesses"]),
    ("historia", "Historia de la tecnología e internet",
     "De los autómatas al ChatGPT: la World Wide Web, la Ley de Moore, la máquina de Turing y las predicciones del pasado.",
     ["history", "historia", "origins", "invented", "world wide web", "web", "berners-lee", "internet",
      "1962", "1994", "1997", "1998", "bbc archive", "past predictions", "retro tech", "200-year-old",
      "turing", "moore", "35 year", "secret history", "25 aniversario", "cables", "grew from gaming",
      "why silicon valley is here", "new name", "quantum"]),
    ("mitos", "Mitos, filosofía e imaginarios",
     "Pandora, Prometeo, Ícaro, Talos y la caverna de Platón; consecuencias no deseadas, teoría de juegos y ciencia ficción.",
     ["myth", "mito", "pandora", "sisyphus", "prometheus", "icarus", "daedalus", "talos", "plato",
      "allegory", "cave", "unintended consequences", "sci-fi", "ancient greece", "game theory",
      "game of life", "chaotic", "les idees larges", "literature"]),
    ("sociedad", "Trabajo, salud y sociedad",
     "Trabajadores frente a la IA, salud mental, ambiente, consumo y los efectos cotidianos de la tecnología.",
     ["workers", "work for", "mental health", "therapy", "therapist", "companions", "toxic", "dam",
      "alcohol", "young people", "agricultores", "farmers", "call center", "extorsion", "prestamos",
      "pandemic", "covid", "layoffs", "planet a", "emotions"]),
]

# Prioridad para elegir la sección principal cuando un video toca varios temas.
PRIORITY = ["mitos", "ciber", "finanzas", "datos", "geo", "emprendimiento", "sociedad",
            "historia", "ia", "bigtech"]

# Correcciones manuales (id de YouTube -> sección) donde las palabras clave engañan.
OVERRIDES = {
    "ca7ufSI1Qxg": "sociedad",        # Trabajadores de Meta y vigilancia con IA
    "1bp12w_olDQ": "finanzas",        # La salida a bolsa de Anthropic
    "eVUYCiRLgB4": "geo",             # China y la carrera global de IA
    "gKOzDU64iPA": "mitos",           # Multimillonarios y ciencia ficción
    "FNqLrGGFH7c": "geo",             # Silicon Valley como contratista de guerra
    "pbW1ySDef_E": "historia",        # Apple y el phone phreaking
    "9XYt-_GdPIU": "ia",              # OpenAI y Navier-Stokes
    "9loU38NksKc": "bigtech",         # Meta: acuerdo de 18 mil millones
    "0ADvC4ioqe4": "bigtech",         # Demanda contra Meta
    "IlbPO9Vmuuo": "geo",             # ¿Qué le pasa a Alemania?
    "nIbxQN1nHsQ": "finanzas",        # Caída bursátil de IA en Corea
    "6hqnAml0iBY": "historia",        # Shure SM57 y tecnología espía soviética
    "1ih7WJrcjWg": "geo",             # Richard Wolff: el fin del imperio estadounidense
    "3ANw3Fhnbv8": "datos",           # Apple retira protección de datos en el Reino Unido
    "uiHxvR15SbA": "historia",        # El autómata de 200 años
    "KnXee-GN8AE": "historia",        # 1998: Musk y las startups de internet
    "d_gUVptaXyw": "sociedad",        # IA y salud mental
    "udCg6O7aeV4": "sociedad",        # Internet se está muriendo
    "ydiX4Iayosg": "historia",        # Silicon Valley necesita otro nombre
    "I19ezZcyB6w": "geo",             # Regulación europea de la IA
    "d3L2uPuxOxU": "historia",        # Nvidia: de los videojuegos a la IA
    "OFS90-FX6pg": "historia",        # 35 años de historia de ChatGPT
    "MZ1OMTevxdE": "emprendimiento",  # El mito del emprendedor
    "vBMY99HwcFM": "ia",              # Control de la IA
    "Ve810FHZ1CQ": "historia",        # Cables submarinos de internet
    "dO-G657yzWc": "bigtech",         # El poder de Google
    "-CTUJA5O7QA": "bigtech",         # 25 años de Google
    "K0OtGIPRcAs": "emprendimiento",  # Alimentos falsificados (Big Business)
    "6xvrKW2H_hA": "historia",        # Por qué Silicon Valley está ahí
    "WNr6QuAZVLY": "geo",             # Ley de Servicios Digitales de la UE
    "oqMjtHjTfyA": "bigtech",         # Booking.com
    "qlIURRhLPFw": "ia",              # Inteligencia artificial racista
    "SKia5QUiGkE": "bigtech",         # Musk compra Twitter
    "inJRQSrl9tY": "emprendimiento",  # Musk: visionario o empresario despiadado
    "YFQ-v1jCpF0": "finanzas",        # Reddit vs Wall Street
    "dBy4twDV4PY": "geo",             # China pierde su ventaja tecnológica
    "1x-i9z617z4": "emprendimiento",  # Cómo gana dinero Kurzgesagt en YouTube
    "eUTYpTdzNhM": "ia",              # Auto manejado con emociones
    "CFyP4Vfr2Oc": "geo",             # Por qué los gobiernos temen a TikTok
    "Jlbxj182bhg": "historia",        # Ley de Huang y Ley de Moore
    "5zunNs4Kx8U": "mitos",           # La Grecia antigua y las máquinas
    "oRF5SH6392s": "historia",        # Computación cuántica
    "EnPaXPr9W8Y": "finanzas",        # FTX, inflación e hipotecas
    "tCUuvyVwbJs": "bigtech",         # El tamaño de Amazon
    "A3cGMNxRNJ0": "bigtech",         # El poder de los consorcios digitales
    "UzGemfwaTT8": "datos",           # Amazon y la recolección de datos
    "vJ1cfb-5pHQ": "bigtech",         # La caída de Google
    "HyZhanswBBw": "finanzas",        # Aladdin de BlackRock
    "lHqlRYJsXGQ": "datos",           # Apple vs Facebook: privacidad
    "G-pAwZTFCKI": "datos",           # Apple vs Facebook: privacidad
    "kgCUn4fQTsc": "ia",              # ¿IA consciente?
    "2856XOaUPpg": "ia",              # ¿IA consciente?
    "QGLGq8WIMzM": "sociedad",        # Compañeros de IA
    "zb18MZn9Ies": "datos",           # Esposito: incertidumbre digital
    "hmiN2BsCJ7g": "datos",           # Esposito: algoritmos y literatura
    "3tjylTouTGc": "sociedad",        # Agricultores e inflación en EE. UU.
    "n87VBVbjUeE": "emprendimiento",  # M-Pesa
    "XpZ5STahhPE": "historia",        # 1994: ¿Listo para internet?
    "VMxKcdwrR4M": "emprendimiento",  # Cómo ganan dinero los streamers
    "PtSSoZW19vs": "geo",             # El plan de chips de Intel en EE. UU.
    "zbzcZr_Nadc": "geo",             # China y la supremacía en IA
    "qXO-D5sbRdA": "datos",           # Ciudades inteligentes chinas
    "Keme8oxHHPQ": "emprendimiento",  # Unicornios de India
    "4aZDNO7c8Z8": "emprendimiento",  # Startups africanas
    "Yl_4ovxnj2M": "emprendimiento",  # IA y bienes raíces en Seattle
    "fdcahbYu26o": "emprendimiento",  # Blockchain y mujeres emprendedoras en Brasil
    "h3oM-l5kNOk": "emprendimiento",  # Prototipos de autos eléctricos de Taiwán
    "pflohzdRGP0": "geo",             # Rusia y África
    "ebVH65IL8FY": "bigtech",         # El metaverso de Zuckerberg
    "ghZBY1f0Pt0": "bigtech",         # Publicidad en Apple
    "ux547wpA0dc": "datos",           # China: ¿Estado policial?
    "7gSU_Xes3GQ": "datos",           # China: ¿Estado de vigilancia?
    "F-k8e9i3ItU": "geo",             # Nueva Ruta de la Seda
    "V9Kr2SujqHw": "finanzas",        # Blockchain, bitcoin, NFT
    "Imkqe-IXDyw": "emprendimiento",  # Innovaciones científicas por la pandemia
    "zPyOnZpeFnQ": "emprendimiento",  # La covid y la innovación
    "vVTA-E3G8bQ": "mitos",           # Talos, el primer robot
    "0yCJMt9Mx9c": "ia",              # Cómo aprende la IA
    "Sb8XVheowVQ": "mitos",           # Modelos para una realidad caótica
    "DkhhE97Swmo": "sociedad",        # El cerebro del vibe coding
    "Iv7OdQMNzz0": "bigtech",         # El negocio de la App Store
    "xZD8_imniuo": "bigtech",         # Apple y la IA
    "JYVMuWGCtK4": "bigtech",         # Despidos en Big Tech
    "Gga8fNcZy38": "geo",             # India y la IA
    "keD6przLGBE": "ciber",           # El mayor hackeo de Berlín
    "iszhP8_cQvc": "sociedad",        # Nube tóxica en Nueva York
    "j-0cUmUyb-Y": "datos",           # Big Data
    "m5yVHer5SPk": "datos",           # La ciudad que lo sabe todo de ti
    "omMcrvVGTMs": "mitos",           # El juego de la vida
    "iaXLDz_UeYY": "historia",        # Máquina de Turing
}

ES_HINTS = re.compile(r"[ñ¿¡áéíóú]|\b(el|la|los|las|del|de|que|y|en|una|cómo|por|qué|para|con|es)\b", re.I)
EN_HINTS = re.compile(r"\b(the|of|and|how|why|is|what|to|in|for|with|are|does|you)\b", re.I)


def language(title, channel):
    # Los canales en español a veces muestran el título traducido al inglés:
    # el canal indica mejor el idioma del audio.
    if re.search(r"Español|Documental|Dot CSV|Bully|MILENIO|Derivando|Finanzas para todos|talento", channel):
        return "es"
    if channel == "ARTE":
        return "fr"
    if channel == "Galileo":
        return "de"
    t = re.sub(r"[|•].*$", "", title)
    es = len(ES_HINTS.findall(t))
    en = len(EN_HINTS.findall(t))
    return "es" if es > en else "en"


_RX = {}


def match(kw, hay):
    """Coincide al inicio de una palabra. Las claves de hasta 4 letras, o que
    terminan en «$», deben ser la palabra completa."""
    rx = _RX.get(kw)
    if rx is None:
        k = fold(kw).strip()
        whole = k.endswith("$") or len(k) <= 4
        k = k.rstrip("$")
        rx = _RX[kw] = re.compile(r"(?<![a-z0-9])" + re.escape(k) + (r"(?![a-z0-9])" if whole else ""))
    return bool(rx.search(hay))


def classify(vid, title, channel):
    hay = fold(title + " | " + channel)
    hits = {sid for sid, _, _, kws in SECTIONS if any(match(k, hay) for k in kws)}
    primary = OVERRIDES.get(vid) or next((p for p in PRIORITY if p in hits), "sociedad")
    order = [p for p in PRIORITY if p in hits or p == primary]
    return primary, [primary] + [p for p in order if p != primary]


def fmt_duration(sec):
    if not sec:
        return ""
    h, m, s = sec // 3600, sec % 3600 // 60, sec % 60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    out = []
    for v in data["videos"]:
        title = htmllib.unescape(v["title"]).strip()
        channel = htmllib.unescape(v.get("channel") or "")
        primary, tags = classify(v["id"], title, channel)
        out.append({
            "id": v["id"],
            "t": title,
            "c": channel,
            "d": v.get("duration") or 0,
            "ds": v.get("duration_string") or fmt_duration(v.get("duration") or 0),
            "v": v.get("view_count") or 0,
            "i": v.get("playlist_index") or 0,
            "l": v.get("language") or language(title, channel),
            "s": primary,
            "g": tags,
        })
    payload = {
        "title": data.get("playlist_title", "Seminario de Negocios Internacionales III"),
        "url": data.get("playlist_url"),
        "sections": [{"id": s, "n": n, "desc": d} for s, n, d, _ in SECTIONS],
        "videos": out,
    }
    js = "const PLAYLIST = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";"
    html = PAGE.read_text(encoding="utf-8")
    html = re.sub(r"(/\* DATA-START \*/).*?(/\* DATA-END \*/)",
                  lambda m: m.group(1) + "\n" + js + "\n" + m.group(2), html, flags=re.S)
    PAGE.write_text(html, encoding="utf-8")
    return payload


if __name__ == "__main__":
    import collections
    p = main()
    print(collections.Counter(v["s"] for v in p["videos"]))
    print(collections.Counter(v["l"] for v in p["videos"]))
    for v in p["videos"]:
        if v["id"] not in OVERRIDES:
            print(f'{v["s"]:15} {"/".join(v["g"][1:]):30} {v["l"]} {v["t"][:80]}')
