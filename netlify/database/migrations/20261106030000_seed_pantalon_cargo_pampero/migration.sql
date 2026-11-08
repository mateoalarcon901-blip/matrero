INSERT INTO "products" ("name", "description", "category", "price", "compare_price", "sizes", "colors", "images", "available", "featured")
SELECT
  'Pantalón cargo Pampero stretch',
  'Pantalón cargo de tela stretch, liviano y resistente, ideal para el trabajo o el tiempo libre. Bolsillos cargo laterales con cierre, bolsillo trasero con cierre y refuerzos en las rodillas.',
  'Pantalones',
  75000,
  0,
  ARRAY['S','M','L','XL','XXL']::text[],
  ARRAY['Negro']::text[],
  ARRAY[
    '/productos/pantalon-cargo-pampero-negro-1.jpg',
    '/productos/pantalon-cargo-pampero-negro-2.jpg',
    '/productos/pantalon-cargo-pampero-negro-3.jpg',
    '/productos/pantalon-cargo-pampero-negro-4.jpg',
    '/productos/pantalon-cargo-pampero-negro-5.jpg'
  ]::text[],
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM "products" WHERE "name" = 'Pantalón cargo Pampero stretch');
