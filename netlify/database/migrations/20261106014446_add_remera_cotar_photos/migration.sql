UPDATE "products"
SET "images" = ARRAY[
  '/productos/remera-cotar-negro.jpg',
  '/productos/remera-cotar-blanco.jpg',
  '/productos/remera-cotar-verde.jpg',
  '/productos/remera-cotar-azul-marino.jpg',
  '/productos/remera-cotar-gris.jpg'
]::text[],
"colors" = ARRAY['Negro','Blanco','Verde','Azul marino','Gris']::text[]
WHERE "name" = 'Remera Cotar lisa' AND "images" = '{}'::text[];
