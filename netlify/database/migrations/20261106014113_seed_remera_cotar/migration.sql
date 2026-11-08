INSERT INTO "products" ("name", "description", "category", "price", "compare_price", "sizes", "colors", "available", "featured")
SELECT
  'Remera Cotar lisa',
  'Remera lisa de algodón, cómoda y resistente para el día a día. Disponible en negro, blanco, verde, azul marino y gris.',
  'Remeras',
  12000,
  15000,
  ARRAY['S','M','L','XL','XXL','3XL','4XL']::text[],
  ARRAY['Negro','Blanco','Verde','Azul marino','Gris']::text[],
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM "products" WHERE "name" = 'Remera Cotar lisa');
