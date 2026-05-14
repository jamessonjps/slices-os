-- Seed.sql: Insira dados iniciais para testar o sistema.
-- Lembre-se de rodar o supabase_schema.sql antes!

-- 1. Cria uma loja (store) padrão
INSERT INTO stores (id, name) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Pizzaria SliceOS')
ON CONFLICT DO NOTHING;

-- 2. Cria as configurações para a loja
INSERT INTO settings (store_id, whatsapp_number, store_name, delivery_fee, business_hours)
VALUES (
    '11111111-1111-1111-1111-111111111111', 
    '5511999999999', 
    'Pizzaria SliceOS', 
    5.00,
    '{"Segunda": {"open": "18:00", "close": "23:00", "closed": false}, "Terça": {"open": "18:00", "close": "23:00", "closed": false}, "Quarta": {"open": "18:00", "close": "23:00", "closed": false}, "Quinta": {"open": "18:00", "close": "23:00", "closed": false}, "Sexta": {"open": "18:00", "close": "00:00", "closed": false}, "Sábado": {"open": "18:00", "close": "00:00", "closed": false}, "Domingo": {"open": "18:00", "close": "23:00", "closed": false}}'
)
ON CONFLICT DO NOTHING;

-- 3. Insere alguns produtos (Menu Items) de exemplo
INSERT INTO menu_items (store_id, name, description, price, price_small, price_medium, price_large, category, type, image_url, available, prep_time, stock_quantity)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Margherita', 'Molho de tomate, mussarela e manjericão fresco.', null, 35.00, 45.00, 55.00, 'pizza_tradicional', 'pizza', '', true, 30, 100),
('11111111-1111-1111-1111-111111111111', 'Calabresa', 'Calabresa fatiada com cebola e orégano.', null, 35.00, 45.00, 55.00, 'pizza_tradicional', 'pizza', '', true, 30, 80),
('11111111-1111-1111-1111-111111111111', 'Quatro Queijos', 'Mussarela, provolone, parmesão e gorgonzola.', null, 40.00, 50.00, 60.00, 'pizza_especial', 'pizza', '', true, 35, 50),
('11111111-1111-1111-1111-111111111111', 'Chocolate com Morango', 'Chocolate, morango e leite condensado.', null, 38.00, 48.00, null, 'pizza_doce', 'pizza', '', true, 30, 20),
('11111111-1111-1111-1111-111111111111', 'Refrigerante 2L', 'Coca-Cola 2 litros.', 15.00, null, null, null, 'bebida', 'drink', '', true, 0, 120),
('11111111-1111-1111-1111-111111111111', 'Pudim', 'Pudim de leite condensado caseiro.', 12.00, null, null, null, 'sobremesa', 'dessert', '', true, 5, 20)
ON CONFLICT DO NOTHING;
