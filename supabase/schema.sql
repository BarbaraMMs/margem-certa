-- ============================================================
-- MargemCerta — Schema para coleta de dados da demo
-- Execute este SQL no SQL Editor do Supabase
-- ============================================================

-- Tabela de visitantes da demo
create table if not exists visitors (
  id          text primary key,           -- UUID gerado no browser
  name        text not null,
  email       text default '',
  visited_at  timestamptz default now(),
  user_agent  text default ''
);

-- Tabela de eventos de produto calculado
create table if not exists product_events (
  id          uuid primary key default gen_random_uuid(),
  visitor_id  text references visitors(id) on delete cascade,
  snapshot    jsonb default '{}',         -- nome, marketplace, precoIdeal
  created_at  timestamptz default now()
);

-- Tabela de feedbacks / pesquisa exploratória
create table if not exists feedback (
  id          uuid primary key default gen_random_uuid(),
  visitor_id  text references visitors(id) on delete cascade,
  q1          text default '',   -- Como descobre lucro/prejuízo
  q2          text default '',   -- Perdeu dinheiro?
  q3          text default '',   -- Última vez que calculou preço
  helped      text default '',   -- 'sim' | 'parcialmente' | 'não'
  rating      int  default 0,    -- 1-5
  comment     text default '',
  created_at  timestamptz default now()
);

-- ── Row Level Security (permite leitura/escrita anônima para a demo) ──────────
alter table visitors       enable row level security;
alter table product_events enable row level security;
alter table feedback        enable row level security;

-- Permite INSERT anônimo (qualquer visitante pode se registrar)
create policy "visitors: insert anon"
  on visitors for insert to anon with check (true);

create policy "product_events: insert anon"
  on product_events for insert to anon with check (true);

create policy "feedback: insert anon"
  on feedback for insert to anon with check (true);

-- Permite SELECT apenas para a chave de serviço (admin)
-- Na prática o /admin usa a anon key mas chama a REST API autenticada
-- Para maior segurança, troque por service_role key no Admin.jsx
create policy "visitors: select anon"
  on visitors for select to anon using (true);

create policy "product_events: select anon"
  on product_events for select to anon using (true);

create policy "feedback: select anon"
  on feedback for select to anon using (true);
