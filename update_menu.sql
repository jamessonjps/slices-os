-- script_update_menu.sql
-- Store ID: d5003041-d34c-484e-a78e-6a523a0f681d

-- 1. Atualizar as configurações da loja
UPDATE settings 
SET 
  whatsapp_number = '5582999612528',
  delivery_fee = 2.00,
  store_name = 'Pizza Milano'
WHERE store_id = 'd5003041-d34c-484e-a78e-6a523a0f681d';

-- 2. Limpar cardápio antigo (opcional, mas recomendado para evitar duplicidade se estivermos recriando tudo)
DELETE FROM menu_items WHERE store_id = 'd5003041-d34c-484e-a78e-6a523a0f681d';

-- 3. Inserir Pizzas Tradicionais - Nível 1 (R$ 35,00)
INSERT INTO menu_items (store_id, name, description, price, price_small, price_medium, price_large, category, type, available)
VALUES 
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Mussarela', 'Molho de tomate, mussarela, orégano e azeitona.', null, 35.00, 35.00, 35.00, 'pizza_tradicional_v1', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Marguerita', 'Molho de tomate, mussarela, tomate, manjericão, orégano e azeitona.', null, 35.00, 35.00, 35.00, 'pizza_tradicional_v1', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Mista', 'Molho de tomate, mussarela, presunto, orégano e azeitona.', null, 35.00, 35.00, 35.00, 'pizza_tradicional_v1', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', '3 Queijos', 'Molho de tomate, queijo mussarela, queijo prato, cheddar, orégano e azeitona.', null, 35.00, 35.00, 35.00, 'pizza_tradicional_v1', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Milho', 'Molho de tomate, queijo mussarela, milho verde, orégano e azeitona.', null, 35.00, 35.00, 35.00, 'pizza_tradicional_v1', 'pizza', true);

-- 4. Inserir Pizzas Tradicionais - Nível 2 (R$ 40,00)
INSERT INTO menu_items (store_id, name, description, price, price_small, price_medium, price_large, category, type, available)
VALUES 
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Frango C/ Catupiry', 'Molho de tomate, mussarela, frango, requeijão, orégano e azeitona.', null, 40.00, 40.00, 40.00, 'pizza_tradicional_v2', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Calabresa', 'Molho de tomate, mussarela, calabresa, cebola, orégano e azeitona.', null, 40.00, 40.00, 40.00, 'pizza_tradicional_v2', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Portuguesa', 'Molho de tomate, mussarela, presunto, ovo cozido, pimentão, cebola, orégano e azeitona.', null, 40.00, 40.00, 40.00, 'pizza_tradicional_v2', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Baiana', 'Molho de tomate, mussarela, calabresa moída apimentada, cebola, orégano e azeitona.', null, 40.00, 40.00, 40.00, 'pizza_tradicional_v2', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Bacon', 'Molho de tomate, mussarela, bacon, cebola, milho, orégano e azeitona.', null, 40.00, 40.00, 40.00, 'pizza_tradicional_v2', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Catupibresa', 'Molho de tomate, mussarela, calabresa, requeijão, cebola, orégano e azeitona.', null, 40.00, 40.00, 40.00, 'pizza_tradicional_v2', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Cheddarbresa', 'Molho de tomate, mussarela, calabresa, cheddar, cebola, orégano e azeitona.', null, 40.00, 40.00, 40.00, 'pizza_tradicional_v2', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', '4 Queijos', 'Molho de tomate, queijo mussarela, queijo prato, queijo provolone, cheddar, orégano e azeitona.', null, 40.00, 40.00, 40.00, 'pizza_tradicional_v2', 'pizza', true);

-- 5. Inserir Pizzas Especiais (R$ 50,00)
INSERT INTO menu_items (store_id, name, description, price, price_small, price_medium, price_large, category, type, available)
VALUES 
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Sertaneja', 'Molho de tomate, mussarela, carne do sol, queijo coalho, cebola, orégano e azeitona.', null, 50.00, 50.00, 50.00, 'pizza_especial', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Charque', 'Molho de tomate, mussarela, charque, cebola, requeijão, orégano e azeitona.', null, 50.00, 50.00, 50.00, 'pizza_especial', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Caipira', 'Molho de tomate, mussarela, frango, milho, bacon, cebola, orégano e azeitona.', null, 50.00, 50.00, 50.00, 'pizza_especial', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Atum', 'Molho de tomate, mussarela, tomate, azeitona e orégano.', null, 50.00, 50.00, 50.00, 'pizza_especial', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Lombinho', 'Molho de tomate, mussarela, lombinho, cebola, orégano e azeitona.', null, 50.00, 50.00, 50.00, 'pizza_especial', 'pizza', true);

-- 6. Inserir 6 Fatias (R$ 28,00) - Apenas 1 sabor
INSERT INTO menu_items (store_id, name, description, price, price_small, price_medium, price_large, category, type, available)
VALUES 
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Frango (6 Fatias)', 'Pizza de 6 fatias, apenas 1 sabor.', 28.00, null, null, null, 'pizza_6_fatias', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Calabresa (6 Fatias)', 'Pizza de 6 fatias, apenas 1 sabor.', 28.00, null, null, null, 'pizza_6_fatias', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Mussarela (6 Fatias)', 'Pizza de 6 fatias, apenas 1 sabor.', 28.00, null, null, null, 'pizza_6_fatias', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Mista (6 Fatias)', 'Pizza de 6 fatias, apenas 1 sabor.', 28.00, null, null, null, 'pizza_6_fatias', 'pizza', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', '3 Queijos (6 Fatias)', 'Pizza de 6 fatias, apenas 1 sabor.', 28.00, null, null, null, 'pizza_6_fatias', 'pizza', true);

-- 7. Inserir Bebidas
INSERT INTO menu_items (store_id, name, description, price, category, type, available)
VALUES 
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Coca-Cola 1L', 'Garrafa de 1 Litro.', 10.00, 'bebida', 'drink', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Coca-Cola 2L', 'Garrafa de 2 Litros.', 15.00, 'bebida', 'drink', true),
('d5003041-d34c-484e-a78e-6a523a0f681d', 'Guaraná 2L', 'Garrafa de 2 Litros.', 15.00, 'bebida', 'drink', true);
