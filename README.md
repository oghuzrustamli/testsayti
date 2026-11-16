# EDUNEX QUIZ CREATOR
## Müasir, Təhlükəsiz və Tam İşlək Təhsil Platforması

EDUNEX Quiz Creator müəllimlərin test hazırladığı, sual bankı formalaşdırdığı, şagirdlərin imtahan verdiyi, nəticələrin avtomatik hesablandığı və bütün proseslərin vahid sistemdə idarə olunduğu peşəkar təhsil platformasıdır.

---

### Əsas İmkanlar və Modullar:

1. **Test Creator**:
   - İmtahan modelləri: Buraxılış imtahanı (DİM 9 və 11-ci siniflər), Blok imtahanı (I Qrup Rİ, I Qrup RK, II, III, IV Qruplar), Şagird qrupu (KSQ/BSQ), Liseylərə qəbul.
   - Həyat bilgisi və İnsan və cəmiyyət fənləri istisna edilib; dinamik fənn seçimi.
   - Standart, mütənasib və 1/4 cəriməli (səhvlər düzü aparır) qiymətləndirmə qaydaları.

2. **Sual Redaktoru**:
   - 7 sual növü (Bir düzgün cavablı, Çoxsaylı, Doğru/Yanlış, Uyğunlaşdırma, Boşluq doldurma, Açıq tipli, Ədədi).
   - Şaquli yığcam, üfüqi geniş sual mətni və A, B, C, D, E variantları.
   - Sual sıralama, kopyalama (duplicate), redaktə və silmə.

3. **Riyazi Redaktor (KaTeX)**:
   - `\sqrt6`, `\frac{a+b}{c}`, `x^2`, `a_1`, `\sqrt{x^2+1}`, `\frac{\sqrt{x^2+1}}{2a}`, onluq və mürəkkəb kəsrlər, triqonometriya, inteqral.
   - Vizual riyazi düstur klaviaturası (LaTeX kodlarını əllə yazmadan bir kliklə əlavə etmək).

4. **Qrafik Laboratoriyası (Canvas & Plotter)**:
   - Xətti ($kx+b$), kvadratik ($ax^2+bx+c$), modul ($|x|$), tərs mütənasib ($k/x$), üstlü ($a \cdot b^x$), loqarifmik və triqonometrik funksiyalar.
   - Koordinat oxları, miqyaslama, tor, köklərin ($f(x)=0$) və təpə nöqtəsinin ($T(x_0, y_0)$) avtomatik tapılması.
   - "Qrafiki suala əlavə et" düyməsi ilə sualın içinə birbaşa yerləşdirmə.

5. **İnteraktiv Test Rejimi (Şagird Ekranı)**:
   - Taymer, sual matrisi naviqasiyası, cavabların dərhal avtomatik yadda saxlanması, oflayn rejim müdafiəsi.
   - Testi bitirmədən öncə təsdiq pəncərəsi, vaxt bitdikdə avtomatik təhvil və nəticə atəşfəşanlığı (confetti).

6. **Cavablı Test Rejimi (İzahlı və Çap Modulu)**:
   - Düzgün cavabların və addım-addım həll izahlarının göstərilməsi.
   - A4 formatında səhifələnmə, sualların və qrafiklərin çapda tam qorunması.

7. **İnteraktiv Sual Bankı**:
   - Daimi sual kitabxanası.
   - Ardıcıl sual əlavə etmə ("Siyahıya əlavə et"), axtarış və filtrləmə.
   - "Testi formalaşdır və göndər" -> "İnteraktiv testə göndər" və "Cavablı testə göndər".

8. **Paylaşım Sistemi**:
   - Unikal keçid linki və qısa sınaq kodu (məs: `EDX-DEMO-2026`).
   - WhatsApp ilə hazır dəvət mətni ilə birbaşa paylaşım.
   - Linki dərhal deaktiv və ya aktiv etmə imkanı.

9. **Nəticələr və Statistika**:
   - Şagirdlərin toplanan balları, düzgün/səhv/boş sayı və sərf edilən müddət.
   - Fərdi sual-sual cavab kartı təhlil pəncərəsi.
   - Excel (.xlsx) və PDF ixracı.
   - Sinif ortalaması, ən yüksək/ən aşağı nəticə, hər sual üzrə mənimsəmə faizi, ən çox səhv edilən suallar, bal paylanması histogramı.

10. **PRO və Aktivasiya Sistemi**:
    - Paketlər: 1 ay (7 AZN), 3 ay (20 AZN), 6 ay (40 AZN), 12 ay (60 AZN).
    - Unikal birdəfəlik aktivasiya kodları (məs: `EDX-PRO1-9842`).
    - Server tərəfində tam təsdiq və müddətin uzadılması.

11. **Administrator Paneli**:
    - İstifadəçilər, statusun dəyişdirilməsi, PRO müddətinin uzadılması.
    - Avtomatik toplu PRO kod generatoru.
    - Təhlükəsizlik audit jurnalı.
    - Loqoya 10 dəfə kliklə gizli giriş + admin şifrə doğrulaması.

---

### Sistemə Giriş üçün Hazır Demo Hesablar:

| Rol | Email | Şifrə | Təsvir |
|---|---|---|---|
| **Müəllim** | `muellim@edunex.az` | `muellim123` | Nərmin Məmmədova (PRO Aktiv) |
| **Şagird** | `sagird@edunex.az` | `sagird123` | Əli Həsənov |
| **Administrator** | `admin@edunex.az` | `admin123` | Baş Administrator |

### Başlamaq üçün:
- Brauzerdə daxil olun: **`http://localhost:5000`**
- Və ya qovluqdakı **`start.bat`** faylını işə salın.
