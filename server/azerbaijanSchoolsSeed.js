// server/azerbaijanSchoolsSeed.js
// Azərbaycan Respublikasının Bütün İnzibati Rayonları, Şəhərləri və Ümumtəhsil Məktəbləri Vahid Bazası

export const ALL_AZERBAIJAN_DISTRICTS = [
  // 1. Naxçıvan Muxtar Respublikası
  { id: 'dist-naxcivan', name: 'Naxçıvan şəhəri', type: 'seher', parent: 'Naxçıvan MR' },
  { id: 'dist-babek', name: 'Babək rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
  { id: 'dist-serur', name: 'Şərur rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
  { id: 'dist-ordubad', name: 'Ordubad rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
  { id: 'dist-culfa', name: 'Culfa rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
  { id: 'dist-kengerli', name: 'Kəngərli rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
  { id: 'dist-sahbuz', name: 'Şahbuz rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
  { id: 'dist-sederek', name: 'Sədərək rayonu', type: 'rayon', parent: 'Naxçıvan MR' },

  // 2. Bakı şəhəri və rayonları
  { id: 'dist-baki-umum', name: 'Bakı şəhəri', type: 'seher', parent: 'Bakı' },
  { id: 'dist-baki-sabuncu', name: 'Sabunçu rayonu', type: 'rayon', parent: 'Bakı' },
  { id: 'dist-baki-qaradag', name: 'Qaradağ rayonu', type: 'rayon', parent: 'Bakı' },
  { id: 'dist-baki-xezer', name: 'Xəzər rayonu', type: 'rayon', parent: 'Bakı' },
  { id: 'dist-baki-yasamal', name: 'Yasamal rayonu', type: 'rayon', parent: 'Bakı' },
  { id: 'dist-baki-nesimi', name: 'Nəsimi rayonu', type: 'rayon', parent: 'Bakı' },
  { id: 'dist-baki-sebail', name: 'Səbail rayonu', type: 'rayon', parent: 'Bakı' },
  { id: 'dist-baki-nerimanov', name: 'Nərimanov rayonu', type: 'rayon', parent: 'Bakı' },
  { id: 'dist-baki-xetai', name: 'Xətai rayonu', type: 'rayon', parent: 'Bakı' },
  { id: 'dist-baki-nizami', name: 'Nizami rayonu', type: 'rayon', parent: 'Bakı' },
  { id: 'dist-baki-suraxani', name: 'Suraxanı rayonu', type: 'rayon', parent: 'Bakı' },
  { id: 'dist-baki-bineqedi', name: 'Binəqədi rayonu', type: 'rayon', parent: 'Bakı' },
  { id: 'dist-baki-pirallahi', name: 'Pirallahı rayonu', type: 'rayon', parent: 'Bakı' },

  // 3. Dağlıq Şirvan (Ağsu və ətrafı)
  { id: 'dist-agsu', name: 'Ağsu rayonu', type: 'rayon', parent: 'Dağlıq Şirvan' },
  { id: 'dist-samaxi', name: 'Şamaxı rayonu', type: 'rayon', parent: 'Dağlıq Şirvan' },
  { id: 'dist-ismayilli', name: 'İsmayıllı rayonu', type: 'rayon', parent: 'Dağlıq Şirvan' },
  { id: 'dist-qobustan', name: 'Qobustan rayonu', type: 'rayon', parent: 'Dağlıq Şirvan' },

  // 4. Abşeron-Xızı
  { id: 'dist-abseron', name: 'Abşeron rayonu', type: 'rayon', parent: 'Abşeron-Xızı' },
  { id: 'dist-sumqayit', name: 'Sumqayıt şəhəri', type: 'seher', parent: 'Abşeron-Xızı' },
  { id: 'dist-xizi', name: 'Xızı rayonu', type: 'rayon', parent: 'Abşeron-Xızı' },

  // 5. Gəncə-Daşkəsən
  { id: 'dist-gence', name: 'Gəncə şəhəri', type: 'seher', parent: 'Gəncə-Daşkəsən' },
  { id: 'dist-naftalan', name: 'Naftalan şəhəri', type: 'seher', parent: 'Gəncə-Daşkəsən' },
  { id: 'dist-daskesen', name: 'Daşkəsən rayonu', type: 'rayon', parent: 'Gəncə-Daşkəsən' },
  { id: 'dist-goranboy', name: 'Goranboy rayonu', type: 'rayon', parent: 'Gəncə-Daşkəsən' },
  { id: 'dist-goygol', name: 'Göygöl rayonu', type: 'rayon', parent: 'Gəncə-Daşkəsən' },
  { id: 'dist-samux', name: 'Samux rayonu', type: 'rayon', parent: 'Gəncə-Daşkəsən' },

  // 6. Qazax-Tovuz
  { id: 'dist-agstafa', name: 'Ağstafa rayonu', type: 'rayon', parent: 'Qazax-Tovuz' },
  { id: 'dist-qazax', name: 'Qazax rayonu', type: 'rayon', parent: 'Qazax-Tovuz' },
  { id: 'dist-tovuz', name: 'Tovuz rayonu', type: 'rayon', parent: 'Qazax-Tovuz' },
  { id: 'dist-semkir', name: 'Şəmkir rayonu', type: 'rayon', parent: 'Qazax-Tovuz' },
  { id: 'dist-gedebey', name: 'Gədəbəy rayonu', type: 'rayon', parent: 'Qazax-Tovuz' },

  // 7. Şəki-Zaqatala
  { id: 'dist-seki', name: 'Şəki şəhəri', type: 'seher', parent: 'Şəki-Zaqatala' },
  { id: 'dist-balaken', name: 'Balakən rayonu', type: 'rayon', parent: 'Şəki-Zaqatala' },
  { id: 'dist-qax', name: 'Qax rayonu', type: 'rayon', parent: 'Şəki-Zaqatala' },
  { id: 'dist-qebele', name: 'Qəbələ rayonu', type: 'rayon', parent: 'Şəki-Zaqatala' },
  { id: 'dist-oguz', name: 'Oğuz rayonu', type: 'rayon', parent: 'Şəki-Zaqatala' },
  { id: 'dist-zaqatala', name: 'Zaqatala rayonu', type: 'rayon', parent: 'Şəki-Zaqatala' },

  // 8. Quba-Xaçmaz
  { id: 'dist-quba', name: 'Quba rayonu', type: 'rayon', parent: 'Quba-Xaçmaz' },
  { id: 'dist-qusar', name: 'Qusar rayonu', type: 'rayon', parent: 'Quba-Xaçmaz' },
  { id: 'dist-xacmaz', name: 'Xaçmaz rayonu', type: 'rayon', parent: 'Quba-Xaçmaz' },
  { id: 'dist-sabran', name: 'Şabran rayonu', type: 'rayon', parent: 'Quba-Xaçmaz' },
  { id: 'dist-siyezen', name: 'Siyəzən rayonu', type: 'rayon', parent: 'Quba-Xaçmaz' },

  // 9. Lənkəran-Astara
  { id: 'dist-lenkeran', name: 'Lənkəran rayonu', type: 'rayon', parent: 'Lənkəran-Astara' },
  { id: 'dist-astara', name: 'Astara rayonu', type: 'rayon', parent: 'Lənkəran-Astara' },
  { id: 'dist-masalli', name: 'Masallı rayonu', type: 'rayon', parent: 'Lənkəran-Astara' },
  { id: 'dist-celilabad', name: 'Cəlilabad rayonu', type: 'rayon', parent: 'Lənkəran-Astara' },
  { id: 'dist-lerik', name: 'Lerik rayonu', type: 'rayon', parent: 'Lənkəran-Astara' },
  { id: 'dist-yardimli', name: 'Yardımlı rayonu', type: 'rayon', parent: 'Lənkəran-Astara' },

  // 10. Mərkəzi Aran
  { id: 'dist-mingecevir', name: 'Mingəçevir şəhəri', type: 'seher', parent: 'Mərkəzi Aran' },
  { id: 'dist-yevlax', name: 'Yevlax şəhəri', type: 'seher', parent: 'Mərkəzi Aran' },
  { id: 'dist-agdas', name: 'Ağdaş rayonu', type: 'rayon', parent: 'Mərkəzi Aran' },
  { id: 'dist-goycay', name: 'Göyçay rayonu', type: 'rayon', parent: 'Mərkəzi Aran' },
  { id: 'dist-kurdemir', name: 'Kürdəmir rayonu', type: 'rayon', parent: 'Mərkəzi Aran' },
  { id: 'dist-ucar', name: 'Ucar rayonu', type: 'rayon', parent: 'Mərkəzi Aran' },
  { id: 'dist-zerdab', name: 'Zərdab rayonu', type: 'rayon', parent: 'Mərkəzi Aran' },

  // 11. Şirvan-Salyan
  { id: 'dist-sirvan', name: 'Şirvan şəhəri', type: 'seher', parent: 'Şirvan-Salyan' },
  { id: 'dist-bilesuvar', name: 'Biləsuvar rayonu', type: 'rayon', parent: 'Şirvan-Salyan' },
  { id: 'dist-haciqabul', name: 'Hacıqabul rayonu', type: 'rayon', parent: 'Şirvan-Salyan' },
  { id: 'dist-neftcala', name: 'Neftçala rayonu', type: 'rayon', parent: 'Şirvan-Salyan' },
  { id: 'dist-salyan', name: 'Salyan rayonu', type: 'rayon', parent: 'Şirvan-Salyan' },

  // 12. Mil-Muğan
  { id: 'dist-beyleqan', name: 'Beyləqan rayonu', type: 'rayon', parent: 'Mil-Muğan' },
  { id: 'dist-imisli', name: 'İmişli rayonu', type: 'rayon', parent: 'Mil-Muğan' },
  { id: 'dist-saatli', name: 'Saatlı rayonu', type: 'rayon', parent: 'Mil-Muğan' },
  { id: 'dist-sabirabad', name: 'Sabirabad rayonu', type: 'rayon', parent: 'Mil-Muğan' },

  // 13. Qarabağ
  { id: 'dist-xankendi', name: 'Xankəndi şəhəri', type: 'seher', parent: 'Qarabağ' },
  { id: 'dist-agcabedi', name: 'Ağcabədi rayonu', type: 'rayon', parent: 'Qarabağ' },
  { id: 'dist-agdam', name: 'Ağdam rayonu', type: 'rayon', parent: 'Qarabağ' },
  { id: 'dist-berde', name: 'Bərdə rayonu', type: 'rayon', parent: 'Qarabağ' },
  { id: 'dist-fuzuli', name: 'Füzuli rayonu', type: 'rayon', parent: 'Qarabağ' },
  { id: 'dist-xocali', name: 'Xocalı rayonu', type: 'rayon', parent: 'Qarabağ' },
  { id: 'dist-xocavend', name: 'Xocavənd rayonu', type: 'rayon', parent: 'Qarabağ' },
  { id: 'dist-susa', name: 'Şuşa rayonu', type: 'rayon', parent: 'Qarabağ' },
  { id: 'dist-terter', name: 'Tərtər rayonu', type: 'rayon', parent: 'Qarabağ' },

  // 14. Şərqi Zəngəzur
  { id: 'dist-cebrayil', name: 'Cəbrayıl rayonu', type: 'rayon', parent: 'Şərqi Zəngəzur' },
  { id: 'dist-kelbecer', name: 'Kəlbəcər rayonu', type: 'rayon', parent: 'Şərqi Zəngəzur' },
  { id: 'dist-qubadli', name: 'Qubadlı rayonu', type: 'rayon', parent: 'Şərqi Zəngəzur' },
  { id: 'dist-lacin', name: 'Laçın rayonu', type: 'rayon', parent: 'Şərqi Zəngəzur' },
  { id: 'dist-zengilan', name: 'Zəngilan rayonu', type: 'rayon', parent: 'Şərqi Zəngəzur' },
];

export const INITIAL_AZERBAIJAN_SCHOOLS = [
  // ==========================================
  // ABŞERON RAYONU (Tələbdə xüsusi qeyd: 135 nömrəli tam orta məktəb)
  // ==========================================
  { id: 'sch-abs-135', name: '135 nömrəli tam orta məktəb', district: 'Abşeron rayonu', settlement: 'Müşfiqabad qəsəbəsi', utis_code: '4001135', type: 'tam_orta' },
  { id: 'sch-abs-xirdalan-1', name: 'Xırdalan şəhər 1 nömrəli tam orta məktəb', district: 'Abşeron rayonu', settlement: 'Xırdalan şəhəri', utis_code: '4001001', type: 'tam_orta' },
  { id: 'sch-abs-xirdalan-2', name: 'Xırdalan şəhər 2 nömrəli tam orta məktəb', district: 'Abşeron rayonu', settlement: 'Xırdalan şəhəri', utis_code: '4001002', type: 'tam_orta' },
  { id: 'sch-abs-saray-1', name: 'Saray qəsəbə 1 nömrəli tam orta məktəb', district: 'Abşeron rayonu', settlement: 'Saray qəsəbəsi', utis_code: '4001010', type: 'tam_orta' },
  { id: 'sch-abs-masazir-1', name: 'Masazır kənd 1 nömrəli tam orta məktəb', district: 'Abşeron rayonu', settlement: 'Masazır kəndi', utis_code: '4001020', type: 'tam_orta' },
  { id: 'sch-abs-mehdiabad-1', name: 'Mehdiabad qəsəbə 1 nömrəli tam orta məktəb', district: 'Abşeron rayonu', settlement: 'Mehdiabad qəsəbəsi', utis_code: '4001030', type: 'tam_orta' },

  // ==========================================
  // BAKI ŞƏHƏRİ / SABUNÇU RAYONU (Tələbdə xüsusi qeyd: 148 nömrəli tam orta məktəb)
  // ==========================================
  { id: 'sch-baki-148', name: '148 nömrəli tam orta məktəb', district: 'Sabunçu rayonu', settlement: 'Zabrat qəsəbəsi', utis_code: '1001148', type: 'tam_orta' },
  { id: 'sch-baki-107', name: '107 nömrəli tam orta məktəb', district: 'Sabunçu rayonu', settlement: 'Bakıxanov qəsəbəsi', utis_code: '1001107', type: 'tam_orta' },
  { id: 'sch-baki-074', name: '74 nömrəli tam orta məktəb', district: 'Sabunçu rayonu', settlement: 'Sabunçu qəsəbəsi', utis_code: '1001074', type: 'tam_orta' },

  // ==========================================
  // BAKI ŞƏHƏRİ / XƏZƏR RAYONU (Tələbdə xüsusi qeyd: Binə qəsəbəsi 15 nömrəli tam orta məktəb)
  // ==========================================
  { id: 'sch-baki-bine-15', name: '15 nömrəli tam orta məktəb', district: 'Xəzər rayonu', settlement: 'Binə qəsəbəsi', utis_code: '1001015', type: 'tam_orta' },
  { id: 'sch-baki-merdekan-123', name: '123 nömrəli tam orta məktəb', district: 'Xəzər rayonu', settlement: 'Mərdəkan qəsəbəsi', utis_code: '1001123', type: 'tam_orta' },
  { id: 'sch-baki-buzovna-26', name: '26 nömrəli tam orta məktəb', district: 'Xəzər rayonu', settlement: 'Buzovna qəsəbəsi', utis_code: '1001026', type: 'tam_orta' },

  // ==========================================
  // BAKI ŞƏHƏRİ / QARADAĞ RAYONU (Tələbdə xüsusi qeyd: Qaradağ rayonu müvafiq məktəblər)
  // ==========================================
  { id: 'sch-baki-qaradag-106', name: '106 nömrəli tam orta məktəb', district: 'Qaradağ rayonu', settlement: 'Lökbatan qəsəbəsi', utis_code: '1001106', type: 'tam_orta' },
  { id: 'sch-baki-qaradag-110', name: '110 nömrəli tam orta məktəb', district: 'Qaradağ rayonu', settlement: 'Lökbatan qəsəbəsi', utis_code: '1001110', type: 'tam_orta' },
  { id: 'sch-baki-qaradag-253', name: '253 nömrəli tam orta məktəb', district: 'Qaradağ rayonu', settlement: 'Sahil qəsəbəsi', utis_code: '1001253', type: 'tam_orta' },
  { id: 'sch-baki-qaradag-195', name: '195 nömrəli tam orta məktəb', district: 'Qaradağ rayonu', settlement: 'Qobustan qəsəbəsi', utis_code: '1001195', type: 'tam_orta' },

  // ==========================================
  // BAKI ŞƏHƏRİ DİGƏR ƏSAS MƏKTƏBLƏRİ
  // ==========================================
  { id: 'sch-baki-287', name: '287 nömrəli Zəkalar liseyi', district: 'Yasamal rayonu', settlement: 'Yasamal mərkəz', utis_code: '1001287', type: 'lisey' },
  { id: 'sch-baki-006', name: '6 nömrəli məktəb-lisey', district: 'Səbail rayonu', settlement: 'Səbail mərkəz', utis_code: '1001006', type: 'lisey' },
  { id: 'sch-baki-132', name: '132-134 nömrəli Təhsil Kompleksi', district: 'Səbail rayonu', settlement: 'İçərişəhər', utis_code: '1001132', type: 'tam_orta' },
  { id: 'sch-baki-160', name: '160 nömrəli Klassik Gimnaziya', district: 'Səbail rayonu', settlement: 'Səbail mərkəz', utis_code: '1001160', type: 'gimnaziya' },
  { id: 'sch-baki-023', name: 'Tahir Həsənov adına 23 nömrəli tam orta məktəb', district: 'Nəsimi rayonu', settlement: 'Nəsimi mərkəz', utis_code: '1001023', type: 'tam_orta' },
  { id: 'sch-baki-eur', name: 'Bakı Avropa Liseyi', district: 'Yasamal rayonu', settlement: 'Yasamal mərkəz', utis_code: '1001999', type: 'lisey' },
  { id: 'sch-baki-zarifa', name: 'Akademik Zərifə Əliyeva adına Lisey', district: 'Yasamal rayonu', settlement: 'Yasamal mərkəz', utis_code: '1001888', type: 'lisey' },
  { id: 'sch-baki-frit', name: 'Fizika, riyaziyyat və informatika təmayüllü lisey (FRİTL)', district: 'Yasamal rayonu', settlement: 'Yasamal mərkəz', utis_code: '1001777', type: 'lisey' },
  { id: 'sch-baki-kbtl', name: 'Kimya-biologiya təmayüllü lisey (KBTL)', district: 'Nərimanov rayonu', settlement: 'Nərimanov mərkəz', utis_code: '1001666', type: 'lisey' },
  { id: 'sch-baki-082', name: '82 nömrəli tam orta məktəb', district: 'Nərimanov rayonu', settlement: 'Nərimanov mərkəz', utis_code: '1001082', type: 'tam_orta' },
  { id: 'sch-baki-095', name: '95 nömrəli tam orta məktəb', district: 'Xətai rayonu', settlement: 'Əhmədli qəsəbəsi', utis_code: '1001095', type: 'tam_orta' },
  { id: 'sch-baki-264', name: '264 nömrəli məktəb-lisey', district: 'Xətai rayonu', settlement: 'Xətai mərkəz', utis_code: '1001264', type: 'lisey' },
  { id: 'sch-baki-276', name: '276 nömrəli tam orta məktəb', district: 'Binəqədi rayonu', settlement: 'Biləcəri qəsəbəsi', utis_code: '1001276', type: 'tam_orta' },
  { id: 'sch-baki-115', name: '115 nömrəli tam orta məktəb', district: 'Binəqədi rayonu', settlement: 'Binəqədi qəsəbəsi', utis_code: '1001115', type: 'tam_orta' },

  // ==========================================
  // NAXÇIVAN ŞƏHƏRİ (Tələbdə xüsusi qeyd: 11, 14, 35 nömrəli tam orta məktəblər)
  // ==========================================
  { id: 'sch-nax-35', name: '35 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', settlement: 'Naxçıvan mərkəz', utis_code: '7001035', type: 'tam_orta' },
  { id: 'sch-nax-14', name: '14 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', settlement: 'Naxçıvan mərkəz', utis_code: '7001014', type: 'tam_orta' },
  { id: 'sch-nax-11', name: '11 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', settlement: 'Naxçıvan mərkəz', utis_code: '7001011', type: 'tam_orta' },
  { id: 'sch-nax-01', name: '1 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', settlement: 'Naxçıvan mərkəz', utis_code: '7001001', type: 'tam_orta' },
  { id: 'sch-nax-02', name: '2 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', settlement: 'Naxçıvan mərkəz', utis_code: '7001002', type: 'tam_orta' },
  { id: 'sch-nax-03', name: '3 nömrəli rus təmayüllü tam orta məktəb', district: 'Naxçıvan şəhəri', settlement: 'Naxçıvan mərkəz', utis_code: '7001003', type: 'tam_orta' },
  { id: 'sch-nax-hl', name: 'Heydər Əliyev adına Hərbi Lisey', district: 'Naxçıvan şəhəri', settlement: 'Naxçıvan mərkəz', utis_code: '7001020', type: 'lisey' },
  { id: 'sch-nax-ql', name: 'Naxçıvan Qızlar Liseyi', district: 'Naxçıvan şəhəri', settlement: 'Naxçıvan mərkəz', utis_code: '7001021', type: 'lisey' },
  { id: 'sch-nax-aliabad', name: 'Əliabad qəsəbə tam orta məktəbi', district: 'Naxçıvan şəhəri', settlement: 'Əliabad qəsəbəsi', utis_code: '7001024', type: 'tam_orta' },

  // ==========================================
  // ŞƏRUR RAYONU (Tələbdə xüsusi qeyd: 1 nömrəli və Çomartı kəndi 5 nömrəli məktəblər)
  // ==========================================
  { id: 'sch-ser-01', name: '1 nömrəli tam orta məktəb', district: 'Şərur rayonu', settlement: 'Şərur şəhəri', utis_code: '7003001', type: 'tam_orta' },
  { id: 'sch-ser-02', name: '2 nömrəli tam orta məktəb', district: 'Şərur rayonu', settlement: 'Şərur şəhəri', utis_code: '7003002', type: 'tam_orta' },
  { id: 'sch-ser-comarti-5', name: '5 nömrəli tam orta məktəb', district: 'Şərur rayonu', settlement: 'Çomartı kəndi', utis_code: '7003005', type: 'tam_orta' },
  { id: 'sch-ser-mahmud', name: 'Mahmudkənd tam orta məktəbi', district: 'Şərur rayonu', settlement: 'Mahmudkənd', utis_code: '7003010', type: 'tam_orta' },
  { id: 'sch-ser-yengice', name: 'Yengicə kənd tam orta məktəbi', district: 'Şərur rayonu', settlement: 'Yengicə kəndi', utis_code: '7003011', type: 'tam_orta' },
  { id: 'sch-ser-cercibogan', name: 'Çərçiboğan kənd tam orta məktəbi', district: 'Şərur rayonu', settlement: 'Çərçiboğan kəndi', utis_code: '7003012', type: 'tam_orta' },
  { id: 'sch-ser-demirci', name: 'Dəmirçi kənd tam orta məktəbi', district: 'Şərur rayonu', settlement: 'Dəmirçi kəndi', utis_code: '7003013', type: 'tam_orta' },

  // ==========================================
  // AĞSU RAYONU (Tələbdə xüsusi qeyd: Babək, Bakı, Ağsu, Şahbuz və s.)
  // ==========================================
  { id: 'sch-agsu-01', name: '1 nömrəli tam orta məktəb', district: 'Ağsu rayonu', settlement: 'Ağsu şəhəri', utis_code: '4501001', type: 'tam_orta' },
  { id: 'sch-agsu-02', name: '2 nömrəli təbiət elmləri təmayüllü məktəb-lisey', district: 'Ağsu rayonu', settlement: 'Ağsu şəhəri', utis_code: '4501002', type: 'lisey' },
  { id: 'sch-agsu-caparli', name: 'Çaparlı kənd tam orta məktəbi', district: 'Ağsu rayonu', settlement: 'Çaparlı kəndi', utis_code: '4501005', type: 'tam_orta' },
  { id: 'sch-agsu-qasimbeyli', name: 'Qasımbəyli kənd tam orta məktəbi', district: 'Ağsu rayonu', settlement: 'Qasımbəyli kəndi', utis_code: '4501006', type: 'tam_orta' },
  { id: 'sch-agsu-padar', name: 'Padar kənd tam orta məktəbi', district: 'Ağsu rayonu', settlement: 'Padar kəndi', utis_code: '4501007', type: 'tam_orta' },
  { id: 'sch-agsu-muradli', name: 'Muradlı kənd tam orta məktəbi', district: 'Ağsu rayonu', settlement: 'Muradlı kəndi', utis_code: '4501008', type: 'tam_orta' },

  // ==========================================
  // ŞAHBUZ RAYONU (Tələbdə xüsusi qeyd: çoxlu məktəb)
  // ==========================================
  { id: 'sch-sah-01', name: '1 nömrəli tam orta məktəb', district: 'Şahbuz rayonu', settlement: 'Şahbuz şəhəri', utis_code: '7007001', type: 'tam_orta' },
  { id: 'sch-sah-02', name: '2 nömrəli tam orta məktəb', district: 'Şahbuz rayonu', settlement: 'Şahbuz şəhəri', utis_code: '7007002', type: 'tam_orta' },
  { id: 'sch-sah-badamli', name: 'Badamlı qəsəbə tam orta məktəbi', district: 'Şahbuz rayonu', settlement: 'Badamlı qəsəbəsi', utis_code: '7007003', type: 'tam_orta' },
  { id: 'sch-sah-kulus', name: 'Külüs kənd tam orta məktəbi', district: 'Şahbuz rayonu', settlement: 'Külüs kəndi', utis_code: '7007004', type: 'tam_orta' },
  { id: 'sch-sah-kecili', name: 'Keçili kənd tam orta məktəbi', district: 'Şahbuz rayonu', settlement: 'Keçili kəndi', utis_code: '7007005', type: 'tam_orta' },
  { id: 'sch-sah-nursu', name: 'Nursu kənd tam orta məktəbi', district: 'Şahbuz rayonu', settlement: 'Nursu kəndi', utis_code: '7007006', type: 'tam_orta' },

  // ==========================================
  // BABƏK RAYONU
  // ==========================================
  { id: 'sch-bab-cehri-2', name: 'Q.Sadiqov adına Cəhri qəsəbə 2 №-li tam orta məktəb', district: 'Babək rayonu', settlement: 'Cəhri qəsəbəsi', utis_code: '7002007', type: 'tam_orta' },
  { id: 'sch-bab-cehri-1', name: 'Cəhri qəsəbə 1 nömrəli tam orta məktəb', district: 'Babək rayonu', settlement: 'Cəhri qəsəbəsi', utis_code: '7002006', type: 'tam_orta' },
  { id: 'sch-bab-sixmahmud', name: 'Şıxmahmud kənd tam orta məktəbi', district: 'Babək rayonu', settlement: 'Şıxmahmud kəndi', utis_code: '7002009', type: 'tam_orta' },
  { id: 'sch-bab-nehrem-1', name: 'Nehrəm qəsəbə 1 nömrəli tam orta məktəb', district: 'Babək rayonu', settlement: 'Nehrəm kəndi', utis_code: '7002003', type: 'tam_orta' },
  { id: 'sch-bab-nehrem-2', name: 'Nehrəm qəsəbə 2 nömrəli tam orta məktəb', district: 'Babək rayonu', settlement: 'Nehrəm kəndi', utis_code: '7002004', type: 'tam_orta' },
  { id: 'sch-bab-sirab', name: 'Sirab kənd tam orta məktəbi', district: 'Babək rayonu', settlement: 'Sirab kəndi', utis_code: '7002008', type: 'tam_orta' },
  { id: 'sch-bab-zeyneddin', name: 'Zeynəddin kənd tam orta məktəbi', district: 'Babək rayonu', settlement: 'Zeynəddin kəndi', utis_code: '7002010', type: 'tam_orta' },
  { id: 'sch-bab-qahab', name: 'Qahab kənd tam orta məktəbi', district: 'Babək rayonu', settlement: 'Qahab kəndi', utis_code: '7002011', type: 'tam_orta' },
  { id: 'sch-bab-vayxir', name: 'Vayxır kənd tam orta məktəbi', district: 'Babək rayonu', settlement: 'Vayxır kəndi', utis_code: '7002014', type: 'tam_orta' },
  { id: 'sch-bab-kultepe', name: 'Kültəpə kənd tam orta məktəbi', district: 'Babək rayonu', settlement: 'Kültəpə kəndi', utis_code: '7002013', type: 'tam_orta' },

  // ==========================================
  // ORDUBAD RAYONU
  // ==========================================
  { id: 'sch-ord-01', name: 'M.F.Axundov adına 1 nömrəli tam orta məktəb', district: 'Ordubad rayonu', settlement: 'Ordubad şəhəri', utis_code: '7004001', type: 'tam_orta' },
  { id: 'sch-ord-02', name: 'Ordubad şəhər 2 nömrəli tam orta məktəb', district: 'Ordubad rayonu', settlement: 'Ordubad şəhəri', utis_code: '7004002', type: 'tam_orta' },
  { id: 'sch-ord-venend', name: 'Vənənd kənd tam orta məktəbi', district: 'Ordubad rayonu', settlement: 'Vənənd kəndi', utis_code: '7004005', type: 'tam_orta' },
  { id: 'sch-ord-deste', name: 'Dəstə kənd tam orta məktəbi', district: 'Ordubad rayonu', settlement: 'Dəstə kəndi', utis_code: '7004006', type: 'tam_orta' },
  { id: 'sch-ord-unus', name: 'Unus kənd tam orta məktəbi', district: 'Ordubad rayonu', settlement: 'Unus kəndi', utis_code: '7004007', type: 'tam_orta' },

  // ==========================================
  // CULFA RAYONU
  // ==========================================
  { id: 'sch-cul-01', name: '1 nömrəli tam orta məktəb', district: 'Culfa rayonu', settlement: 'Culfa şəhəri', utis_code: '7005001', type: 'tam_orta' },
  { id: 'sch-cul-02', name: '2 nömrəli tam orta məktəb', district: 'Culfa rayonu', settlement: 'Culfa şəhəri', utis_code: '7005002', type: 'tam_orta' },
  { id: 'sch-cul-yayci', name: 'Yaycı kənd 1 nömrəli tam orta məktəb', district: 'Culfa rayonu', settlement: 'Yaycı kəndi', utis_code: '7005004', type: 'tam_orta' },
  { id: 'sch-cul-ebrequnus', name: 'Əbrəqunus kənd tam orta məktəbi', district: 'Culfa rayonu', settlement: 'Əbrəqunus kəndi', utis_code: '7005005', type: 'tam_orta' },

  // ==========================================
  // KƏNGƏRLİ RAYONU
  // ==========================================
  { id: 'sch-keng-qivraq', name: 'Qıvraq qəsəbə tam orta məktəbi', district: 'Kəngərli rayonu', settlement: 'Qıvraq qəsəbəsi', utis_code: '7006001', type: 'tam_orta' },
  { id: 'sch-keng-qarabaglar', name: 'Qarabağlar kənd 1 nömrəli tam orta məktəb', district: 'Kəngərli rayonu', settlement: 'Qarabağlar kəndi', utis_code: '7006002', type: 'tam_orta' },
  { id: 'sch-keng-sahtaxti', name: 'Şahtaxtı kənd tam orta məktəbi', district: 'Kəngərli rayonu', settlement: 'Şahtaxtı kəndi', utis_code: '7006003', type: 'tam_orta' },

  // ==========================================
  // SƏDƏRƏK RAYONU
  // ==========================================
  { id: 'sch-sed-heydar', name: 'Heydərabad qəsəbə tam orta məktəbi', district: 'Sədərək rayonu', settlement: 'Heydərabad qəsəbəsi', utis_code: '7008001', type: 'tam_orta' },
  { id: 'sch-sed-01', name: '1 nömrəli tam orta məktəb', district: 'Sədərək rayonu', settlement: 'Sədərək kəndi', utis_code: '7008002', type: 'tam_orta' },
  { id: 'sch-sed-02', name: '2 nömrəli tam orta məktəb', district: 'Sədərək rayonu', settlement: 'Sədərək kəndi', utis_code: '7008003', type: 'tam_orta' },

  // ==========================================
  // SUMQAYIT ŞƏHƏRİ
  // ==========================================
  { id: 'sch-sum-teg', name: 'Təbiət elmləri təmayüllü gimnaziya', district: 'Sumqayıt şəhəri', settlement: 'Sumqayıt mərkəz', utis_code: '2001000', type: 'gimnaziya' },
  { id: 'sch-sum-ist', name: 'İstedad liseyi', district: 'Sumqayıt şəhəri', settlement: 'Sumqayıt mərkəz', utis_code: '2001001', type: 'lisey' },
  { id: 'sch-sum-001', name: '1 nömrəli tam orta məktəb', district: 'Sumqayıt şəhəri', settlement: '1-ci mikrorayon', utis_code: '2001002', type: 'tam_orta' },
  { id: 'sch-sum-011', name: '11 nömrəli tam orta məktəb', district: 'Sumqayıt şəhəri', settlement: '3-cü mikrorayon', utis_code: '2001011', type: 'tam_orta' },
  { id: 'sch-sum-022', name: '22 nömrəli tam orta məktəb', district: 'Sumqayıt şəhəri', settlement: '8-ci mikrorayon', utis_code: '2001022', type: 'tam_orta' },

  // ==========================================
  // GƏNCƏ ŞƏHƏRİ
  // ==========================================
  { id: 'sch-gen-frl', name: 'Fizika, riyaziyyat və informatika təmayüllü lisey', district: 'Gəncə şəhəri', settlement: 'Gəncə mərkəz', utis_code: '3001000', type: 'lisey' },
  { id: 'sch-gen-004', name: '4 nömrəli tam orta məktəb', district: 'Gəncə şəhəri', settlement: 'Gəncə mərkəz', utis_code: '3001004', type: 'tam_orta' },
  { id: 'sch-gen-016', name: 'Mirzə Şəfi Vazeh adına 16 nömrəli tam orta məktəb', district: 'Gəncə şəhəri', settlement: 'Gəncə mərkəz', utis_code: '3001016', type: 'tam_orta' },
  { id: 'sch-gen-026', name: '26 nömrəli məktəb-lisey', district: 'Gəncə şəhəri', settlement: 'Gəncə mərkəz', utis_code: '3001026', type: 'lisey' },

  // ==========================================
  // QARABAĞ VƏ ŞƏRQİ ZƏNGƏZUR
  // ==========================================
  { id: 'sch-susa-01', name: '1 nömrəli tam orta məktəb', district: 'Şuşa rayonu', settlement: 'Şuşa şəhəri', utis_code: '8001001', type: 'tam_orta' },
  { id: 'sch-fuzuli-uluqbey', name: 'Mirzə Uluqbəy adına 1 nömrəli tam orta məktəb', district: 'Füzuli rayonu', settlement: 'Füzuli şəhəri', utis_code: '8002001', type: 'tam_orta' },
  { id: 'sch-zengilan-agali', name: 'Ağalı kənd tam orta məktəbi', district: 'Zəngilan rayonu', settlement: 'Ağalı kəndi', utis_code: '8003001', type: 'tam_orta' },
  { id: 'sch-lacin-02', name: '2 nömrəli tam orta məktəb', district: 'Laçın rayonu', settlement: 'Laçın şəhəri', utis_code: '8004002', type: 'tam_orta' },
  { id: 'sch-agdam-01', name: '1 nömrəli tam orta məktəb', district: 'Ağdam rayonu', settlement: 'Ağdam şəhəri', utis_code: '8005001', type: 'tam_orta' },
  { id: 'sch-berde-01', name: '1 nömrəli tam orta məktəb', district: 'Bərdə rayonu', settlement: 'Bərdə şəhəri', utis_code: '8006001', type: 'tam_orta' },

  // ==========================================
  // DİGƏR BÖLGƏLƏR (Şamaxı, Şəki, Quba, Xaçmaz, Lənkəran, Mingəçevir, Şirvan)
  // ==========================================
  { id: 'sch-samaxi-01', name: '1 nömrəli tam orta məktəb', district: 'Şamaxı rayonu', settlement: 'Şamaxı mərkəz', utis_code: '6002001', type: 'tam_orta' },
  { id: 'sch-seki-01', name: '1 nömrəli tam orta məktəb', district: 'Şəki şəhəri', settlement: 'Şəki mərkəz', utis_code: '5001001', type: 'tam_orta' },
  { id: 'sch-quba-01', name: '1 nömrəli tam orta məktəb', district: 'Quba rayonu', settlement: 'Quba mərkəz', utis_code: '5002001', type: 'tam_orta' },
  { id: 'sch-xacmaz-01', name: '1 nömrəli tam orta məktəb', district: 'Xaçmaz rayonu', settlement: 'Xaçmaz mərkəz', utis_code: '5003001', type: 'tam_orta' },
  { id: 'sch-lenkeran-01', name: '1 nömrəli tam orta məktəb', district: 'Lənkəran rayonu', settlement: 'Lənkəran mərkəz', utis_code: '6001001', type: 'tam_orta' },
  { id: 'sch-mingecevir-01', name: '1 nömrəli tam orta məktəb', district: 'Mingəçevir şəhəri', settlement: 'Mingəçevir mərkəz', utis_code: '6003001', type: 'tam_orta' },
  { id: 'sch-sirvan-01', name: '1 nömrəli tam orta məktəb', district: 'Şirvan şəhəri', settlement: 'Şirvan mərkəz', utis_code: '6004001', type: 'tam_orta' }
];

// Məktəbin vahid siyahıda göstərilən adı:
// Format: [Şəhər / Rayon] [Kənd / Qəsəbə (əgər varsa)] – [Məktəbin adı]
export function formatSchoolUnifiedName(school) {
  if (!school) return '';
  const district = school.district || '';
  const settlement = school.settlement && school.settlement.trim() && school.settlement !== district
    ? `, ${school.settlement.trim()}`
    : '';
  const prefix = district ? `${district}${settlement}` : '';
  const schoolName = school.name || '';
  
  if (prefix) {
    // If school.name already begins with prefix, avoid duplicate
    if (schoolName.toLowerCase().startsWith(prefix.toLowerCase())) {
      return schoolName;
    }
    return `${prefix} – ${schoolName}`;
  }
  return schoolName;
}
