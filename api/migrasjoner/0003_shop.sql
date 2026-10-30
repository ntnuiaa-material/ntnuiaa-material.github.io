-- Bestillinger fra shopen (docs/shop). Se Brain/NTNUI/Nettbutikk/Nettbutikk_MOC.md.
-- Plagg, størrelse og gruppe beholdes til statistikk. Navn, telefon og e-post anonymiseres
-- av cron 6 måneder etter at pulja er levert, eller etter at bestillingen ble avbestilt.

CREATE TABLE IF NOT EXISTS shop_puljer (
  id        INTEGER PRIMARY KEY,
  navn      TEXT NOT NULL,
  opprettet TEXT NOT NULL DEFAULT (datetime('now')),
  sendt     TEXT,
  levert    TEXT
);

CREATE TABLE IF NOT EXISTS shop_bestillinger (
  id         INTEGER PRIMARY KEY,
  ordrenr    TEXT NOT NULL UNIQUE,
  opprettet  TEXT NOT NULL DEFAULT (datetime('now')),
  navn       TEXT NOT NULL,
  telefon    TEXT NOT NULL,
  epost      TEXT NOT NULL,
  kommentar  TEXT,
  sprak      TEXT NOT NULL DEFAULT 'nb',
  status     TEXT NOT NULL DEFAULT 'ny' CHECK (status IN ('ny', 'pulje', 'avbestilt')),
  avbestilt  TEXT,
  pulje_id   INTEGER REFERENCES shop_puljer(id),
  sum        INTEGER NOT NULL,
  anonymisert INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS shop_linjer (
  id            INTEGER PRIMARY KEY,
  bestilling_id INTEGER NOT NULL REFERENCES shop_bestillinger(id),
  plagg         TEXT NOT NULL,
  artikkel      TEXT,
  farge         TEXT NOT NULL,
  kjonn         TEXT NOT NULL,
  storrelse     TEXT NOT NULL,
  gruppe        TEXT NOT NULL,
  front         TEXT NOT NULL,
  bak           TEXT NOT NULL,
  navn          TEXT,
  antall        INTEGER NOT NULL,
  stykkpris     INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS shop_bestillinger_status ON shop_bestillinger(status);
CREATE INDEX IF NOT EXISTS shop_linjer_bestilling ON shop_linjer(bestilling_id);
