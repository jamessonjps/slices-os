-- =========================================================================
-- SQL SCRIPT: MÓDULO DO ENTREGADOR (DELIVERY DASHBOARD)
-- Execute este script no SQL Editor do seu projeto Supabase.
-- =========================================================================

-- 1. Adicionar o driver_id na tabela orders (referenciando a tabela public.users)
-- (Isso vincula o entregador ao pedido)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- 2. Adicionar o delivery_fee na tabela orders (caso ainda não exista)
-- (Armazena o valor da taxa de entrega que o cliente pagou)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10, 2) DEFAULT 0.00;

-- 3. Inserir os valores de status da entrega (SE a sua coluna "status" for um ENUM chamado "order_status")
-- IMPORTANTE: Se a sua coluna de status já aceita qualquer texto (tipo varchar/text), você pode IGNORAR as duas linhas abaixo.
-- Mas se for um ENUM com valores fixos, descomente e rode:
-- ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'out_for_delivery';
-- ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'delivered';
