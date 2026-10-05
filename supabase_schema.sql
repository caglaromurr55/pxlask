-- ============================================================
-- PIXEL AŞK - SUPABASE SQL VERİTABANI ŞABLONU & KURULUMU
-- Bu scripti Supabase Dashboard > SQL Editor alanına yapıştırıp
-- "RUN" butonuna basarak tüm veritabanını tek seferde oluşturabilirsiniz.
-- ============================================================

-- 0. Gerekli Uzantılar
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABLOLARIN OLUŞTURULMASI
-- ============================================================

-- 1.1 KULLANICILAR TABLOSU (users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- 6 haneli PIN kodu
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    points INTEGER NOT NULL DEFAULT 150,
    boyfriend_hp INTEGER NOT NULL DEFAULT 1000000,
    max_hp INTEGER NOT NULL DEFAULT 1000000,
    total_hits INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.2 MALZEMELER / SİLAHLAR TABLOSU (materials)
CREATE TABLE IF NOT EXISTS public.materials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    damage_value INTEGER NOT NULL DEFAULT 1,
    unlock_cost INTEGER NOT NULL DEFAULT 0,
    sound TEXT NOT NULL DEFAULT 'slap',
    type TEXT NOT NULL DEFAULT 'hand',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.3 KULLANICININ AÇTIĞI MALZEMELER (user_unlocked_materials)
CREATE TABLE IF NOT EXISTS public.user_unlocked_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    material_id TEXT NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, material_id)
);

-- 1.4 GÖREV HAVUZU TABLOSU (tasks)
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 10,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    target_count INTEGER DEFAULT NULL, -- Haftalık ve aylık görevler için hedef sayı
    unit TEXT DEFAULT NULL,            -- Örn: 'öpücük', 'sarılma', 'video'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.4.1 STANDART / SÜRESİZ GÖREVLER (standard_tasks - Örn: Her öpücük 1 puan)
CREATE TABLE IF NOT EXISTS public.standard_tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '💋',
    points_per_unit INTEGER NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'adet',
    description TEXT DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.5 KULLANICIYA ATANMIŞ AKTİF GÖREVLER (assigned_tasks)
CREATE TABLE IF NOT EXISTS public.assigned_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    task_id TEXT REFERENCES public.tasks(id) ON DELETE SET NULL,
    current_count INTEGER NOT NULL DEFAULT 0,
    target_count INTEGER DEFAULT NULL,
    unit TEXT DEFAULT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, frequency)
);

-- 1.6 TAMAMLANAN GÖREVLER GEÇMİŞİ (completed_tasks)
CREATE TABLE IF NOT EXISTS public.completed_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    task_id TEXT,
    task_title TEXT NOT NULL,
    frequency TEXT NOT NULL,
    points_earned INTEGER NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.7 ÖDÜLLER MAĞAZASI (rewards)
CREATE TABLE IF NOT EXISTS public.rewards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    cost INTEGER NOT NULL DEFAULT 30,
    emoji TEXT NOT NULL DEFAULT '🎁',
    type TEXT NOT NULL DEFAULT 'custom' CHECK (type IN ('custom', 'poem')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.8 KULLANICININ ALDIĞI ÖDÜLLER (user_acquired_rewards)
CREATE TABLE IF NOT EXISTS public.user_acquired_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reward_id TEXT REFERENCES public.rewards(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    emoji TEXT NOT NULL DEFAULT '🎁',
    cost INTEGER NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.9 ŞİİR HAVUZU TABLOSU (poems)
CREATE TABLE IF NOT EXISTS public.poems (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.10 KULLANICININ AÇTIĞI ŞİİRLER (user_acquired_poems)
CREATE TABLE IF NOT EXISTS public.user_acquired_poems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    poem_id TEXT NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, poem_id)
);


-- ============================================================
-- 2. YETKİLENDİRME (GRANT) & ROW LEVEL SECURITY (RLS)
-- Web uygulamasının (anon anahtarı ile) tablolara erişebilmesi için gerekli izinler
-- ============================================================

-- Schema ve Tablo Erişim İzinleri (42501 permission denied hatasını çözer):
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_unlocked_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assigned_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_acquired_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_acquired_poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standard_tasks ENABLE ROW LEVEL SECURITY;

-- Tüm tablolara okuma ve yazma izni veren RLS politikaları:
DO $$
BEGIN
    DROP POLICY IF EXISTS "Anon Full Access users" ON public.users;
    DROP POLICY IF EXISTS "Anon Full Access materials" ON public.materials;
    DROP POLICY IF EXISTS "Anon Full Access user_unlocked_materials" ON public.user_unlocked_materials;
    DROP POLICY IF EXISTS "Anon Full Access tasks" ON public.tasks;
    DROP POLICY IF EXISTS "Anon Full Access standard_tasks" ON public.standard_tasks;
    DROP POLICY IF EXISTS "Anon Full Access assigned_tasks" ON public.assigned_tasks;
    DROP POLICY IF EXISTS "Anon Full Access completed_tasks" ON public.completed_tasks;
    DROP POLICY IF EXISTS "Anon Full Access rewards" ON public.rewards;
    DROP POLICY IF EXISTS "Anon Full Access user_acquired_rewards" ON public.user_acquired_rewards;
    DROP POLICY IF EXISTS "Anon Full Access poems" ON public.poems;
    DROP POLICY IF EXISTS "Anon Full Access user_acquired_poems" ON public.user_acquired_poems;

    CREATE POLICY "Anon Full Access users" ON public.users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Anon Full Access materials" ON public.materials FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Anon Full Access user_unlocked_materials" ON public.user_unlocked_materials FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Anon Full Access tasks" ON public.tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Anon Full Access standard_tasks" ON public.standard_tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Anon Full Access assigned_tasks" ON public.assigned_tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Anon Full Access completed_tasks" ON public.completed_tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Anon Full Access rewards" ON public.rewards FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Anon Full Access user_acquired_rewards" ON public.user_acquired_rewards FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Anon Full Access poems" ON public.poems FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Anon Full Access user_acquired_poems" ON public.user_acquired_poems FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;


-- ============================================================
-- 3. BAŞLANGIÇ VERİLERİ (SEED DATA)
-- ============================================================

-- 3.1 Varsayılan Kullanıcılar (askim ve admin)
INSERT INTO public.users (id, username, password, role, points, boyfriend_hp, max_hp)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'askim', '123456', 'user', 150, 1000000, 1000000),
    ('22222222-2222-2222-2222-222222222222', 'admin', '654321', 'admin', 9999, 1000000, 1000000)
ON CONFLICT (username) DO NOTHING;

-- 3.2 Varsayılan Silahlar / Malzemeler (Hasarları ve Açma Maliyetleriyle)
INSERT INTO public.materials (id, name, emoji, damage_value, unlock_cost, sound, type, sort_order)
VALUES
    ('mat0', 'Tokat (El)', '👋', 1, 0, 'slap', 'hand', 0),
    ('mat1', 'Domates', '🍅', 5, 10, 'tomato', 'tomato', 1),
    ('mat2', 'Terlik', '🩴', 15, 25, 'slipper', 'slipper', 2),
    ('mat3', 'Oklava', '🪵', 35, 40, 'bonk', 'stick', 3),
    ('mat4', 'Tava', '🍳', 75, 60, 'bonk', 'pan', 4),
    ('mat5', 'Sopa', '🏏', 150, 85, 'bonk', 'bat', 5),
    ('mat6', 'Su Tabancası', '🔫', 300, 120, 'gun', 'gun', 6)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    emoji = EXCLUDED.emoji,
    damage_value = EXCLUDED.damage_value,
    unlock_cost = EXCLUDED.unlock_cost,
    sound = EXCLUDED.sound,
    type = EXCLUDED.type;

-- 3.3 Sevgilinin İlk Açık Malzemesi (Tokat / El)
INSERT INTO public.user_unlocked_materials (user_id, material_id)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'mat0'),
    ('22222222-2222-2222-2222-222222222222', 'mat0'),
    ('22222222-2222-2222-2222-222222222222', 'mat1'),
    ('22222222-2222-2222-2222-222222222222', 'mat2'),
    ('22222222-2222-2222-2222-222222222222', 'mat3'),
    ('22222222-2222-2222-2222-222222222222', 'mat4'),
    ('22222222-2222-2222-2222-222222222222', 'mat5'),
    ('22222222-2222-2222-2222-222222222222', 'mat6')
ON CONFLICT (user_id, material_id) DO NOTHING;

-- 3.4 Görev Havuzu
-- Günlük Görevler (Tek adımlı)
INSERT INTO public.tasks (id, title, points, frequency, target_count, unit)
VALUES
    ('d1', 'Bana günaydın mesajı at ☀️', 10, 'daily', NULL, NULL),
    ('d2', 'Bugün 3 bardak su iç 💧', 5, 'daily', NULL, NULL),
    ('d3', 'Bana tatlı bir selfie gönder 📸', 15, 'daily', NULL, NULL),
    ('d4', 'Bana "seni seviyorum" de 💕', 10, 'daily', NULL, NULL),
    ('d5', 'Günün şarkısını benimle paylaş 🎶', 8, 'daily', NULL, NULL),
    ('d6', 'Bugünkü ruh halini emoji ile anlat 🥰', 5, 'daily', NULL, NULL),

-- Haftalık Görevler (İlerleme Barlı)
    ('w1', 'Bana 50 kez sarıl 🤗', 40, 'weekly', 50, 'sarılma'),
    ('w2', 'Bu hafta 5 komik video/reels gönder 🎬', 30, 'weekly', 5, 'video'),
    ('w3', 'Bana 100 güzel iltifat et ✨', 50, 'weekly', 100, 'iltifat'),
    ('w4', 'Bana el yazısıyla 1 mektup yaz 💌', 45, 'weekly', 1, 'mektup'),
    ('w5', 'Bu hafta 7 kez kahve/çay ısmarla ☕', 35, 'weekly', 7, 'kez'),

-- Aylık Görevler (İlerleme Barlı)
    ('m1', 'Sevgilini 1000 kez öp! 💋', 200, 'monthly', 1000, 'öpücük'),
    ('m2', 'Bu ay 30 gün boyunca günaydın de 🌅', 150, 'monthly', 30, 'gün'),
    ('m3', 'Birlikte 10 yeni yemek/tatlı dene 🍰', 120, 'monthly', 10, 'lezzet'),
    ('m4', '100 romantik fotoğraf çekilip biriktir 📷', 180, 'monthly', 100, 'fotoğraf'),
    ('m5', 'Bana 20 kez masaj yap 💆‍♀️', 160, 'monthly', 20, 'masaj')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    points = EXCLUDED.points,
    frequency = EXCLUDED.frequency,
    target_count = EXCLUDED.target_count,
    unit = EXCLUDED.unit;

-- 3.5 Ödüller Mağazası
INSERT INTO public.rewards (id, title, description, cost, emoji, type, sort_order)
VALUES
    ('r1', '30dk Masaj', 'Senden 30 dakika kesintisiz masaj hakkı!', 50, '💆', 'custom', 1),
    ('r2', 'Film Gecesi Seçimi', 'Bu akşam ne izleyeceğimizi sen seçersin!', 30, '🎬', 'custom', 2),
    ('r3', 'Restoran Daveti', 'Canının çektiği restorana götüreyim!', 100, '🍽️', 'custom', 3),
    ('r4', 'Sürpriz Tatlı / Hediye', 'Sana canının istediği bir sürpriz hediye!', 150, '🎁', 'custom', 4),
    ('r5', 'Özel Şiir Aç', 'Sana özel kalbimden yazdığım bir şiiri aç!', 25, '📜', 'poem', 5)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    cost = EXCLUDED.cost,
    emoji = EXCLUDED.emoji,
    type = EXCLUDED.type;

-- 3.6 Şiir Havuzu
INSERT INTO public.poems (id, title, content)
VALUES
    ('p1', 'Gözlerinde Kayboldum', 'Gözlerinde kayboldum bir gece,
Yıldızlar kıskanırdı seni belki de.
Bir bakışın yeter beni yaşatmaya,
Sen varsın ya, yeter bu dünyaya.'),
    ('p2', 'Sen Benim', 'Sen benim sabahımsın, güneşimsin,
Karanlıkta yanan tek ateşimsin.
Sensiz geçen her an eksik kalır,
Sen benim her şeyimsin, her şeyimsin.'),
    ('p3', 'Aşk Böyle Bir Şey', 'Aşk böyle bir şey işte,
Bazen fırtına, bazen serinlik.
Senin yanında her şey güzel,
Bir ömür yetmez bu güzellik.'),
    ('p4', 'Seni Düşünürken', 'Seni düşünürken durur zaman,
Kalbimdeki tek ses senin adın.
Her nefeste seni ararım,
Sen olmasan ben neyim ki yarım.'),
    ('p5', 'Sonsuza Dek', 'Elini tuttuğumda biliyorum,
Bu yol sonsuza dek sürecek.
Ne fırtına koparır bizi,
Ne zaman ayırabilecek.')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content;

-- 3.7 Sevgili İçin İlk Görevleri Ata
INSERT INTO public.assigned_tasks (user_id, frequency, task_id, current_count, target_count, unit)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'daily', 'd1', 0, NULL, NULL),
    ('11111111-1111-1111-1111-111111111111', 'weekly', 'w1', 0, 50, 'sarılma'),
    ('11111111-1111-1111-1111-111111111111', 'monthly', 'm1', 0, 1000, 'öpücük')
ON CONFLICT (user_id, frequency) DO NOTHING;

-- 3.8 Standart / Süresiz Görevler
INSERT INTO public.standard_tasks (id, title, emoji, points_per_unit, unit, description, sort_order)
VALUES
    ('std_kiss', 'Öpücük', '💋', 1, 'öpücük', 'Her öptüğünde adet sayısını girip anında puan kazan!', 1),
    ('std_hug', 'Sımsıkı Sarılma', '🫂', 2, 'sarılma', 'Her sımsıkı ve içten sarılma için anında puan kazan.', 2),
    ('std_love', 'Seni Seviyorum Demek', '💬', 1, 'kez', 'Gözlerinin içine bakarak her seni seviyorum deyişin.', 3),
    ('std_coffee', 'Kahve / Çay Yapmak', '☕', 10, 'bardak', 'Sevgiline hazırladığın her sevgi dolu fincan.', 4),
    ('std_massage', 'Masaj Yapmak', '💆‍♀️', 15, 'seans', 'Yorgunluğunu alan her rahatlatıcı masaj seansı.', 5),
    ('std_dessert', 'Tatlı / Yemek Yapmak', '🍰', 25, 'porsiyon', 'Kendi ellerinle yaptığın her lezzetli sürpriz.', 6)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    emoji = EXCLUDED.emoji,
    points_per_unit = EXCLUDED.points_per_unit,
    unit = EXCLUDED.unit,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

