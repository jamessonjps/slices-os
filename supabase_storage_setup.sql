-- Script para criação do Bucket de Imagens no Supabase Storage e liberação de políticas (RLS)

-- 1. Criar o bucket "images" caso não exista
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- (O comando ALTER TABLE foi removido pois a tabela storage.objects já vem com RLS ativado no Supabase e tentá-lo estava gerando o erro de permissão 42501).

-- 2. Criar política para LEITURA PÚBLICA das imagens do cardápio
-- Qualquer cliente na internet deve poder carregar e ver as fotos das pizzas
DROP POLICY IF EXISTS "Imagens Públicas" ON storage.objects;
CREATE POLICY "Imagens Públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- 3. Criar política para ESCRITA/INSERÇÃO (Apenas Administradores Logados)
-- Apenas usuários autenticados da loja podem subir novas fotos
DROP POLICY IF EXISTS "Upload Apenas Para Logados" ON storage.objects;
CREATE POLICY "Upload Apenas Para Logados"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- 4. Criar política para UPDATE (Apenas Administradores Logados)
DROP POLICY IF EXISTS "Update Apenas Para Logados" ON storage.objects;
CREATE POLICY "Update Apenas Para Logados"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- 5. Criar política para DELETE (Apenas Administradores Logados)
DROP POLICY IF EXISTS "Delete Apenas Para Logados" ON storage.objects;
CREATE POLICY "Delete Apenas Para Logados"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);
