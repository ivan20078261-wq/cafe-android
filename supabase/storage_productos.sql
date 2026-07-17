-- Crear bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'productos',
  'productos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Permitir subir imágenes a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden subir imágenes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'productos');

-- Permitir subir imágenes con anon key (para admins desde la web)
CREATE POLICY "Anon puede subir imágenes"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'productos');

-- Todos pueden leer imágenes
CREATE POLICY "Cualquiera puede leer imágenes"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'productos');

-- Agregar columna imagen_url a productos (si no existe)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen_url TEXT;
