-- ============================================================
-- SliceOS: Adicionar coluna allow_half_half na tabela menu_items
-- Rodar este script no Editor SQL do Supabase
-- ============================================================

-- 1. Garantir que a coluna 'available' existe
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true;

-- 2. Criar a nova coluna 'allow_half_half'
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS allow_half_half BOOLEAN DEFAULT false;

-- 3. Setar allow_half_half = true para pizzas tradicionais e especiais
UPDATE menu_items
SET allow_half_half = true
WHERE category IN ('pizza_tradicional', 'pizza_especial');

-- 4. Garantir que bebidas, sobremesas e pizzas doces ficam com false
UPDATE menu_items
SET allow_half_half = false
WHERE category IN ('bebida', 'sobremesa', 'pizza_doce', 'pizza_6_fatias')
   OR category IS NULL;

-- 5. Verificar resultado
SELECT name, category, available, allow_half_half FROM menu_items ORDER BY category, name;
