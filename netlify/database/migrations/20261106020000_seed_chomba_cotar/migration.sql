INSERT INTO "products" ("name", "description", "category", "price", "compare_price", "sizes", "colors", "images", "available", "featured")
SELECT
  'Chomba Cotar lisa',
  'Chomba lisa de piqué, con cuello y botones, cómoda y prolija para el día a día. Disponible en gris, negro y azul marino.',
  'Chombas',
  20000,
  0,
  ARRAY['S','M','L','XL','XXL','3XL','4XL']::text[],
  ARRAY['Gris','Negro','Azul marino']::text[],
  ARRAY[
    '/productos/chomba-cotar-gris.jpg',
    '/productos/chomba-cotar-negro.jpg',
    '/productos/chomba-cotar-azul-marino.jpg'
  ]::text[],
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM "products" WHERE "name" = 'Chomba Cotar lisa');
