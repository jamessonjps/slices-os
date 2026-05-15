-- SCRIPT PARA CRIAR USUÁRIO MESTRE NO SUPABASE
-- Copie e cole este código no SQL Editor do seu painel Supabase.

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
  target_store_id UUID := 'd5003041-d34c-484e-a78e-6a523a0f681d'; -- ID da sua loja
  user_email TEXT := 'jamesson.jps@gmail.com';
  user_password TEXT := '81102240';
BEGIN
  -- 1. Criar o usuário na tabela de autenticação do Supabase (auth.users)
  -- Nota: O Supabase usa pgcrypto para o hash da senha
  INSERT INTO auth.users (
    id, 
    instance_id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    raw_app_meta_data, 
    raw_user_meta_data, 
    created_at, 
    updated_at, 
    role, 
    confirmation_token, 
    email_change, 
    email_change_token_new, 
    recovery_token
  )
  VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    extensions.crypt(user_password, extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'store_id', target_store_id),
    jsonb_build_object('name', 'Jamesson JPS', 'store_id', target_store_id),
    now(),
    now(),
    'authenticated',
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING;

  -- Se o usuário já existia, pegamos o ID dele
  SELECT id INTO new_user_id FROM auth.users WHERE email = user_email;

  -- 2. Criar a identidade para o usuário (necessário para o login funcionar)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    new_user_id,
    jsonb_build_object('sub', new_user_id, 'email', user_email),
    'email',
    now(),
    now(),
    now()
  )
  ON CONFLICT DO NOTHING;

  -- 3. Criar o perfil na tabela pública (public.users)
  -- Certifique-se de que a tabela public.users já existe (rodou o supabase_schema.sql atualizado)
  INSERT INTO public.users (id, store_id, full_name, email, role)
  VALUES (new_user_id, target_store_id, 'Jamesson JPS', user_email, 'admin')
  ON CONFLICT (id) DO UPDATE 
  SET role = 'admin', full_name = 'Jamesson JPS';

  RAISE NOTICE 'Usuário mestre criado com sucesso para %', user_email;
END $$;
