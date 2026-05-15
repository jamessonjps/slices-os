-- Arquivo: update_menu_v2.sql
-- Objetivo: Limpar o cardápio existente e injetar os dados com as novas categorias e preços.

-- CUIDADO: Este comando apagará todos os itens do cardápio atual da sua loja.
DELETE FROM menu_items;

-- Pega o ID da loja ativa (assumindo single-tenant para simplificar no seed)
DO $$
DECLARE
    v_store_id UUID;
BEGIN
    SELECT id INTO v_store_id FROM stores LIMIT 1;
    
    IF v_store_id IS NULL THEN
        RAISE EXCEPTION 'Nenhuma loja encontrada na tabela stores.';
    END IF;

    -- ==========================================
    -- 1. Pizzas Tradicionais (Tamanho M - 8 Fatias)
    -- ==========================================
    INSERT INTO menu_items (store_id, name, description, price_medium, price_small, category, type, available, image_url) VALUES
    (v_store_id, 'Mussarela', 'Molho de tomate, mussarela, orégano e azeitona.', 35.00, NULL, 'pizza_tradicional', 'pizza', true, ''),
    (v_store_id, 'Marguerita', 'Molho de tomate, mussarela, tomate, manjericão, orégano e azeitona.', 35.00, NULL, 'pizza_tradicional', 'pizza', true, ''),
    (v_store_id, 'Mista', 'Molho de tomate, mussarela, presunto, orégano e azeitona.', 35.00, NULL, 'pizza_tradicional', 'pizza', true, ''),
    (v_store_id, '3 Queijos', 'Molho de tomate, queijo mussarela, queijo prato, cheddar, orégano e azeitona.', 35.00, NULL, 'pizza_tradicional', 'pizza', true, ''),
    (v_store_id, 'Milho', 'Molho de tomate, queijo mussarela, milho verde, orégano e azeitona.', 35.00, NULL, 'pizza_tradicional', 'pizza', true, ''),
    (v_store_id, 'Frango C/Catupiry', 'Molho de tomate, mussarela, frango, requeijão, orégano e azeitona.', 40.00, NULL, 'pizza_tradicional', 'pizza', true, ''),
    (v_store_id, 'Calabresa', 'Molho de tomate, mussarela, calabresa, cebola, orégano e azeitona.', 40.00, NULL, 'pizza_tradicional', 'pizza', true, ''),
    (v_store_id, 'Portuguesa', 'Molho de tomate, mussarela, presunto, ovo cozido, pimentão, cebola, orégano e azeitona.', 40.00, NULL, 'pizza_tradicional', 'pizza', true, ''),
    (v_store_id, 'Baiana', 'Molho de tomate, mussarela, calabresa moída apimentada, cebola, orégano e azeitona.', 40.00, NULL, 'pizza_tradicional', 'pizza', true, ''),
    (v_store_id, 'Bacon', 'Molho de tomate, mussarela, bacon, cebola, milho, orégano e azeitona.', 40.00, NULL, 'pizza_tradicional', 'pizza', true, ''),
    (v_store_id, 'Catupibresa', 'Molho de tomate, mussarela, calabresa, requeijão, cebola, orégano e azeitona.', 40.00, NULL, 'pizza_tradicional', 'pizza', true, ''),
    (v_store_id, 'Cheddarbresa', 'Molho de tomate, mussarela, calabresa, cheddar, cebola, orégano e azeitona.', 40.00, NULL, 'pizza_tradicional', 'pizza', true, ''),
    (v_store_id, '4 Queijos', 'Molho de tomate, queijo mussarela, queijo prato, queijo provolone, cheddar, orégano e azeitona.', 40.00, NULL, 'pizza_tradicional', 'pizza', true, '');

    -- ==========================================
    -- 2. Pizzas Especiais (Tamanho M - 8 Fatias)
    -- ==========================================
    INSERT INTO menu_items (store_id, name, description, price_medium, price_small, category, type, available, image_url) VALUES
    (v_store_id, 'Sertaneja', 'Molho de tomate, mussarela, carne do sol, queijo coalho, cebola, orégano e azeitona.', 50.00, NULL, 'pizza_especial', 'pizza', true, ''),
    (v_store_id, 'Charque', 'Molho de tomate, mussarela, charque, cebola, requeijão, orégano e azeitona.', 50.00, NULL, 'pizza_especial', 'pizza', true, ''),
    (v_store_id, 'Caipira', 'Molho de tomate, mussarela, frango, milho, bacon, cebola, orégano e azeitona.', 50.00, NULL, 'pizza_especial', 'pizza', true, ''),
    (v_store_id, 'Atum', 'Molho de tomate, mussarela, tomate, azeitona e orégano.', 50.00, NULL, 'pizza_especial', 'pizza', true, ''),
    (v_store_id, 'Lombinho', 'Molho de tomate, mussarela, lombinho, cebola, orégano e azeitona.', 50.00, NULL, 'pizza_especial', 'pizza', true, '');

    -- ==========================================
    -- 3. Pizzas 6 Fatias (Tamanho P - 6 Fatias)
    -- ==========================================
    -- Para essas pizzas, usamos o campo price_small e ignoramos price_medium para diferenciar na UI
    INSERT INTO menu_items (store_id, name, description, price_medium, price_small, category, type, available, image_url) VALUES
    (v_store_id, 'Frango', 'Apenas 1 sabor.', NULL, 28.00, 'pizza_6_fatias', 'pizza', true, ''),
    (v_store_id, 'Calabresa', 'Apenas 1 sabor.', NULL, 28.00, 'pizza_6_fatias', 'pizza', true, ''),
    (v_store_id, 'Mussarela', 'Apenas 1 sabor.', NULL, 28.00, 'pizza_6_fatias', 'pizza', true, ''),
    (v_store_id, 'Mista', 'Apenas 1 sabor.', NULL, 28.00, 'pizza_6_fatias', 'pizza', true, ''),
    (v_store_id, '3 Queijos', 'Apenas 1 sabor.', NULL, 28.00, 'pizza_6_fatias', 'pizza', true, '');

    -- ==========================================
    -- 4. Bebidas
    -- ==========================================
    INSERT INTO menu_items (store_id, name, description, price, category, type, available, image_url) VALUES
    (v_store_id, 'Coca-Cola 1L', '', 10.00, 'bebida', 'drink', true, ''),
    (v_store_id, 'Coca-Cola 2L', '', 15.00, 'bebida', 'drink', true, ''),
    (v_store_id, 'Guaraná 2L', '', 15.00, 'bebida', 'drink', true, '');

END $$;
