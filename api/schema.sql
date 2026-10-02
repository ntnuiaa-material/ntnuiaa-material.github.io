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
