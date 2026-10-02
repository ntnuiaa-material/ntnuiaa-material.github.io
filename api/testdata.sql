-- Testdata, kun til lokal utvikling. Kjøres aldri mot den ekte databasen.

INSERT INTO ting (id, type, navn, kategori, hjem_id) VALUES
  (3001, 'lokasjon', 'Boden, Campus', 'Lokasjon', NULL),
  (3002, 'lokasjon', 'Hylle 1', 'Lokasjon', 3001),
  (3003, 'lokasjon', 'Hylle 2', 'Lokasjon', 3001),
  (3004, 'lokasjon', 'Skap, styrerommet', 'Lokasjon', NULL),
  (1001, 'utstyr', 'Telt Nordisk Oppland 4', 'Tur', 3002),
  (1002, 'utstyr', 'Telt Nordisk Oppland 4', 'Tur', 3002),
  (1003, 'utstyr', 'Primus Eta Lite', 'Tur', 3002),
  (1010, 'utstyr', 'Klatretau Mammut 60 m', 'Klatring', 3003),
  (1020, 'utstyr', 'Høyttaler JBL PartyBox', 'Arrangement', 3004),
  (2001, 'bulk', 'Kasse T-skjorter 2026', 'Klær', 3002),
  (2002, 'bulk', 'Kjegler, gule', 'Ball', 3003);

INSERT INTO varianter (ting_id, navn, antall) VALUES
  (2001, 'S', 6), (2001, 'M', 14), (2001, 'L', 9), (2001, 'XL', 3),
  (2002, 'Stk', 40);

INSERT INTO utlaan (ting_id, navn, telefon, utlaant, frist) VALUES
  (1002, 'Ola Nordmann', '912 34 567', '2026-09-20', '2026-10-04'),
  (1010, 'Kari Fjell', '478 11 222', '2026-09-10', '2026-09-24');

INSERT INTO hendelser (ting_id, hendelse, detaljer) VALUES
  (1002, 'utlaant', 'Utlånt til Ola Nordmann'),
  (1010, 'utlaant', 'Utlånt til Kari Fjell');
