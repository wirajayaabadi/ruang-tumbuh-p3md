-- Tabel aspirasi pengunjung Peta 5 Ruang Tumbuh.
-- Jalankan sekali di Supabase → SQL Editor → New query → Run.

create table if not exists public.aspirasi (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  ruang        text not null check (ruang in ('aman', 'bersama', 'belajar', 'inovasi', 'masa', 'belum')),
  text         text not null check (char_length(text) between 10 and 600),
  name         text check (name is null or char_length(name) <= 80),
  contact      text check (contact is null or char_length(contact) <= 80),
  anonymous    boolean not null default false,
  -- hash HMAC (bukan nilai mentah) untuk membatasi spam tanpa menyimpan IP/ID perangkat
  device_hash  text not null,
  ip_hash      text,
  user_agent   text,
  -- dipakai tim untuk menandai tindak lanjut
  status       text not null default 'baru' check (status in ('baru', 'dibaca', 'ditindaklanjuti', 'spam'))
);

create index if not exists aspirasi_created_idx on public.aspirasi (created_at desc);
create index if not exists aspirasi_device_idx  on public.aspirasi (device_hash, created_at desc);
create index if not exists aspirasi_ip_idx      on public.aspirasi (ip_hash, created_at desc);

-- RLS aktif tanpa policy: publik (anon) tidak bisa membaca maupun menulis.
-- Hanya server (Vercel Function dengan secret key) yang bisa menyimpan; tim membaca lewat dashboard.
alter table public.aspirasi enable row level security;

-- Ringkasan jumlah aspirasi per ruang untuk tim (dibaca di dashboard).
create or replace view public.aspirasi_per_ruang
with (security_invoker = true) as
select ruang, count(*) as jumlah, max(created_at) as terakhir
from public.aspirasi
where status <> 'spam'
group by ruang
order by jumlah desc;
