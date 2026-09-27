# 🌸 Minimalist Aesthetic Life Dashboard & Planner

## 1. Proje Özeti & Vizyon
Web tabanlı; masaüstü, tablet ve mobilde tek sayfa kaydırmalı (single-page dashboard) olarak çalışan, minimalist, şık ve fonksiyonel kişisel planlayıcı.

### Temel Prensipler
- **Aesthetic First:** Soft pastel/bej/toprak tonları, zarif kart gölgeleri (`shadow-sm`), yuvarlatılmış köşeler (`rounded-2xl`), dergi/editorial tipografi.
- **İzole & Modüler Mimari:** Her blok ayrı bir bileşen (`components/dashboard/...`) olarak kodlanacak ve test edilecek.
- **Performans & Arşiv:** Sadece aktif günün verisi yüklenecek. Tarihe tıklanıp geçmiş bir gün seçilmedikçe eski loglar çekilmeyecek (lazy-loading).
- **Aşamalı Geliştirme:** Önce mock verilerle frontend arayüzü kurulacak; kullanıcı onayından sonra Supabase (PostgreSQL & Storage) entegre edilecek.

---

## 2. Teknoloji Yığını (Tech Stack)
- **Framework:** Next.js (App Router), TypeScript
- **Stil / UI:** Tailwind CSS, `shadcn/ui` bileşenleri
- **İkonlar:** Lucide Icons
- **Grafikler:** Recharts (Donut / Pie Chart)
- **Tipografi:** 
  - Tarih & Başlıklar: Serif Google Fonts (*Playfair Display* veya *Cormorant Garamond*)
  - Gövde Metinleri: *Plus Jakarta Sans* veya *Inter*
- **Backend & Storage:** Supabase (Database, Auth, Image Storage)

---

## 3. Sayfa Yerleşimi ve Modül Detayları (Wireframe Bazlı)

### 📌 Modül 1: Aesthetic Date Header (Tepe Başlık)
- **Konum:** Sayfanın en üstünde, tam ortada.
- **İçerik:** Zarif serif fontla o günün tarihi (Örn: `27 Eylül 2026, Pazar`).
- **Arşiv Erişimi:** Tarihe tıklandığında pop-up takvim açılır; geçmiş bir güne tıklandığında o günün To-Do'su, fotoğrafı ve Brain Dump'ı arşivden yüklenir. Ok butonları yer almaz.

---

### 📌 Modül 2, 3 & 4: Üst Bölüm (To-Do, Takvim ve Fotoğraf)
Sayfanın üst yarısı iki sütunlu asimetrik bir ızgara (grid) yapısındadır:

- **Sol Sütun:**
  - **Daily To-Do List:** Sol tarafta boylamasına uzanan, yaklaşık 7-8 satırlık sade yapılacaklar listesi. Tamamlanan görevlerin üstü çizilir. Takvimden bugüne denk gelen anımsatıcılar en üst sıraya otomatik eklenir. Her gün sıfırlanır, geçmiş günlere tarihten erişilebilir.

- **Sağ Sütun:**
  - **Aylık Takvim (Sağ Üst):** O ayı gösteren mini grid. İleri tarihli etkinlik/anımsatıcı (doğum günleri, staj tarihleri vb.) girilebilir. Anımsatıcı olan günlerde zarif bir nokta görünür; tıklandığında popup açılır. Anımsatıcı günü geldiğinde görev sol taraftaki To-Do listesinin en başına düşer.
  - **Polaroid Fotoğraf Alanı (Sağ Alt - Takvimin Altı):** Takvimin hemen altında, hafif yan yatmış (`rotate-[3deg]`), gölgeli polaroid çerçeve. Tıklandığında güne ait fotoğraf yüklenir veya değiştirilir. Her gün için ayrı tutulur.

---

### 📌 Modül 5: Haftalık Program (Weekly Timetable)
- **Konum:** Üst bloğun altında, sayfayı enlemesine kaplayan geniş yatay zaman çizelgesi.
- **Zaman Çizelgesi:** Sabah 07:00'den Akşam 23:00'e kadar, Pazartesi-Pazar arası saatlik bloklar.
- **İki Katmanlı Yapı:**
  1. *Sabit Ders Programı (Kalıcı):* Silinene kadar 5 ay boyunca her hafta sabit kalan dersler.
  2. *Haftalık Özel Etkinlik:* Sadece seçili haftaya özel buluşma, sınav veya etkinlikler.
- **Hızlı Ekleme Çubuğu:**
  - Programın hemen altında ince, estetik yatay dikdörtgen çubuk.
  - Solunda `+` butonu; tıklandığında popup ile başlık, gün, saat aralığı ve tür (Sabit / Sadece Bu Hafta) seçilip tabloya eklenir.

---

### 📌 Modül 6 & 7: Orta-Alt Bölüm (Brain Dump & Bütçe Grafiği)
- **Sol Taraf - Brain Dump:**
  - Sayfanın sol 3/4 genişliğini kaplayan, serbest düşünce ve günlük not alanı. 
  - Sağ köşesinde estetik küçük bir mood ikonu/çıkartması. Günlük olarak sıfırlanır ve arşivlenir.
- **Sağ Taraf - Bütçe / Harcama Takibi (Pie Chart):**
  - Üstte büyükçe toplam harcama (`Total: ₺XX,XXX`).
  - Ortada minimalist Donut / Pie Chart.
  - Altında kategori listesi (Market, Benzin vb.) ve harcama eklemek için `+` butonu.
  - Kategori rengi ve miktarı girildikçe grafik dinamik olarak dilimlere ayrılır. Aylık bazda sıfırlanır.

---

### 📌 Modül 8: Projeler & İlerleme Çubukları (En Alt Alan)
- **Konum:** Sayfanın en alt kısmı.
- **İşleyiş:**
  - `+` butonu ile proje başlığı (Örn: *Web Sitesi*, *Maket*) açılır.
  - İsteğe bağlı alt adımlar (checklist) tanımlanır.
  - Alt görevler tamamlandıkça sağ taraftaki loading / progress bar görsel olarak dolar (%0 - %100).
  - Kullanıcı silene kadar kalıcıdır.

---

## 4. Antigravity Geliştirme Talimatları
1. **Bileşen Bazlı Kodlama:** Tüm sayfayı tek seferde yazma. Her modülü `components/` altında bağımsız olarak oluştur.
2. **Adım Adım Onay:** İlk olarak `Header` + `To-Do` (Sol) + `Takvim & Fotoğraf` (Sağ) üst bloğunu tamamlayıp görsel çıktıyı kullanıcıya göster; onay almadan alt modüllere geçme.
3. **State Yönetimi:** İlk fazda harici API/Supabase çağrısı yapma, arayüzü local mock-state ile çalışır hale getir.