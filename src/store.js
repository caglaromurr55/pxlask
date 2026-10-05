/* ============================================
   STORE - Basit reaktif state yönetimi
   Supabase bağlanana kadar localStorage kullanır
   ============================================ */

import { reactive } from 'vue';
import { supabase } from './supabaseClient.js';

// Tarih ve Döngü Yardımcıları
export function getTodayDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentWeekStr() {
  const d = new Date();
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const dayDiff = (d - jan4) / 86400000;
  const weekNum = Math.ceil((dayDiff + jan4.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${weekNum}`;
}

export function getCurrentMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Varsayılan veriler
const defaultData = {
  currentUser: null,
  points: 150,

  // Erkek Arkadaş Can Sistemi (1.000.000 Can)
  maxHp: 1000000,
  boyfriendHp: 1000000,

  // Kullanıcılar
  users: [
    { id: '1', username: 'askim', password: '123456', role: 'user', points: 150 },
    { id: '2', username: 'admin', password: '654321', role: 'admin', points: 9999 },
  ],

  // Günlük görev havuzu (Tek adımlı)
  dailyTasks: [
    { id: 'd1', title: 'Bana günaydın mesajı at ☀️', points: 10, frequency: 'daily' },
    { id: 'd2', title: 'Bugün 3 bardak su iç 💧', points: 5, frequency: 'daily' },
    { id: 'd3', title: 'Bana tatlı bir selfie gönder 📸', points: 15, frequency: 'daily' },
    { id: 'd4', title: 'Bana "seni seviyorum" de 💕', points: 10, frequency: 'daily' },
    { id: 'd5', title: 'Günün şarkısını benimle paylaş 🎶', points: 8, frequency: 'daily' },
    { id: 'd6', title: 'Bugünkü ruh halini emoji ile anlat 🥰', points: 5, frequency: 'daily' },
  ],

  // Haftalık görev havuzu (Sayaçlı ve İlerleme Barlı)
  weeklyTasks: [
    { id: 'w1', title: 'Bana 50 kez sarıl 🤗', targetCount: 50, currentCount: 0, unit: 'sarılma', points: 40, frequency: 'weekly' },
    { id: 'w2', title: 'Bu hafta 5 komik video/reels gönder 🎬', targetCount: 5, currentCount: 0, unit: 'video', points: 30, frequency: 'weekly' },
    { id: 'w3', title: 'Bana 100 güzel iltifat et ✨', targetCount: 100, currentCount: 0, unit: 'iltifat', points: 50, frequency: 'weekly' },
    { id: 'w4', title: 'Bana el yazısıyla 1 mektup yaz 💌', targetCount: 1, currentCount: 0, unit: 'mektup', points: 45, frequency: 'weekly' },
    { id: 'w5', title: 'Bu hafta 7 kez kahve/çay ısmarla ☕', targetCount: 7, currentCount: 0, unit: 'kez', points: 35, frequency: 'weekly' },
  ],

  // Aylık görev havuzu (Sayaçlı ve İlerleme Barlı)
  monthlyTasks: [
    { id: 'm1', title: 'Sevgilini 1000 kez öp! 💋', targetCount: 1000, currentCount: 0, unit: 'öpücük', points: 200, frequency: 'monthly' },
    { id: 'm2', title: 'Bu ay 30 gün boyunca günaydın de 🌅', targetCount: 30, currentCount: 0, unit: 'gün', points: 150, frequency: 'monthly' },
    { id: 'm3', title: 'Birlikte 10 yeni yemek/tatlı dene 🍰', targetCount: 10, currentCount: 0, unit: 'lezzet', points: 120, frequency: 'monthly' },
    { id: 'm4', title: '100 romantik fotoğraf çekilip biriktir 📷', targetCount: 100, currentCount: 0, unit: 'fotoğraf', points: 180, frequency: 'monthly' },
    { id: 'm5', title: 'Bana 20 kez masaj yap 💆‍♀️', targetCount: 20, currentCount: 0, unit: 'masaj', points: 160, frequency: 'monthly' },
  ],

  // Standart / Süresiz Görevler (Sabit aşk eylemleri - Anında sayı girip puan alma)
  standardTasks: [
    {
      id: 'std_kiss',
      title: 'Öpücük',
      emoji: '💋',
      pointsPerUnit: 1,
      unit: 'öpücük',
      description: 'Her öptüğünde adet sayısını girip anında puan kazan!',
      totalCompleted: 0,
      sortOrder: 1
    },
    {
      id: 'std_hug',
      title: 'Sımsıkı Sarılma',
      emoji: '🫂',
      pointsPerUnit: 2,
      unit: 'sarılma',
      description: 'Her sımsıkı ve içten sarılma için anında puan kazan.',
      totalCompleted: 0,
      sortOrder: 2
    },
    {
      id: 'std_love',
      title: 'Seni Seviyorum Demek',
      emoji: '💬',
      pointsPerUnit: 1,
      unit: 'kez',
      description: 'Gözlerinin içine bakarak söylediğin her sevgi sözcüğü.',
      totalCompleted: 0,
      sortOrder: 3
    },
    {
      id: 'std_coffee',
      title: 'Kahve / Çay Hazırlamak',
      emoji: '☕',
      pointsPerUnit: 10,
      unit: 'bardak',
      description: 'Sevgiline hazırladığın her sıcacık içecek.',
      totalCompleted: 0,
      sortOrder: 4
    },
    {
      id: 'std_massage',
      title: 'Masaj Yapmak',
      emoji: '💆‍♀️',
      pointsPerUnit: 15,
      unit: 'seans',
      description: 'Yorgunluğunu alan her rahatlatıcı masaj seansı.',
      totalCompleted: 0,
      sortOrder: 5
    },
    {
      id: 'std_dessert',
      title: 'Tatlı / Yemek Yapmak',
      emoji: '🍰',
      pointsPerUnit: 25,
      unit: 'porsiyon',
      description: 'Kendi ellerinle yaptığın her lezzetli sürpriz.',
      totalCompleted: 0,
      sortOrder: 6
    },
  ],

  // Atanmış görevler (aktif)
  assignedTasks: {
    daily: null,
    weekly: null,
    monthly: null,
  },

  // Tamamlanmış görevler
  completedTasks: [],

  // Malzemeler ve Hasar Değerleri
  materials: [
    { id: 'mat0', name: 'Tokat (El)', emoji: '👋', unlockCost: 0, damageValue: 1, damage: '1 Hasar', type: 'hand', sound: 'slap' },
    { id: 'mat1', name: 'Domates', emoji: '🍅', unlockCost: 10, damageValue: 5, damage: '5 Hasar', type: 'tomato', sound: 'tomato' },
    { id: 'mat2', name: 'Terlik', emoji: '🩴', unlockCost: 25, damageValue: 15, damage: '15 Hasar', type: 'slipper', sound: 'slipper' },
    { id: 'mat3', name: 'Oklava', emoji: '🪵', unlockCost: 40, damageValue: 35, damage: '35 Hasar', type: 'stick', sound: 'bonk' },
    { id: 'mat4', name: 'Tava', emoji: '🍳', unlockCost: 60, damageValue: 75, damage: '75 Hasar', type: 'pan', sound: 'bonk' },
    { id: 'mat5', name: 'Sopa', emoji: '🏏', unlockCost: 85, damageValue: 150, damage: '150 Hasar', type: 'bat', sound: 'bonk' },
    { id: 'mat6', name: 'Su Tabancası', emoji: '🔫', unlockCost: 120, damageValue: 300, damage: '300 Hasar', type: 'gun', sound: 'gun' },
  ],

  // Açılmış malzemeler (İlk ürün El daima açık!)
  unlockedMaterials: ['mat0'],

  // Ödüller
  rewards: [
    { id: 'r1', title: '30dk Masaj', description: 'Senden 30 dakika kesintisiz masaj hakkı!', cost: 50, type: 'custom', emoji: '💆' },
    { id: 'r2', title: 'Film Gecesi Seçimi', description: 'Bu akşam ne izleyeceğimizi sen seçersin!', cost: 30, type: 'custom', emoji: '🎬' },
    { id: 'r3', title: 'Restoran Daveti', description: 'Canının çektiği restorana götüreyim!', cost: 100, type: 'custom', emoji: '🍽️' },
    { id: 'r4', title: 'Sürpriz Tatlı / Hediye', description: 'Sana canının istediği bir sürpriz hediye!', cost: 150, type: 'custom', emoji: '🎁' },
    { id: 'r5', title: 'Özel Şiir Aç', description: 'Sana özel kalbimden yazdığım bir şiiri aç!', cost: 25, type: 'poem', emoji: '📜' },
  ],

  // Şiir havuzu
  poems: [
    {
      id: 'p1',
      title: 'Gözlerinde Kayboldum',
      content: 'Gözlerinde kayboldum bir gece,\nYıldızlar kıskanırdı seni belki de.\nBir bakışın yeter beni yaşatmaya,\nSen varsın ya, yeter bu dünyaya.'
    },
    {
      id: 'p2',
      title: 'Sen Benim',
      content: 'Sen benim sabahımsın, güneşimsin,\nKaranlıkta yanan tek ateşimsin.\nSensiz geçen her an eksik kalır,\nSen benim her şeyimsin, her şeyimsin.'
    },
    {
      id: 'p3',
      title: 'Aşk Böyle Bir Şey',
      content: 'Aşk böyle bir şey işte,\nBazen fırtına, bazen serinlik.\nSenin yanında her şey güzel,\nBir ömür yetmez bu güzellik.'
    },
    {
      id: 'p4',
      title: 'Seni Düşünürken',
      content: 'Seni düşünürken durur zaman,\nKalbimdeki tek ses senin adın.\nHer nefeste seni ararım,\nSen olmasan ben neyim ki yarım.'
    },
    {
      id: 'p5',
      title: 'Sonsuza Dek',
      content: 'Elini tuttuğumda biliyorum,\nBu yol sonsuza dek sürecek.\nNe fırtına koparır bizi,\nNe zaman ayırabilecek.'
    },
  ],

  // Kullanıcının aldığı ödüller
  acquiredRewards: [],

  // Kullanıcının açtığı şiirler
  acquiredPoems: [],

  // Puan kazanma yolları
  pointActions: [
    { id: 'pa1', title: 'Günlük görevi tamamla', points: '5-15', emoji: '📋' },
    { id: 'pa2', title: 'Haftalık görevi tamamla', points: '30-50', emoji: '📅' },
    { id: 'pa3', title: 'Aylık görevi tamamla', points: '120-200', emoji: '🗓️' },
    { id: 'pa4', title: 'Ringde Sevgiliyi Nakavt Et (1M Can)', points: '1000', emoji: '👑' },
  ],

  // Görev Zamanlama, Ceza Geçmişi ve Günlük Tamamlama Durumu
  dailyTaskClaimedDate: null,
  penaltiesLog: [],
  recentPenaltyAlert: null,

  // Zorunlu Günlük Cinsel Görevler
  intimateTasks: [
    { id: 'it1', title: 'Bu gece en az 10 dakika göz temasıyla ve kesintisiz ön sevişme yapın 💋', points: 30, penaltyPoints: 30, penaltyDesc: 'Yarın partnerine 15 dk sırt masajı borçlusun!' },
    { id: 'it2', title: 'Partnerinize sadece mum ışığında 15 dakika masaj yapın 🕯️', points: 40, penaltyPoints: 40, penaltyDesc: 'Bu hafta sonu kahvaltıyı hazırlama cezası!' },
    { id: 'it3', title: 'Daha önce denemediğiniz veya uzun süredir yapmadığınız bir pozisyon deneyin 🔥', points: 50, penaltyPoints: 50, penaltyDesc: 'Partnerinin seçeceği bir kıyafeti giyme cezası!' },
    { id: 'it4', title: 'Birbirinize en çok tahrik olduğunuz 3 anı fısıldayarak anlatın 💬', points: 35, penaltyPoints: 35, penaltyDesc: 'Yarın tüm bulaşıklar sende!' },
    { id: 'it5', title: 'Partnerinizin gözlerini bağlayarak 5 dakika boyunca kontrolü ona bırakın 🙈', points: 45, penaltyPoints: 45, penaltyDesc: 'Partnerine istediği bir tatlıyı ısmarlama cezası!' },
    { id: 'it6', title: 'Sıcak ve soğuk (buz küpü veya sıcak nefes) ten teması oyunu oynayın ❄️🔥', points: 40, penaltyPoints: 40, penaltyDesc: 'Bir sonraki film seçimini partnerine bırakma cezası!' },
    { id: 'it7', title: 'Birbirinize en gizli fantezinizle ilgili 1 soru sorun ve dürüstçe yanıtlayın 🤫', points: 30, penaltyPoints: 30, penaltyDesc: 'Partnerine 20 kez sarılma ve öpücük borcu!' },
  ],
  activeIntimateTask: null,

  // Günün Fantezisi & Ortak Fanteziler Havuzu
  fantasyPool: [
    { id: 'f1', title: 'Göz Bağlama & Duyuları Yoğunlaştırma 🙈', description: 'Gözler bağlıyken sadece dokunuş, fısıltı ve kokulara odaklanmak.', emoji: '🙈', category: 'duyusal' },
    { id: 'f2', title: 'Buz Küpü & Sıcak Nefes Oyunu ❄️🔥', description: 'Vücudun hassas noktalarında buz gezdirip hemen ardından sıcak nefes vermek.', emoji: '❄️', category: 'sıcak-soğuk' },
    { id: 'f3', title: 'Rol Yapma (Roleplay) & Yeni Karakterler 🎭', description: 'Birbirinizi yeni tanışmış iki yabancı gibi baştan çıkarma oyunu.', emoji: '🎭', category: 'rol' },
    { id: 'f4', title: 'Yavaş Masaj & Aromatik Yağlar 🕯️', description: 'Tüm vücudu rahatlatan loş ışıkta sıcak yağ masajı.', emoji: '🕯️', category: 'romantik' },
    { id: 'f5', title: 'Ayna Karşısında Yakınlaşma 🪞', description: 'Birlikte aynanın karşısına geçip birbirinizi izleyerek sevişmek.', emoji: '🪞', category: 'görsel' },
    { id: 'f6', title: 'Dokunma Yasağı & Sadece İzleme ⏱️', description: '10 dakika boyunca kıpırdamadan sadece partnerinin yaptıklarını izlemek.', emoji: '⏱️', category: 'sabır' },
    { id: 'f7', title: 'Gündüz veya Beklenmedik Hızlı Yakınlaşma (Quickie) ⚡', description: 'Evden çıkmadan veya beklemediğiniz bir anda aniden başlamak.', emoji: '⚡', category: 'spontan' },
    { id: 'f8', title: 'Fısıltıyla Kirli Konuşma (Dirty Talk) 💬', description: 'Kulaktan kulağa en cesur istekleri fısıldamak.', emoji: '💬', category: 'ses' },
    { id: 'f9', title: 'Özel Kostüm & Çekici İç Giyim 👙', description: 'Partnerinin en çok sevdiği kıyafetle karşısına çıkmak.', emoji: '👙', category: 'görsel' },
    { id: 'f10', title: 'Yatak Dışı Mekan (Mutfak Tezgahı / Koltuk) 🛋️', description: 'Yataktan çıkıp evin farklı bir köşesinde yakınlaşmak.', emoji: '🛋️', category: 'mekan' },
    { id: 'f11', title: 'Duşta / Banyoda Sıcak Su Teması 🚿', description: 'Köpükler ve sıcak suyun altında öpüşmek ve dokunmak.', emoji: '🚿', category: 'ıslak' },
    { id: 'f12', title: 'Meyve & Çikolatalı Tat Alma Oyunu 🍓', description: 'Gözler bağlıyken vücuttan çilek veya çikolata yemek.', emoji: '🍓', category: 'tat' },
    { id: 'f13', title: 'Yönetim / Hakimiyet Bende Gecesi 👑', description: 'Tüm gece boyunca kontrolün tek bir kişide olması, diğerinin tamamen teslim olması.', emoji: '👑', category: 'kontrol' },
    { id: 'f14', title: 'Tüy veya İpek Kumaşla Ten Dokunuşu 🪶', description: 'Çok hafif ve huylandırıcı dokunuşlarla tüm vücudu uyarmak.', emoji: '🪶', category: 'duyusal' },
    { id: 'f15', title: 'Sabaha Kadar Kesintisiz Sarılma & Ten Uyumu 🌙', description: 'Tüm gece çıplak ve ten tene sarılarak uyumak.', emoji: '🌙', category: 'duygusal' }
  ],
  fantasyVotes: {},
  matchedFantasies: [],

  // Taş - Kağıt - Makas Düellosu (10 Saniyelik Karar Sayacı & Ceza)
  rpsDuel: {
    status: 'idle',
    player1Choice: null,
    player2Choice: null,
    winner: null,
    loser: null,
    loserDecisionMade: false,
    timerSeconds: 10,
    penaltyPoints: 25,
    penaltyDesc: "10 saniyede karar vermediğin için ceza aldın! Bu akşam partnerinin istediğini yapacaksın.",
    updatedAt: null
  },

  // Tutku Zarları
  tutkuZarlari: {
    actions: ['Öp 💋', 'Masaj Yap 💆', 'Isır 🦷', 'Yala 👅', 'Fısılda 💬', 'Buz Gezdir ❄️', 'Okşa ✨', 'Gıdıkla 🪶'],
    bodies: ['Boyun 🦢', 'Dudaklar 👄', 'Kulak Memesi 👂', 'Karın 🍫', 'Kalça 🍑', 'Göğüs 🔥', 'Uyluk 🦵', 'Omuzlar 💪'],
    durations: ['30 Saniye ⏱️', '1 Dakika ⏳', '2 Dakika ⏰', 'Gözleri Kapalı 🙈', 'Yavaşça 🐌', 'Tutkuyla 💥'],
    lastRoll: null
  },

  // Yaramaz Kazı Kazan Kartları
  canScratchInCurrentSession: true,
  scratchCards: [
    { id: 'sc1', title: 'Fısıltı Görevi', hint: 'Kazı ve öğren...', content: 'Bu gece partnerinin kulağına en sevdiğin 3 özelliğini fısılda ve öp.', isScratched: false, emoji: '🤫' },
    { id: 'sc2', title: 'Masaj Kuralı', hint: 'Kazı ve öğren...', content: 'Partnerine 10 dakika boyunca istediği bir bölgesine kesintisiz masaj yap.', isScratched: false, emoji: '💆' },
    { id: 'sc3', title: 'Göz Teması', hint: 'Kazı ve öğren...', content: 'Hiç konuşmadan 2 dakika boyunca sadece gözlerinin içine bakın.', isScratched: false, emoji: '👀' },
    { id: 'sc4', title: 'Kontrol Sende', hint: 'Kazı ve öğren...', content: 'Sonraki 15 dakika boyunca tüm kontrol sende, partnerin itaat edecek.', isScratched: false, emoji: '👑' },
  ],

  // Kamasutra Pozisyon Çarkı (Puan/Ceza Bağımsız +18 Özellik)
  kamasutraPositions: [
    {
      id: 'pos1',
      title: 'Lotus Pozisyonu (Bağdaş Aşkı)',
      category: 'Romantik & Duygusal',
      difficulty: 'Orta ⭐⭐',
      emoji: '🪷',
      description: 'Partnerin bağdaş kurarak oturur, sen onun kucağına yüz yüze oturursun. Kollar birbirine sarılır.',
      tip: 'Gözlerinizi birbirinizden ayırmayın ve yavaş, derin nefeslerle ritmi hissedin.'
    },
    {
      id: 'pos2',
      title: 'Ters Kovboy (Reverse Cowgirl)',
      category: 'Tutkulu & Kontrollü',
      difficulty: 'Kolay ⭐',
      emoji: '🤠',
      description: 'Partnerin sırtüstü uzanır, sen sırtın ona dönük şekilde üzerine oturarak ritmi ve derinliği yönetirsin.',
      tip: 'Partnerinin bacaklarına veya göğsüne dokunarak ritmi hızlandırabilirsin.'
    },
    {
      id: 'pos3',
      title: 'Kaşık Pozisyonu (Spooning)',
      category: 'Samimi & Şefkatli',
      difficulty: 'Kolay ⭐',
      emoji: '🥄',
      description: 'İkiniz de aynı yöne bakacak şekilde yan yana kıvrılırsınız. Arkadan sarılmalı ve sımsıcak bir temas sağlar.',
      tip: 'Sabah uyandığınızda veya tembel pazar günlerinde dinlendirici ve çok samimi bir andır.'
    },
    {
      id: 'pos4',
      title: 'Kelebek (The Butterfly)',
      category: 'Yoğun & Derin',
      difficulty: 'Orta ⭐⭐',
      emoji: '🦋',
      description: 'Yatağın veya masanın kenarına kalçan hizalanır, partnerin ayakta durarak sana yaklaşır. Bacakların onun omuzlarına veya beline dolanır.',
      tip: 'Açı mükemmel bir derinlik ve göz teması sağlar. Bel altına küçük bir yastık koyabilirsiniz.'
    },
    {
      id: 'pos5',
      title: 'Kucakta Aşk (Standing Embrace)',
      category: 'Ateşli & Spontan',
      difficulty: 'Zor ⭐⭐⭐',
      emoji: '🛋️',
      description: 'Partnerin seni kucağına alır, bacakların onun beline dolanır. Bir duvara veya koltuk kenarına yaslanabilirsiniz.',
      tip: 'Aniden başlayan tutkulu anlar için idealdir. Duvara yaslanmak dengeyi kolaylaştırır.'
    },
    {
      id: 'pos6',
      title: 'Köprü (The Arch)',
      category: 'Akrobatik & Çılgın',
      difficulty: 'Zor ⭐⭐⭐',
      emoji: '🌉',
      description: 'Sırtüstü uzanıp kalçanı yukarı kaldırarak köprü kurarsın veya bacaklarını dik açıyla açarsın.',
      tip: 'Esneklik gerektirir; belinize yumuşak bir yastık destek koyarak yorulmayı önleyebilirsiniz.'
    },
    {
      id: 'pos7',
      title: 'Denizyıldızı Masalı',
      category: 'Tembel & Zevkli',
      difficulty: 'Kolay ⭐',
      emoji: '🌟',
      description: 'Sen kollarını ve bacaklarını rahatça açıp yatarsın, partnerin tüm kontrolü alarak seni şımartır.',
      tip: 'Günün tüm yorgunluğunu atmak ve sadece şımartılmak istediğinde harika bir seçimdir.'
    },
    {
      id: 'pos8',
      title: 'Bacak Omuzda (Deep Gaze)',
      category: 'Derin Temas',
      difficulty: 'Orta ⭐⭐',
      emoji: '🦵',
      description: 'Sırtüstü yatarken tek veya iki bacağını partnerinin omzuna koyarsın. Yoğun temas ve yakınlık.',
      tip: 'Partnerinin elini tutun ve yüz ifadelerinizi izleyin.'
    }
  ],

  // Rol Yapma (Roleplay) Gizli Kart Destesi (Puan/Ceza Bağımsız +18 Özellik)
  roleplayCards: [
    {
      id: 'rp1',
      title: 'Barda Karşılaşan İki Yabancı',
      emoji: '🍸',
      setting: 'Loş bir kokteyl barı köşesi',
      partner1Role: 'Yalnız oturan gizemli ve çekici yabancı',
      partner2Role: 'Barda yanına oturup flört etmeye çalışan cesur yabancı',
      rules: 'Gerçek isimlerinizi veya ilişkinizi anımsatacak hiçbir kelime kullanmak yok. İlk defa tanışıyormuş gibi baştan çıkarın!',
      description: 'Birbirinizin ne kadar cazibeli olduğunu sıfırdan keşfetmek için harika bir flört oyunu.'
    },
    {
      id: 'rp2',
      title: 'Masaj Terapisti ve Müşteri',
      emoji: '💆',
      setting: 'Aromaterapi kokulu, mum ışığında sessiz bir spa odası',
      partner1Role: 'Özel teknikleriyle müşterisini gevşeten profesyonel terapist',
      partner2Role: 'Çok gergin ve her dokunuşta daha fazla teslim olan müşteri',
      rules: 'Müşteri konuşamaz, sadece derin nefesler alabilir ve mırıltılarla memnuniyetini ifade edebilir.',
      description: 'Yavaş, tensel ve tamamen dokunma duyusuna dayalı bir yakınlaşma seansı.'
    },
    {
      id: 'rp3',
      title: 'Özel Dedektif & Çekici Şüpheli',
      emoji: '🕵️',
      setting: 'Sorgu odası (Tek bir masa lambası ve sandalye)',
      partner1Role: 'Kural tanımaz, gerçekleri öğrenmekte kararlı dedektif',
      partner2Role: 'Dedektifi aklını çelerek sorgudan kurtulmaya çalışan kurnaz şüpheli',
      rules: 'Dedektif en cesur soruları sorar, şüpheli ise her cevapta dedektife biraz daha yaklaşır.',
      description: 'Zihinsel çekim ve tansiyonun doruğa çıktığı eğlenceli bir sorgulama.'
    },
    {
      id: 'rp4',
      title: 'Kraliyet Emri: Yönetici & Hizmetkar',
      emoji: '👑',
      setting: 'Saray yatak odası',
      partner1Role: 'Emirleri tartışılmaz hükümdar',
      partner2Role: 'Hükümdarın her fısıltısını yerine getirmekle görevli sadık kul',
      rules: 'Hükümdar ne isterse anında itirazsız yerine getirilir; ancak hükümdar da hizmetkarını ödüllendirmeyi bilmelidir.',
      description: 'Teslimiyet ve kontrol dinamiklerini keşfeden tatlı bir fantezi oyunu.'
    },
    {
      id: 'rp5',
      title: 'İlk Randevu Heyecanı',
      emoji: '🌹',
      setting: 'Romantik bir akşam yemeği sonrası evin kapısı',
      partner1Role: 'İlk buluşmada utangaç ama gözlerinden arzu okunan partner',
      partner2Role: 'Geceyi bitirmek istemeyen ve kapı eşiğinde öpmeye çalışan partner',
      rules: 'Acemi ve sabırsız ilk öpücük heyecanını yeniden canlandırın!',
      description: 'İlişkinin ilk kıvılcımlarını ve kelebeklerini yeniden uyandırır.'
    },
    {
      id: 'rp6',
      title: 'Gece Yarısı Otel Kaçamağı',
      emoji: '🏨',
      setting: 'Lüks bir otelin suit odası',
      partner1Role: 'Gizli kaçamak için şehre gelen tutkulu sevgili',
      partner2Role: 'Odayı önceden hazırlayıp sürprizlerle bekleyen baştan çıkarıcı sevgili',
      rules: 'Evdeki tüm rutin ve sorumluluklar kapının dışında kalır; bu odada sadece siz ve arzularınız var.',
      description: 'Rutinlerden sıyrılıp tamamen ana odaklanmayı sağlayan lüks bir kaçış.'
    }
  ]
};

// localStorage'dan yükle veya varsayılanları kullan
function loadState() {
  try {
    const saved = localStorage.getItem('pixelask_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      const merged = { ...defaultData, ...parsed };

      // Can durumunu garantiye al (1.000.000)
      if (merged.boyfriendHp === undefined || merged.boyfriendHp === null || isNaN(merged.boyfriendHp)) {
        merged.boyfriendHp = 1000000;
      }
      merged.maxHp = 1000000;

      // Daima mat0 (El) açık olmalı
      if (!merged.unlockedMaterials || !merged.unlockedMaterials.includes('mat0')) {
        merged.unlockedMaterials = ['mat0', ...(merged.unlockedMaterials || [])];
      }

      // Malzemelerin hasar değerlerini varsayılanlarla senkronize et
      defaultData.materials.forEach(defMat => {
        const existing = merged.materials?.find(m => m.id === defMat.id);
        if (existing) {
          existing.damageValue = defMat.damageValue;
          existing.damage = defMat.damage;
        }
      });

      // Malzemeler listesinde mat0 kontrolü
      if (!merged.materials || !merged.materials.find(m => m.id === 'mat0')) {
        merged.materials = defaultData.materials;
      }

      // Haftalık ve aylık görevlerde sayaç alanlarının varlığını garantiye al
      if (merged.assignedTasks) {
        ['weekly', 'monthly'].forEach(freq => {
          const task = merged.assignedTasks[freq];
          if (task && (task.targetCount === undefined || task.targetCount === null)) {
            task.targetCount = freq === 'weekly' ? 50 : 1000;
            task.currentCount = task.currentCount || 0;
            task.unit = freq === 'weekly' ? 'kez' : 'öpücük';
          }
        });
      }

      // Standart / Süresiz Görevler kontrolü
      if (!merged.standardTasks || merged.standardTasks.length === 0) {
        merged.standardTasks = [...defaultData.standardTasks];
      }

      // Zorunlu Cinsel Görevler kontrolü
      if (!merged.intimateTasks || merged.intimateTasks.length === 0) {
        merged.intimateTasks = [...defaultData.intimateTasks];
      }

      // Fantezi Havuzu ve Oyları kontrolü
      if (!merged.fantasyPool || merged.fantasyPool.length === 0) {
        merged.fantasyPool = [...defaultData.fantasyPool];
      }
      if (!merged.fantasyVotes) merged.fantasyVotes = {};
      if (!merged.matchedFantasies) merged.matchedFantasies = [];
      if (!merged.penaltiesLog) merged.penaltiesLog = [];

      // Taş Kağıt Makas ve Oyunlar kontrolü
      if (!merged.rpsDuel) merged.rpsDuel = { ...defaultData.rpsDuel };
      if (!merged.tutkuZarlari) merged.tutkuZarlari = { ...defaultData.tutkuZarlari };
      if (!merged.scratchCards || merged.scratchCards.length === 0) {
        merged.scratchCards = [...defaultData.scratchCards];
      }

      // Kamasutra & Rol Yapma kontrolü
      if (!merged.kamasutraPositions || merged.kamasutraPositions.length === 0) {
        merged.kamasutraPositions = [...defaultData.kamasutraPositions];
      }
      if (!merged.roleplayCards || merged.roleplayCards.length === 0) {
        merged.roleplayCards = [...defaultData.roleplayCards];
      }
      if (merged.canScratchInCurrentSession === undefined) {
        merged.canScratchInCurrentSession = true;
      }

      return merged;
    }
  } catch (e) {
    console.warn('State load error:', e);
  }
  return { ...defaultData };
}

function saveState() {
  try {
    localStorage.setItem('pixelask_state', JSON.stringify(store));
  } catch (e) {
    console.warn('State save error:', e);
  }
}

// Reaktif store
export const store = reactive(loadState());

// Otomatik kaydetme (her değişiklikte)
let saveTimeout = null;
export function scheduleSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveState(), 200);
}

// ============ Supabase Sync Helpers ============

export async function syncUserFromSupabase(userId) {
  try {
    // 1. Kullanıcının Açtığı Malzemeleri Getir
    const { data: unlockedData } = await supabase
      .from('user_unlocked_materials')
      .select('material_id')
      .eq('user_id', userId);
    if (unlockedData && unlockedData.length > 0) {
      const list = unlockedData.map(u => u.material_id);
      if (!list.includes('mat0')) list.unshift('mat0');
      store.unlockedMaterials = list;
    }

    // 2. Malzemeleri Getir
    const { data: matsData } = await supabase
      .from('materials')
      .select('*')
      .order('sort_order');
    if (matsData && matsData.length > 0) {
      store.materials = matsData.map(m => ({
        id: m.id,
        name: m.name,
        emoji: m.emoji,
        damageValue: m.damage_value,
        damage: `${m.damage_value} Hasar`,
        unlockCost: m.unlock_cost,
        sound: m.sound || 'slap',
        type: m.type || 'hand'
      }));
    }

    // 3. Görev Havuzunu Getir
    const { data: tasksData } = await supabase.from('tasks').select('*');
    if (tasksData && tasksData.length > 0) {
      store.dailyTasks = tasksData.filter(t => t.frequency === 'daily').map(t => ({
        id: t.id, title: t.title, points: t.points, frequency: 'daily'
      }));
      store.weeklyTasks = tasksData.filter(t => t.frequency === 'weekly').map(t => ({
        id: t.id, title: t.title, points: t.points, frequency: 'weekly',
        targetCount: t.target_count || 50, unit: t.unit || 'kez', currentCount: 0
      }));
      store.monthlyTasks = tasksData.filter(t => t.frequency === 'monthly').map(t => ({
        id: t.id, title: t.title, points: t.points, frequency: 'monthly',
        targetCount: t.target_count || 1000, unit: t.unit || 'öpücük', currentCount: 0
      }));
    }

    // 3.1 Standart / Süresiz Görevleri Getir
    try {
      const { data: stdTasksData, error: stdErr } = await supabase
        .from('standard_tasks')
        .select('*')
        .order('sort_order');
      if (!stdErr && stdTasksData && stdTasksData.length > 0) {
        store.standardTasks = stdTasksData.map(st => ({
          id: st.id,
          title: st.title,
          emoji: st.emoji || '💋',
          pointsPerUnit: st.points_per_unit || 1,
          unit: st.unit || 'adet',
          description: st.description || '',
          sortOrder: st.sort_order || 0,
          totalCompleted: 0
        }));
      }
    } catch (stdErr) {
      console.warn('Standard tasks fetch note:', stdErr);
    }

    // 4. Ödülleri Getir
    const { data: rewardsData } = await supabase.from('rewards').select('*').order('sort_order');
    if (rewardsData && rewardsData.length > 0) {
      store.rewards = rewardsData.map(r => ({
        id: r.id, title: r.title, description: r.description,
        cost: r.cost, emoji: r.emoji, type: r.type || 'custom'
      }));
    }

    // 5. Şiirleri Getir
    const { data: poemsData } = await supabase.from('poems').select('*');
    if (poemsData && poemsData.length > 0) {
      store.poems = poemsData.map(p => ({
        id: p.id, title: p.title, content: p.content
      }));
    }

    // 6. Kullanıcının Açtığı Şiirleri Getir
    const { data: acqPoems } = await supabase
      .from('user_acquired_poems')
      .select('poem_id, acquired_at, poem:poems(*)')
      .eq('user_id', userId);
    if (acqPoems && acqPoems.length > 0) {
      store.acquiredPoems = acqPoems.map(ap => ({
        id: ap.poem_id,
        title: ap.poem?.title || 'Özel Şiir',
        content: ap.poem?.content || '',
        acquiredAt: ap.acquired_at
      }));
    }

    // 7. Kullanıcının Aldığı Ödülleri Getir
    const { data: acqRewards } = await supabase
      .from('user_acquired_rewards')
      .select('*')
      .eq('user_id', userId);
    if (acqRewards && acqRewards.length > 0) {
      store.acquiredRewards = acqRewards.map(ar => ({
        id: ar.reward_id,
        title: ar.title,
        description: ar.description,
        cost: ar.cost,
        emoji: ar.emoji || '🎁',
        acquiredAt: ar.acquired_at,
        isUsed: ar.is_used
      }));
    }

    // 8. Atanmış Aktif Görevleri Getir
    const { data: assignedData } = await supabase
      .from('assigned_tasks')
      .select('*, task:tasks(*)')
      .eq('user_id', userId);
    if (assignedData && assignedData.length > 0) {
      assignedData.forEach(item => {
        if (store.assignedTasks[item.frequency] !== undefined) {
          store.assignedTasks[item.frequency] = {
            id: item.task_id,
            title: item.task?.title || 'Görev',
            points: item.task?.points || 10,
            frequency: item.frequency,
            currentCount: item.current_count || 0,
            targetCount: item.target_count || item.task?.target_count || 50,
            unit: item.unit || item.task?.unit || 'kez',
            assignedAt: item.assigned_at
          };
        }
      });
    }
  } catch (err) {
    console.warn('Supabase fetch error:', err);
  }
}

// ============ Actions ============

// Giriş (Supabase Öncelikli, Yerel Yedekli)
export async function login(username, password) {
  // Önce Supabase'den kontrol et
  try {
    const { data: supaUser, error: supaErr } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (!supaErr && supaUser) {
      store.currentUser = supaUser;

      if (supaUser.role === 'admin') {
        // Admin hesabı giriş yaptığında, oyunun puanı ve canı her zaman 'askim' hesabının verisini temsil eder!
        const { data: askimUser } = await supabase
          .from('users')
          .select('*')
          .eq('username', 'askim')
          .single();

        if (askimUser) {
          store.askimUser = askimUser;
          store.points = askimUser.points !== undefined ? askimUser.points : 150;
          store.boyfriendHp = askimUser.boyfriend_hp !== undefined ? askimUser.boyfriend_hp : 1000000;
          store.maxHp = askimUser.max_hp || 1000000;
          await syncUserFromSupabase(askimUser.id);
        } else {
          store.points = 150;
          store.boyfriendHp = 1000000;
        }
      } else {
        // Sevgili (askim) hesabı giriş yaptı
        store.points = supaUser.points !== undefined ? supaUser.points : 150;
        store.boyfriendHp = supaUser.boyfriend_hp !== undefined ? supaUser.boyfriend_hp : 1000000;
        store.maxHp = supaUser.max_hp || 1000000;
        await syncUserFromSupabase(supaUser.id);
      }

      scheduleSave();
      return { success: true, user: supaUser };
    }
  } catch (e) {
    console.warn('Supabase connection error:', e);
  }

  // Yerel hafızadan giriş (Yedek mod)
  const user = store.users.find(u => u.username === username && u.password === password);
  if (!user) return { success: false, error: 'Kullanıcı adı veya şifre hatalı!' };
  store.currentUser = user;

  const askimLocal = store.users.find(u => u.username === 'askim');
  if (user.role === 'admin' && askimLocal) {
    store.points = askimLocal.points;
    store.boyfriendHp = askimLocal.boyfriend_hp !== undefined ? askimLocal.boyfriend_hp : 1000000;
  } else {
    store.points = user.points;
    store.boyfriendHp = user.boyfriend_hp !== undefined ? user.boyfriend_hp : 1000000;
  }

  scheduleSave();
  return { success: true, user };
}

// Çıkış
export function logout() {
  store.currentUser = null;
  scheduleSave();
}

// Sevgiliye Hasar Verme & Can Mekaniği (1.000.000 Can)
export function damageBoyfriend(damageAmount) {
  if (store.boyfriendHp === undefined || store.boyfriendHp === null) {
    store.boyfriendHp = 1000000;
  }

  store.boyfriendHp = Math.max(0, store.boyfriendHp - damageAmount);

  let isDefeated = false;
  let pointsAwarded = 0;

  if (store.boyfriendHp <= 0) {
    isDefeated = true;
    pointsAwarded = 1000;
    store.points += 1000;
    const askimLocal = store.users.find(u => u.username === 'askim');
    if (askimLocal) askimLocal.points = store.points;
    if (store.currentUser?.username === 'askim') store.currentUser.points = store.points;
    if (store.askimUser) store.askimUser.points = store.points;

    // Canı sıfırlanıp 1.000.000 ile tekrar canlanır!
    store.boyfriendHp = 1000000;
  }

  // Supabase asenkron güncelleme (her zaman sevgilinin/oyunun hesabını güncelle)
  supabase.from('users').update({
    points: store.points,
    boyfriend_hp: store.boyfriendHp,
    updated_at: new Date().toISOString()
  }).eq('username', 'askim').then();

  scheduleSave();
  return {
    currentHp: store.boyfriendHp,
    maxHp: store.maxHp || 1000000,
    isDefeated,
    pointsAwarded,
  };
}

// Görev Zamanlama, Ceza Uygulama ve Otomatik Sıfırlama
export function checkAndApplyTaskPenalties() {
  const today = getTodayDateStr();
  const currentWeek = getCurrentWeekStr();
  const currentMonth = getCurrentMonthStr();
  let penaltyApplied = false;
  let totalDeducted = 0;

  // 1. Günlük Görev Ceza Kontrolü (Dün yapılmadıysa puanı kadar puan kaybettir)
  if (store.assignedTasks.daily) {
    const assignedDate = store.assignedTasks.daily.assignedDate;
    if (assignedDate && assignedDate < today) {
      if (!store.assignedTasks.daily.isCompleted) {
        const pts = store.assignedTasks.daily.points || 15;
        store.points -= pts; // EKSİYE DÜŞEBİLİR
        const askimLocal = store.users.find(u => u.username === 'askim');
        if (askimLocal) askimLocal.points = store.points;
        if (store.currentUser?.username === 'askim') store.currentUser.points = store.points;
        if (store.askimUser) store.askimUser.points = store.points;
        store.penaltiesLog.unshift({
          id: 'pen_d_' + Date.now(),
          type: 'daily',
          title: store.assignedTasks.daily.title,
          pointsDeducted: pts,
          date: today,
          reason: 'Dünkü günlük görev yapılmadığı için puan kesildi.'
        });
        totalDeducted += pts;
        penaltyApplied = true;
      }
      store.assignedTasks.daily = null;
    }
  }

  // 2. Haftalık Görev Ceza Kontrolü (Pazar gece 12'de sıfırlanır, yapılmadıysa ceza)
  if (store.assignedTasks.weekly) {
    const assignedWeek = store.assignedTasks.weekly.assignedWeek;
    if (assignedWeek && assignedWeek !== currentWeek) {
      const task = store.assignedTasks.weekly;
      const isDone = (task.currentCount || 0) >= (task.targetCount || 50) || task.isCompleted;
      if (!isDone) {
        const pts = task.points || 40;
        store.points -= pts; // EKSİYE DÜŞEBİLİR
        const askimLocal = store.users.find(u => u.username === 'askim');
        if (askimLocal) askimLocal.points = store.points;
        if (store.currentUser?.username === 'askim') store.currentUser.points = store.points;
        if (store.askimUser) store.askimUser.points = store.points;
        store.penaltiesLog.unshift({
          id: 'pen_w_' + Date.now(),
          type: 'weekly',
          title: task.title,
          pointsDeducted: pts,
          date: today,
          reason: 'Geçen haftaki görev tamamlanmadığı için puan kesildi.'
        });
        totalDeducted += pts;
        penaltyApplied = true;
      }
      store.assignedTasks.weekly = null;
    }
  }

  // 3. Aylık Görev Ceza Kontrolü (Bir sonraki ayın 1'inde sona erer, yapılmadıysa ceza)
  if (store.assignedTasks.monthly) {
    const assignedMonth = store.assignedTasks.monthly.assignedMonth;
    if (assignedMonth && assignedMonth !== currentMonth) {
      const task = store.assignedTasks.monthly;
      const isDone = (task.currentCount || 0) >= (task.targetCount || 1000) || task.isCompleted;
      if (!isDone) {
        const pts = task.points || 200;
        store.points -= pts; // EKSİYE DÜŞEBİLİR
        const askimLocal = store.users.find(u => u.username === 'askim');
        if (askimLocal) askimLocal.points = store.points;
        if (store.currentUser?.username === 'askim') store.currentUser.points = store.points;
        if (store.askimUser) store.askimUser.points = store.points;
        store.penaltiesLog.unshift({
          id: 'pen_m_' + Date.now(),
          type: 'monthly',
          title: task.title,
          pointsDeducted: pts,
          date: today,
          reason: 'Geçen ayki görev tamamlanmadığı için puan kesildi.'
        });
        totalDeducted += pts;
        penaltyApplied = true;
      }
      store.assignedTasks.monthly = null;
    }
  }

  // 4. Zorunlu Günlük Cinsel Görev Ceza Kontrolü
  if (store.activeIntimateTask) {
    const assignedDate = store.activeIntimateTask.assignedDate;
    if (assignedDate && assignedDate < today) {
      if (!store.activeIntimateTask.isCompleted) {
        const pts = store.activeIntimateTask.penaltyPoints || 30;
        store.points -= pts; // EKSİYE DÜŞEBİLİR
        const askimLocal = store.users.find(u => u.username === 'askim');
        if (askimLocal) askimLocal.points = store.points;
        if (store.currentUser?.username === 'askim') store.currentUser.points = store.points;
        if (store.askimUser) store.askimUser.points = store.points;
        store.penaltiesLog.unshift({
          id: 'pen_it_' + Date.now(),
          type: 'intimate',
          title: store.activeIntimateTask.title,
          pointsDeducted: pts,
          date: today,
          reason: `Dünkü zorunlu cinsel görev yapılmadı! Ceza: ${store.activeIntimateTask.penaltyDesc || 'Puan kesildi'}`
        });
        totalDeducted += pts;
        penaltyApplied = true;
      }
      store.activeIntimateTask = null;
    }
  }

  // Yeni Zorunlu Cinsel Görevi Ata (eğer bugün için henüz yoksa)
  if (!store.activeIntimateTask && store.intimateTasks?.length > 0) {
    const dayNum = parseInt(today.replace(/-/g, ''), 10) || 1;
    const idx = dayNum % store.intimateTasks.length;
    const task = store.intimateTasks[idx];
    store.activeIntimateTask = {
      ...task,
      assignedDate: today,
      isCompleted: false,
      completedAt: null,
      completedBy: null
    };
  }

  // Döngüsel görevleri ata
  assignPeriodTasks(today, currentWeek, currentMonth);

  if (penaltyApplied) {
    store.recentPenaltyAlert = {
      message: `Zamanında tamamlanmayan görevler nedeniyle toplam -${totalDeducted} ⭐ ceza kesildi!`,
      totalDeducted
    };
    supabase.from('users').update({ points: store.points }).eq('username', 'askim').then();
  }

  scheduleSave();
}

// Döngüsel görevleri zamanına göre atama
export function assignPeriodTasks(today, currentWeek, currentMonth) {
  today = today || getTodayDateStr();
  currentWeek = currentWeek || getCurrentWeekStr();
  currentMonth = currentMonth || getCurrentMonthStr();

  // Günlük görev: Sadece bugün tamamlanmamışsa ve aktif görev yoksa ata
  if (!store.assignedTasks.daily && store.dailyTaskClaimedDate !== today && store.dailyTasks.length > 0) {
    const idx = Math.floor(Math.random() * store.dailyTasks.length);
    store.assignedTasks.daily = {
      ...store.dailyTasks[idx],
      assignedDate: today,
      isCompleted: false,
      assignedAt: new Date().toISOString()
    };
  }

  // Haftalık görev: Hafta başında (Pazar 24:00 / Pazartesi 00:00) atanır
  if (!store.assignedTasks.weekly && store.weeklyTasks.length > 0) {
    const idx = Math.floor(Math.random() * store.weeklyTasks.length);
    const wTask = store.weeklyTasks[idx];
    store.assignedTasks.weekly = {
      ...wTask,
      assignedWeek: currentWeek,
      currentCount: 0,
      targetCount: wTask.targetCount || 50,
      unit: wTask.unit || 'kez',
      isCompleted: false,
      assignedAt: new Date().toISOString()
    };
  }

  // Aylık görev: Ayın 1'inde atanır
  if (!store.assignedTasks.monthly && store.monthlyTasks.length > 0) {
    const idx = Math.floor(Math.random() * store.monthlyTasks.length);
    const mTask = store.monthlyTasks[idx];
    store.assignedTasks.monthly = {
      ...mTask,
      assignedMonth: currentMonth,
      currentCount: 0,
      targetCount: mTask.targetCount || 1000,
      unit: mTask.unit || 'öpücük',
      isCompleted: false,
      assignedAt: new Date().toISOString()
    };
  }
}

// Geriye dönük uyumluluk için
export function assignRandomTasks() {
  checkAndApplyTaskPenalties();
}

// Görev ilerlemesi güncelle (Sadece haftalık ve aylık görevler için)
export function updateTaskProgress(taskType, increment) {
  const task = store.assignedTasks[taskType];
  if (!task) return { success: false, error: 'Görev bulunamadı!' };

  const inc = parseInt(increment, 10);
  if (isNaN(inc) || inc <= 0) return { success: false, error: 'Geçersiz sayı!' };

  task.currentCount = Math.min((task.currentCount || 0) + inc, task.targetCount);

  // Supabase asenkron kayıt
  if (store.currentUser?.id) {
    supabase.from('assigned_tasks').upsert({
      user_id: store.currentUser.id,
      frequency: taskType,
      task_id: task.id,
      current_count: task.currentCount || 0,
      target_count: task.targetCount || null,
      unit: task.unit || null
    }, { onConflict: 'user_id,frequency' }).then();
  }

  scheduleSave();

  const isCompleted = task.currentCount >= task.targetCount;
  return { success: true, isCompleted, currentCount: task.currentCount, targetCount: task.targetCount };
}

// Görev tamamla (Ödül puanını al)
export function completeTask(taskType) {
  const task = store.assignedTasks[taskType];
  if (!task) return false;

  const today = getTodayDateStr();

  // Günlük görev ise ve bugün zaten tamamlanmışsa art arda yapılmasını engelle (gece 12'ye kadar kilitli)
  if (taskType === 'daily') {
    if (store.dailyTaskClaimedDate === today) {
      return false;
    }
  }

  // Haftalık/Aylık için hedefe ulaşılmış mı kontrolü
  if (taskType !== 'daily' && task.targetCount && (task.currentCount || 0) < task.targetCount) {
    return false;
  }

  store.points += task.points;
  if (store.currentUser) store.currentUser.points = store.points;

  if (taskType === 'daily') {
    store.dailyTaskClaimedDate = today;
    task.isCompleted = true;
    store.assignedTasks.daily = null; // Bugünün görevi bitti, saat 12'ye kadar kilitli kalacak
  } else {
    task.isCompleted = true;
    store.assignedTasks[taskType] = null;
  }

  store.completedTasks.push({
    ...task,
    completedAt: new Date().toISOString(),
    type: taskType,
  });

  // Supabase asenkron kayıt
  if (store.currentUser?.id) {
    supabase.from('users').update({ points: store.points }).eq('id', store.currentUser.id).then();
    supabase.from('completed_tasks').insert({
      user_id: store.currentUser.id,
      task_id: task.id,
      task_title: task.title,
      frequency: taskType,
      points_earned: task.points
    }).then();
  }

  scheduleSave();
  return true;
}

// Zorunlu Günlük Cinsel Görevi Tamamlama
export function claimIntimateTask() {
  if (!store.activeIntimateTask) return { success: false, error: 'Aktif cinsel görev yok.' };
  if (store.activeIntimateTask.isCompleted) return { success: false, error: 'Bu görev zaten tamamlandı!' };

  store.activeIntimateTask.isCompleted = true;
  store.activeIntimateTask.completedAt = new Date().toISOString();
  store.activeIntimateTask.completedBy = store.currentUser?.username || 'ikimiz';

  const pts = store.activeIntimateTask.points || 30;
  store.points += pts;
  if (store.currentUser) store.currentUser.points = store.points;

  if (store.currentUser?.id) {
    supabase.from('users').update({ points: store.points }).eq('id', store.currentUser.id).then();
  }

  scheduleSave();
  return { success: true, pointsAwarded: pts, task: store.activeIntimateTask };
}

// Günün Fantezisi Getir
export function getTodayFantasy() {
  if (!store.fantasyPool || store.fantasyPool.length === 0) return null;
  const today = getTodayDateStr();
  const dayNum = parseInt(today.replace(/-/g, ''), 10) || 1;
  const idx = dayNum % store.fantasyPool.length;
  return store.fantasyPool[idx];
}

// Günün Fantezisine Oy Ver (Evet, Belki, Hayır)
export function voteDailyFantasy(fantasyId, vote) {
  const username = store.currentUser?.username || 'askim';
  if (!store.fantasyVotes[fantasyId]) {
    store.fantasyVotes[fantasyId] = {};
  }
  store.fantasyVotes[fantasyId][username] = vote;

  let isMatch = false;
  const votes = store.fantasyVotes[fantasyId];
  if (votes.askim === 'yes' && votes.admin === 'yes') {
    isMatch = true;
    if (!store.matchedFantasies.find(m => m.id === fantasyId)) {
      const fan = store.fantasyPool.find(f => f.id === fantasyId);
      if (fan) {
        store.matchedFantasies.push({
          ...fan,
          matchedAt: new Date().toISOString()
        });
      }
    }
  }

  scheduleSave();
  return { success: true, vote, isMatch, fantasyVotes: votes };
}

// Taş - Kağıt - Makas Seçimi Yap
export function makeRpsChoice(player, choice) {
  const duel = store.rpsDuel;
  if (player === 'askim') duel.player1Choice = choice;
  if (player === 'admin') duel.player2Choice = choice;

  duel.updatedAt = new Date().toISOString();

  // İki taraf da seçim yaptıysa kazananı ve kaybedeni belirle
  if (duel.player1Choice && duel.player2Choice) {
    const p1 = duel.player1Choice;
    const p2 = duel.player2Choice;

    if (p1 === p2) {
      duel.winner = 'tie';
      duel.loser = null;
      duel.status = 'tie';
    } else if (
      (p1 === 'rock' && p2 === 'scissors') ||
      (p1 === 'paper' && p2 === 'rock') ||
      (p1 === 'scissors' && p2 === 'paper')
    ) {
      duel.winner = 'askim';
      duel.loser = 'admin';
      duel.status = 'countdown';
      duel.loserDecisionMade = false;
      duel.timerSeconds = 10;
    } else {
      duel.winner = 'admin';
      duel.loser = 'askim';
      duel.status = 'countdown';
      duel.loserDecisionMade = false;
      duel.timerSeconds = 10;
    }
  } else {
    duel.status = 'waiting';
  }

  scheduleSave();
  return { ...duel };
}

// Kaybeden 10 Saniye İçinde Karar Verdim Butonuna Bastı
export function confirmRpsDecision() {
  const duel = store.rpsDuel;
  duel.loserDecisionMade = true;
  duel.status = 'decided';
  scheduleSave();
  return { success: true, message: 'Harika! Kararını zamanında verdin 🎉' };
}

// Kaybeden 10 Saniyede Karar Veremedi -> Ceza Uygula
export function applyRpsPenalty() {
  const duel = store.rpsDuel;
  duel.status = 'penalized';
  const penalty = duel.penaltyPoints || 25;
  store.points -= penalty; // EKSİYE DÜŞEBİLİR!

  const askimLocal = store.users.find(u => u.username === 'askim');
  if (askimLocal) askimLocal.points = store.points;
  if (store.currentUser?.username === 'askim') store.currentUser.points = store.points;
  if (store.askimUser) store.askimUser.points = store.points;

  store.penaltiesLog.unshift({
    id: 'pen_rps_' + Date.now(),
    type: 'rps',
    title: 'Taş Kağıt Makas Karar Cezası',
    pointsDeducted: penalty,
    date: getTodayDateStr(),
    reason: duel.penaltyDesc || '10 saniyede karar verilmedi!'
  });

  supabase.from('users').update({ points: store.points }).eq('username', 'askim').then();

  scheduleSave();
  return { success: true, penalty, penaltyDesc: duel.penaltyDesc };
}

// Taş Kağıt Makas Düellosunu Sıfırla
export function resetRpsDuel() {
  store.rpsDuel.player1Choice = null;
  store.rpsDuel.player2Choice = null;
  store.rpsDuel.winner = null;
  store.rpsDuel.loser = null;
  store.rpsDuel.loserDecisionMade = false;
  store.rpsDuel.status = 'idle';
  store.rpsDuel.timerSeconds = 10;
  scheduleSave();
}

// Tutku Zarları Yuvarla
export function rollTutkuZarlari() {
  const z = store.tutkuZarlari;
  const action = z.actions[Math.floor(Math.random() * z.actions.length)];
  const body = z.bodies[Math.floor(Math.random() * z.bodies.length)];
  const duration = z.durations[Math.floor(Math.random() * z.durations.length)];
  z.lastRoll = { action, body, duration, rolledAt: new Date().toISOString() };
  scheduleSave();
  return z.lastRoll;
}

// Tutku Odasına Giriş (Her girişte 1 kazıma hakkı yenilenir)
export function openPassionRoom() {
  store.canScratchInCurrentSession = true;
  store.scratchCards.forEach(c => {
    c.isScratched = false;
  });
  scheduleSave();
}

// Kazı Kazan Kartını Aç (Giriş başına sadece 1 kart!)
export function scratchCard(cardId) {
  if (store.canScratchInCurrentSession === false) {
    return {
      success: false,
      alreadyUsed: true,
      error: 'Bu girişindeki 1 kazıma hakkını kullandın! Yeni bir sürpriz açmak için odaya tekrar gir sevgilim.'
    };
  }
  const card = store.scratchCards.find(c => c.id === cardId);
  if (card) {
    card.isScratched = true;
    store.canScratchInCurrentSession = false; // Bu oturumdaki hakkı bitti!
    scheduleSave();
    return { success: true, card };
  }
  return { success: false, error: 'Kart bulunamadı!' };
}

// Standart / Süresiz Görev Tamamlama (Adet bazlı puan alma - Örn: 20 öpücük = +20 Puan)
export async function claimStandardTask(taskId, count) {
  const numericCount = parseInt(count, 10);
  if (isNaN(numericCount) || numericCount <= 0) {
    return { success: false, error: 'Lütfen geçerli bir adet girin (en az 1).' };
  }

  const task = store.standardTasks.find(t => t.id === taskId);
  if (!task) {
    return { success: false, error: 'Görev bulunamadı!' };
  }

  const pointsEarned = numericCount * (task.pointsPerUnit || 1);
  store.points += pointsEarned;
  if (store.currentUser) {
    store.currentUser.points = store.points;
  }
  task.totalCompleted = (task.totalCompleted || 0) + numericCount;

  // Supabase puan ve görev geçmişi güncellemesi
  if (store.currentUser?.id) {
    try {
      await supabase.from('users').update({
        points: store.points,
        updated_at: new Date().toISOString()
      }).eq('id', store.currentUser.id);

      await supabase.from('completed_tasks').insert({
        user_id: store.currentUser.id,
        task_id: task.id,
        task_title: `${numericCount}x ${task.title} (${task.unit || 'adet'})`,
        frequency: 'daily', // constraint safe
        points_earned: pointsEarned
      });
    } catch (e) {
      console.warn('Supabase standard task claim error:', e);
    }
  }

  scheduleSave();
  return {
    success: true,
    pointsEarned,
    count: numericCount,
    taskTitle: task.title,
    unit: task.unit,
    totalPoints: store.points
  };
}

// Malzeme aç
export function unlockMaterial(materialId) {
  const material = store.materials.find(m => m.id === materialId);
  if (!material) return { success: false, error: 'Malzeme bulunamadı!' };
  if (store.unlockedMaterials.includes(materialId)) return { success: false, error: 'Zaten açık!' };
  if (store.points < material.unlockCost) return { success: false, error: 'Yeterli puanın yok!' };

  store.points -= material.unlockCost;
  if (store.currentUser) store.currentUser.points = store.points;
  store.unlockedMaterials.push(materialId);
  // Supabase asenkron kayıt
  if (store.currentUser?.id) {
    supabase.from('users').update({ points: store.points }).eq('id', store.currentUser.id).then();
    supabase.from('user_unlocked_materials').insert({
      user_id: store.currentUser.id,
      material_id: materialId
    }).then();
  }

  scheduleSave();
  return { success: true };
}

// Ödül satın al
export function purchaseReward(rewardId) {
  const reward = store.rewards.find(r => r.id === rewardId);
  if (!reward) return { success: false, error: 'Ödül bulunamadı!' };
  if (store.points < reward.cost) return { success: false, error: 'Yeterli puanın yok!' };

  store.points -= reward.cost;
  if (store.currentUser) store.currentUser.points = store.points;

  if (reward.type === 'poem') {
    const unopened = store.poems.filter(p => !store.acquiredPoems.find(ap => ap.id === p.id));
    if (unopened.length === 0) {
      store.points += reward.cost; // geri ver
      if (store.currentUser) store.currentUser.points = store.points;
      return { success: false, error: 'Tüm şiirleri zaten açtın!' };
    }
    const poem = unopened[Math.floor(Math.random() * unopened.length)];
    store.acquiredPoems.push({ ...poem, acquiredAt: new Date().toISOString() });

    // Supabase asenkron kayıt
    if (store.currentUser?.id) {
      supabase.from('users').update({ points: store.points }).eq('id', store.currentUser.id).then();
      supabase.from('user_acquired_poems').insert({
        user_id: store.currentUser.id,
        poem_id: poem.id
      }).then();
    }

    scheduleSave();
    return { success: true, type: 'poem', poem };
  } else {
    store.acquiredRewards.push({
      ...reward,
      acquiredAt: new Date().toISOString(),
    });

    // Supabase asenkron kayıt
    if (store.currentUser?.id) {
      supabase.from('users').update({ points: store.points }).eq('id', store.currentUser.id).then();
      supabase.from('user_acquired_rewards').insert({
        user_id: store.currentUser.id,
        reward_id: reward.id,
        title: reward.title,
        description: reward.description,
        cost: reward.cost,
        emoji: reward.emoji
      }).then();
    }

    scheduleSave();
    return { success: true, type: 'reward' };
  }
}

// Admin Fonksiyonları (Her zaman sevgilinin 'askim' hesabını günceller & Eksi puana izin verir)
export function setPoints(amount) {
  store.points = parseInt(amount, 10) || 0; // EKSİYE DÜŞEBİLİR
  const askim = store.users.find(u => u.username === 'askim');
  if (askim) askim.points = store.points;
  if (store.currentUser?.username === 'askim') {
    store.currentUser.points = store.points;
  }
  if (store.askimUser) {
    store.askimUser.points = store.points;
  }
  supabase.from('users').update({ points: store.points }).eq('username', 'askim').then();
  scheduleSave();
}

export function addPoints(amount) {
  store.points += (parseInt(amount, 10) || 0); // EKSİYE DÜŞEBİLİR
  const askim = store.users.find(u => u.username === 'askim');
  if (askim) askim.points = store.points;
  if (store.currentUser?.username === 'askim') {
    store.currentUser.points = store.points;
  }
  if (store.askimUser) {
    store.askimUser.points = store.points;
  }
  supabase.from('users').update({ points: store.points }).eq('username', 'askim').then();
  scheduleSave();
}

export function setBoyfriendHp(amount) {
  const hp = Math.max(0, parseInt(amount, 10) || 0);
  store.boyfriendHp = hp;
  supabase.from('users').update({ boyfriend_hp: hp }).eq('username', 'askim').then();
  scheduleSave();
}

export function addTask(task, frequency) {
  const id = frequency.charAt(0) + Date.now();
  const newTask = {
    id,
    ...task,
    frequency,
    targetCount: frequency !== 'daily' ? (task.targetCount || 50) : undefined,
    currentCount: 0,
    unit: task.unit || 'kez',
  };
  if (frequency === 'daily') store.dailyTasks.push(newTask);
  else if (frequency === 'weekly') store.weeklyTasks.push(newTask);
  else store.monthlyTasks.push(newTask);

  // Supabase asenkron ekleme
  supabase.from('tasks').insert({
    id: newTask.id,
    title: newTask.title,
    points: newTask.points,
    frequency: newTask.frequency,
    target_count: newTask.targetCount || null,
    unit: newTask.unit || null
  }).then();

  scheduleSave();
}

export function updateTask(taskId, frequency, fields) {
  const pool = frequency === 'daily' ? store.dailyTasks :
               frequency === 'weekly' ? store.weeklyTasks : store.monthlyTasks;
  const idx = pool.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    pool[idx] = { ...pool[idx], ...fields };
    if (store.assignedTasks[frequency]?.id === taskId) {
      store.assignedTasks[frequency] = { ...store.assignedTasks[frequency], ...fields };
    }

    // Supabase asenkron güncelleme
    supabase.from('tasks').update({
      title: fields.title,
      points: fields.points,
      target_count: fields.targetCount || null,
      unit: fields.unit || null
    }).eq('id', taskId).then();

    scheduleSave();
    return true;
  }
  return false;
}

export function removeTask(taskId, frequency) {
  if (frequency === 'daily') store.dailyTasks = store.dailyTasks.filter(t => t.id !== taskId);
  else if (frequency === 'weekly') store.weeklyTasks = store.weeklyTasks.filter(t => t.id !== taskId);
  else store.monthlyTasks = store.monthlyTasks.filter(t => t.id !== taskId);
  if (store.assignedTasks[frequency]?.id === taskId) {
    store.assignedTasks[frequency] = null;
  }

  // Supabase silme
  supabase.from('tasks').delete().eq('id', taskId).then();

  scheduleSave();
}

// Standart / Süresiz Görev Admin İşlemleri
export async function addStandardTask(task) {
  const id = 'std_' + Date.now();
  const newTask = {
    id,
    title: task.title || 'Yeni Sabit Görev',
    emoji: task.emoji || '💋',
    pointsPerUnit: parseInt(task.pointsPerUnit, 10) || 1,
    unit: task.unit || 'adet',
    description: task.description || '',
    sortOrder: store.standardTasks.length + 1,
    totalCompleted: 0
  };

  store.standardTasks.push(newTask);
  scheduleSave();

  try {
    await supabase.from('standard_tasks').insert({
      id: newTask.id,
      title: newTask.title,
      emoji: newTask.emoji,
      points_per_unit: newTask.pointsPerUnit,
      unit: newTask.unit,
      description: newTask.description,
      sort_order: newTask.sortOrder
    });
  } catch (e) {
    console.warn('Supabase standard_tasks insert note:', e);
  }
  return newTask;
}

export async function updateStandardTask(taskId, fields) {
  const idx = store.standardTasks.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    store.standardTasks[idx] = { ...store.standardTasks[idx], ...fields };
    scheduleSave();

    try {
      await supabase.from('standard_tasks').update({
        title: fields.title,
        emoji: fields.emoji,
        points_per_unit: parseInt(fields.pointsPerUnit, 10) || 1,
        unit: fields.unit,
        description: fields.description,
        sort_order: fields.sortOrder || 0
      }).eq('id', taskId);
    } catch (e) {
      console.warn('Supabase standard_tasks update note:', e);
    }
    return true;
  }
  return false;
}

export async function deleteStandardTask(taskId) {
  store.standardTasks = store.standardTasks.filter(t => t.id !== taskId);
  scheduleSave();

  try {
    await supabase.from('standard_tasks').delete().eq('id', taskId);
  } catch (e) {
    console.warn('Supabase standard_tasks delete note:', e);
  }
}

export function reassignSpecificTask(frequency) {
  const pool = frequency === 'daily' ? store.dailyTasks :
               frequency === 'weekly' ? store.weeklyTasks : store.monthlyTasks;
  if (pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    const task = pool[idx];
    store.assignedTasks[frequency] = {
      ...task,
      currentCount: 0,
      targetCount: task.targetCount || (frequency === 'weekly' ? 50 : 1000),
      unit: task.unit || 'kez',
      assignedAt: new Date().toISOString()
    };

    if (store.currentUser?.id) {
      supabase.from('assigned_tasks').upsert({
        user_id: store.currentUser.id,
        frequency,
        task_id: task.id,
        current_count: 0,
        target_count: task.targetCount || null,
        unit: task.unit || null
      }, { onConflict: 'user_id,frequency' }).then();
    }
  } else {
    store.assignedTasks[frequency] = null;
  }
  scheduleSave();
}

export function addReward(reward) {
  const id = 'r' + Date.now();
  const newR = { id, ...reward };
  store.rewards.push(newR);

  // Supabase asenkron ekleme
  supabase.from('rewards').insert({
    id: newR.id,
    title: newR.title,
    description: newR.description,
    cost: newR.cost,
    emoji: newR.emoji,
    type: newR.type || 'custom'
  }).then();

  scheduleSave();
}

export function updateReward(rewardId, fields) {
  const idx = store.rewards.findIndex(r => r.id === rewardId);
  if (idx !== -1) {
    store.rewards[idx] = { ...store.rewards[idx], ...fields };

    // Supabase asenkron güncelleme
    supabase.from('rewards').update({
      title: fields.title,
      description: fields.description,
      cost: fields.cost,
      emoji: fields.emoji,
      type: fields.type
    }).eq('id', rewardId).then();

    scheduleSave();
    return true;
  }
  return false;
}

export function removeReward(rewardId) {
  store.rewards = store.rewards.filter(r => r.id !== rewardId);
  supabase.from('rewards').delete().eq('id', rewardId).then();
  scheduleSave();
}

export function addPoem(poem) {
  const id = 'p' + Date.now();
  const newP = { id, ...poem };
  store.poems.push(newP);

  // Supabase asenkron ekleme
  supabase.from('poems').insert({
    id: newP.id,
    title: newP.title,
    content: newP.content
  }).then();

  scheduleSave();
}

export function updatePoem(poemId, fields) {
  const idx = store.poems.findIndex(p => p.id === poemId);
  if (idx !== -1) {
    store.poems[idx] = { ...store.poems[idx], ...fields };

    // Supabase asenkron güncelleme
    supabase.from('poems').update({
      title: fields.title,
      content: fields.content
    }).eq('id', poemId).then();

    scheduleSave();
    return true;
  }
  return false;
}

export function removePoem(poemId) {
  store.poems = store.poems.filter(p => p.id !== poemId);
  supabase.from('poems').delete().eq('id', poemId).then();
  scheduleSave();
}

export function addMaterial(material) {
  const id = 'mat' + Date.now();
  const newM = { id, ...material };
  store.materials.push(newM);

  // Supabase asenkron ekleme
  supabase.from('materials').insert({
    id: newM.id,
    name: newM.name,
    emoji: newM.emoji,
    damage_value: newM.damageValue,
    unlock_cost: newM.unlockCost,
    sound: newM.sound,
    type: newM.type || 'hand'
  }).then();

  scheduleSave();
}

export function updateMaterial(materialId, fields) {
  const idx = store.materials.findIndex(m => m.id === materialId);
  if (idx !== -1) {
    store.materials[idx] = { ...store.materials[idx], ...fields };

    // Supabase asenkron güncelleme
    supabase.from('materials').update({
      name: fields.name,
      emoji: fields.emoji,
      damage_value: fields.damageValue,
      unlock_cost: fields.unlockCost,
      sound: fields.sound,
      type: fields.type
    }).eq('id', materialId).then();

    scheduleSave();
    return true;
  }
  return false;
}

export function toggleMaterialUnlock(materialId) {
  const idx = store.unlockedMaterials.indexOf(materialId);
  if (idx !== -1) {
    // Kilitli yap (mat0 hariç, mat0 hep açık kalmalı)
    if (materialId !== 'mat0') {
      store.unlockedMaterials.splice(idx, 1);
      if (store.currentUser?.id) {
        supabase.from('user_unlocked_materials').delete().eq('user_id', store.currentUser.id).eq('material_id', materialId).then();
      }
    }
  } else {
    // Kilidi aç
    store.unlockedMaterials.push(materialId);
    if (store.currentUser?.id) {
      supabase.from('user_unlocked_materials').insert({
        user_id: store.currentUser.id,
        material_id: materialId
      }).then();
    }
  }
  scheduleSave();
}

export function removeMaterial(materialId) {
  if (materialId === 'mat0') return; // İlk silah silinemez
  store.materials = store.materials.filter(m => m.id !== materialId);
  store.unlockedMaterials = store.unlockedMaterials.filter(id => id !== materialId);
  supabase.from('materials').delete().eq('id', materialId).then();
  scheduleSave();
}

// Cinsel Görevler Admin İşlemleri
export function addIntimateTask(task) {
  const id = 'it_' + Date.now();
  const newTask = {
    id,
    title: task.title,
    points: parseInt(task.points, 10) || 30,
    penaltyPoints: parseInt(task.penaltyPoints, 10) || 30,
    penaltyDesc: task.penaltyDesc || 'Ceza masajı yapılacak!'
  };
  store.intimateTasks.push(newTask);
  scheduleSave();
  return newTask;
}

export function updateIntimateTask(taskId, fields) {
  const idx = store.intimateTasks.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    store.intimateTasks[idx] = {
      ...store.intimateTasks[idx],
      ...fields,
      points: parseInt(fields.points, 10) || store.intimateTasks[idx].points,
      penaltyPoints: parseInt(fields.penaltyPoints, 10) || store.intimateTasks[idx].penaltyPoints
    };
    if (store.activeIntimateTask?.id === taskId) {
      store.activeIntimateTask = { ...store.activeIntimateTask, ...fields };
    }
    scheduleSave();
    return true;
  }
  return false;
}

export function deleteIntimateTask(taskId) {
  store.intimateTasks = store.intimateTasks.filter(t => t.id !== taskId);
  if (store.activeIntimateTask?.id === taskId) {
    store.activeIntimateTask = null;
  }
  scheduleSave();
}

// Taş Kağıt Makas Ceza Ayarları
export function updateRpsSettings(penaltyPoints, penaltyDesc) {
  store.rpsDuel.penaltyPoints = parseInt(penaltyPoints, 10) || 25;
  store.rpsDuel.penaltyDesc = penaltyDesc || store.rpsDuel.penaltyDesc;
  scheduleSave();
}

// Fantezi Havuzu Admin İşlemleri
export function addFantasy(fan) {
  const id = 'f_' + Date.now();
  const newFan = {
    id,
    title: fan.title,
    description: fan.description || '',
    emoji: fan.emoji || '🔥',
    category: fan.category || 'genel'
  };
  store.fantasyPool.push(newFan);
  scheduleSave();
  return newFan;
}

export function updateFantasy(id, fields) {
  const idx = store.fantasyPool.findIndex(f => f.id === id);
  if (idx !== -1) {
    store.fantasyPool[idx] = { ...store.fantasyPool[idx], ...fields };
    scheduleSave();
    return true;
  }
  return false;
}

export function deleteFantasy(id) {
  store.fantasyPool = store.fantasyPool.filter(f => f.id !== id);
  scheduleSave();
}

// Kamasutra Çarkı Admin İşlemleri
export function addKamasutraPosition(pos) {
  const id = 'pos_' + Date.now();
  const newPos = {
    id,
    title: pos.title,
    category: pos.category || 'Romantik & Duygusal',
    difficulty: pos.difficulty || 'Orta ⭐⭐',
    emoji: pos.emoji || '🪷',
    description: pos.description || '',
    tip: pos.tip || ''
  };
  store.kamasutraPositions.push(newPos);
  scheduleSave();
  return newPos;
}

export function updateKamasutraPosition(id, fields) {
  const idx = store.kamasutraPositions.findIndex(p => p.id === id);
  if (idx !== -1) {
    store.kamasutraPositions[idx] = { ...store.kamasutraPositions[idx], ...fields };
    scheduleSave();
    return true;
  }
  return false;
}

export function deleteKamasutraPosition(id) {
  store.kamasutraPositions = store.kamasutraPositions.filter(p => p.id !== id);
  scheduleSave();
}

// Rol Yapma (Roleplay) Admin İşlemleri
export function addRoleplayCard(card) {
  const id = 'rp_' + Date.now();
  const newCard = {
    id,
    title: card.title,
    emoji: card.emoji || '🎭',
    setting: card.setting || '',
    partner1Role: card.partner1Role || '',
    partner2Role: card.partner2Role || '',
    rules: card.rules || '',
    description: card.description || ''
  };
  store.roleplayCards.push(newCard);
  scheduleSave();
  return newCard;
}

export function updateRoleplayCard(id, fields) {
  const idx = store.roleplayCards.findIndex(c => c.id === id);
  if (idx !== -1) {
    store.roleplayCards[idx] = { ...store.roleplayCards[idx], ...fields };
    scheduleSave();
    return true;
  }
  return false;
}

export function deleteRoleplayCard(id) {
  store.roleplayCards = store.roleplayCards.filter(c => c.id !== id);
  scheduleSave();
}

// Kazı Kazan Kartları Admin İşlemleri
export function addScratchCard(card) {
  const id = 'sc_' + Date.now();
  const newCard = {
    id,
    title: card.title,
    emoji: card.emoji || '🎁',
    hint: card.hint || 'Kazı ve öğren...',
    content: card.content || '',
    isScratched: false
  };
  store.scratchCards.push(newCard);
  scheduleSave();
  return newCard;
}

export function updateScratchCard(id, fields) {
  const idx = store.scratchCards.findIndex(c => c.id === id);
  if (idx !== -1) {
    store.scratchCards[idx] = { ...store.scratchCards[idx], ...fields };
    scheduleSave();
    return true;
  }
  return false;
}

export function deleteScratchCard(id) {
  store.scratchCards = store.scratchCards.filter(c => c.id !== id);
  scheduleSave();
}

export function resetState() {
  Object.assign(store, JSON.parse(JSON.stringify(defaultData)));
  localStorage.removeItem('pixelask_state');
  localStorage.removeItem('pixelask_lastAssign');
}

