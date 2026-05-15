-- Schema inicial para o SliceOS SaaS

-- 1. Tabela Base: Lojas (Stores)
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true
);

-- Habilitar RLS nas stores
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lojas públicas para leitura" ON stores FOR SELECT USING (true);
CREATE POLICY "Admins podem atualizar sua loja" ON stores FOR UPDATE USING (id = auth.jwt() ->> 'store_id'::uuid);

-- 1.1 Tabela de Usuários (Profiles)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'staff', -- 'admin', 'staff'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários veem perfis da sua loja" ON users FOR SELECT USING (store_id = (SELECT store_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Admins gerenciam perfis da sua loja" ON users FOR ALL USING (store_id = (SELECT store_id FROM users WHERE id = auth.uid()));

-- 2. Tabela de Configurações (Settings)
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    whatsapp_number TEXT,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    store_name TEXT,
    business_hours JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(store_id)
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Configurações visíveis publicamente" ON settings FOR SELECT USING (true);
CREATE POLICY "Admins podem editar configs" ON settings FOR UPDATE USING (store_id = (auth.jwt() ->> 'store_id')::uuid);

-- 3. Tabela de Produtos (Menu Items)
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    price_small DECIMAL(10,2),
    price_medium DECIMAL(10,2),
    price_large DECIMAL(10,2),
    category TEXT,
    type TEXT, -- 'pizza', 'drink', 'dessert'
    image_url TEXT,
    available BOOLEAN DEFAULT true,
    prep_time INTEGER,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Produtos visíveis publicamente" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Admins gerenciam produtos" ON menu_items FOR ALL USING (store_id = (auth.jwt() ->> 'store_id')::uuid);

-- Tabela de Produtos (Estoque)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT, -- 'ingrediente', 'bebida', 'embalagem'
    quantity DECIMAL(10,2) DEFAULT 0,
    unit TEXT, -- 'kg', 'g', 'l', 'ml', 'unidade'
    min_quantity DECIMAL(10,2) DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas RLS para products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view products of their store" ON products FOR SELECT USING (store_id = (SELECT store_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Admins can manage products of their store" ON products FOR ALL USING (store_id = (SELECT store_id FROM users WHERE id = auth.uid()));


-- 4. Tabela de Clientes (Customers)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(store_id, phone)
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- Todos podem inserir (checkout público) mas só admin pode ver
CREATE POLICY "Admins veem clientes" ON customers FOR SELECT USING (store_id = (auth.jwt() ->> 'store_id')::uuid);
CREATE POLICY "Todos podem criar/atualizar cliente" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Todos podem atualizar cliente por conflito" ON customers FOR UPDATE USING (true);

-- 5. Tabela de Pedidos (Orders)
-- Primeiro criamos a sequence para o número legível (terá que ser gerada por store depois, 
-- mas para o MVP usaremos um BIGINT global ou string com prefixo)
CREATE SEQUENCE order_number_seq;

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    order_number TEXT DEFAULT '#' || lpad(nextval('order_number_seq')::text, 4, '0'),
    customer_id UUID REFERENCES customers(id),
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    status TEXT DEFAULT 'pending', -- pending, preparing, ready, delivering, completed, cancelled
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    delivery_type TEXT, -- delivery, pickup
    address_text TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- Admin ve tudo
CREATE POLICY "Admins veem pedidos" ON orders FOR SELECT USING (store_id = (auth.jwt() ->> 'store_id')::uuid);
CREATE POLICY "Admins atualizam pedidos" ON orders FOR UPDATE USING (store_id = (auth.jwt() ->> 'store_id')::uuid);
-- Público pode inserir
CREATE POLICY "Público pode inserir pedidos" ON orders FOR INSERT WITH CHECK (true);

-- Função de Trigger para Baixa de Estoque
CREATE OR REPLACE FUNCTION decrement_stock()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    -- Diminui estoque com base nos itens do pedido
    IF NEW.items IS NOT NULL THEN
        FOR item IN SELECT * FROM jsonb_array_elements(NEW.items) LOOP
            -- Se o item tiver um product_id (vinculado ao menu_items)
            IF (item->>'id') IS NOT NULL THEN
                UPDATE menu_items 
                SET stock_quantity = stock_quantity - COALESCE((item->>'quantity')::int, 1)
                WHERE id = (item->>'id')::uuid AND stock_quantity IS NOT NULL;
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_decrement_stock
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION decrement_stock();

-- Bucket de Imagens
insert into storage.buckets (id, name, public) values ('menu-images', 'menu-images', true);
create policy "Imagens públicas" on storage.objects for select using (bucket_id = 'menu-images');
create policy "Admins fazem upload" on storage.objects for insert with check (bucket_id = 'menu-images' AND auth.role() = 'authenticated');
