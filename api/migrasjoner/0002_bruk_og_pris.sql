-- Skiller mellom utlån, forbruk og salg, og gir salgsvarer en pris.
ALTER TABLE ting ADD COLUMN bruk TEXT NOT NULL DEFAULT 'utlaan' CHECK (bruk IN ('utlaan', 'forbruk', 'salg'));
ALTER TABLE ting ADD COLUMN pris INTEGER;
UPDATE ting SET bruk = 'forbruk' WHERE type = 'bulk' AND utlaanbar = 0;
