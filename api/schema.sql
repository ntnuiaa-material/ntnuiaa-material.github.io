-- Datamodell for lageret. Se Brain/NTNUI/Lagersystem/Datamodell.md.

CREATE TABLE IF NOT EXISTS ting (
  id          INTEGER PRIMARY KEY,
  type        TEXT NOT NULL CHECK (type IN ('utstyr', 'bulk', 'lokasjon')),
  navn        TEXT NOT NULL,
  kategori    TEXT,
  beskrivelse TEXT,
  hjem_id     INTEGER REFERENCES ting(id),
  bilde       TEXT,
  utlaanbar   INTEGER NOT NULL DEFAULT 1,
  bruk        TEXT NOT NULL DEFAULT 'utlaan' CHECK (bruk IN ('utlaan', 'forbruk', 'salg')),
  pris        INTEGER,
  status      TEXT NOT NULL DEFAULT 'aktiv' CHECK (status IN ('aktiv', 'kassert')),
  opprettet   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS varianter (
  id      INTEGER PRIMARY KEY,
  ting_id INTEGER NOT NULL REFERENCES ting(id),
  navn    TEXT NOT NULL,
  antall  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS utlaan (
  id      INTEGER PRIMARY KEY,
  ting_id INTEGER NOT NULL REFERENCES ting(id),
  variant TEXT,
  antall  INTEGER NOT NULL DEFAULT 1,
  navn    TEXT NOT NULL,
  telefon TEXT NOT NULL,
  utlaant TEXT NOT NULL DEFAULT (date('now')),
  frist   TEXT,
  levert  TEXT
);

CREATE TABLE IF NOT EXISTS hendelser (
  id       INTEGER PRIMARY KEY,
  ting_id  INTEGER NOT NULL REFERENCES ting(id),
  tid      TEXT NOT NULL DEFAULT (datetime('now')),
  hendelse TEXT NOT NULL,
  detaljer TEXT
);

CREATE INDEX IF NOT EXISTS utlaan_aapne ON utlaan(ting_id) WHERE levert IS NULL;
CREATE INDEX IF NOT EXISTS varianter_ting ON varianter(ting_id);
CREATE INDEX IF NOT EXISTS hendelser_tid ON hendelser(tid);

-- Shopen. Samme tabeller som migrasjoner/0003_shop.sql.

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
