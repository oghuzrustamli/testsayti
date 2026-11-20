// server/azerbaijanSchoolsSeed.js
// Azərbaycan Respublikasının Bütün İnzibati Rayonları, Şəhərləri və Ümumtəhsil Məktəbləri Bazası

export const ALL_AZERBAIJAN_DISTRICTS = [
  // 1. Bakı İqtisadi Rayonu
  { id: 'dist-baki-yasamal', name: 'Bakı şəhəri - Yasamal', type: 'seher', parent: 'Bakı' },
  { id: 'dist-baki-nesimi', name: 'Bakı şəhəri - Nəsimi', type: 'seher', parent: 'Bakı' },
  { id: 'dist-baki-sebail', name: 'Bakı şəhəri - Səbail', type: 'seher', parent: 'Bakı' },
  { id: 'dist-baki-nerimanov', name: 'Bakı şəhəri - Nərimanov', type: 'seher', parent: 'Bakı' },
  { id: 'dist-baki-xetai', name: 'Bakı şəhəri - Xətai', type: 'seher', parent: 'Bakı' },
  { id: 'dist-baki-nizami', name: 'Bakı şəhəri - Nizami', type: 'seher', parent: 'Bakı' },
  { id: 'dist-baki-sabuncu', name: 'Bakı şəhəri - Sabunçu', type: 'seher', parent: 'Bakı' },
  { id: 'dist-baki-suraxani', name: 'Bakı şəhəri - Suraxanı', type: 'seher', parent: 'Bakı' },
  { id: 'dist-baki-xezer', name: 'Bakı şəhəri - Xəzər', type: 'seher', parent: 'Bakı' },
  { id: 'dist-baki-bineqedi', name: 'Bakı şəhəri - Binəqədi', type: 'seher', parent: 'Bakı' },
  { id: 'dist-baki-qaradag', name: 'Bakı şəhəri - Qaradağ', type: 'seher', parent: 'Bakı' },
  { id: 'dist-baki-pirallahi', name: 'Bakı şəhəri - Pirallahı', type: 'seher', parent: 'Bakı' },

  // 2. Abşeron-Xızı
  { id: 'dist-sumqayit', name: 'Sumqayıt şəhəri', type: 'seher', parent: 'Abşeron-Xızı' },
  { id: 'dist-abseron', name: 'Abşeron rayonu', type: 'rayon', parent: 'Abşeron-Xızı' },
  { id: 'dist-xizi', name: 'Xızı rayonu', type: 'rayon', parent: 'Abşeron-Xızı' },

  // 3. Gəncə-Daşkəsən
  { id: 'dist-gence', name: 'Gəncə şəhəri', type: 'seher', parent: 'Gəncə-Daşkəsən' },
  { id: 'dist-naftalan', name: 'Naftalan şəhəri', type: 'seher', parent: 'Gəncə-Daşkəsən' },
  { id: 'dist-daskesen', name: 'Daşkəsən rayonu', type: 'rayon', parent: 'Gəncə-Daşkəsən' },
  { id: 'dist-goranboy', name: 'Goranboy rayonu', type: 'rayon', parent: 'Gəncə-Daşkəsən' },
  { id: 'dist-goygol', name: 'Göygöl rayonu', type: 'rayon', parent: 'Gəncə-Daşkəsən' },
  { id: 'dist-samux', name: 'Samux rayonu', type: 'rayon', parent: 'Gəncə-Daşkəsən' },

  // 4. Qazax-Tovuz
  { id: 'dist-agstafa', name: 'Ağstafa rayonu', type: 'rayon', parent: 'Qazax-Tovuz' },
  { id: 'dist-qazax', name: 'Qazax rayonu', type: 'rayon', parent: 'Qazax-Tovuz' },
  { id: 'dist-tovuz', name: 'Tovuz rayonu', type: 'rayon', parent: 'Qazax-Tovuz' },
  { id: 'dist-semkir', name: 'Şəmkir rayonu', type: 'rayon', parent: 'Qazax-Tovuz' },
  { id: 'dist-gedebey', name: 'Gədəbəy rayonu', type: 'rayon', parent: 'Qazax-Tovuz' },

  // 5. Şəki-Zaqatala
  { id: 'dist-seki', name: 'Şəki şəhəri', type: 'seher', parent: 'Şəki-Zaqatala' },
  { id: 'dist-balaken', name: 'Balakən rayonu', type: 'rayon', parent: 'Şəki-Zaqatala' },
  { id: 'dist-qax', name: 'Qax rayonu', type: 'rayon', parent: 'Şəki-Zaqatala' },
  { id: 'dist-qebele', name: 'Qəbələ rayonu', type: 'rayon', parent: 'Şəki-Zaqatala' },
  { id: 'dist-oguz', name: 'Oğuz rayonu', type: 'rayon', parent: 'Şəki-Zaqatala' },
  { id: 'dist-zaqatala', name: 'Zaqatala rayonu', type: 'rayon', parent: 'Şəki-Zaqatala' },

  // 6. Quba-Xaçmaz
  { id: 'dist-quba', name: 'Quba rayonu', type: 'rayon', parent: 'Quba-Xaçmaz' },
  { id: 'dist-qusar', name: 'Qusar rayonu', type: 'rayon', parent: 'Quba-Xaçmaz' },
  { id: 'dist-xacmaz', name: 'Xaçmaz rayonu', type: 'rayon', parent: 'Quba-Xaçmaz' },
  { id: 'dist-sabran', name: 'Şabran rayonu', type: 'rayon', parent: 'Quba-Xaçmaz' },
  { id: 'dist-siyezen', name: 'Siyəzən rayonu', type: 'rayon', parent: 'Quba-Xaçmaz' },

  // 7. Lənkəran-Astara
  { id: 'dist-lenkeran', name: 'Lənkəran rayonu', type: 'rayon', parent: 'Lənkəran-Astara' },
  { id: 'dist-astara', name: 'Astara rayonu', type: 'rayon', parent: 'Lənkəran-Astara' },
  { id: 'dist-masalli', name: 'Masallı rayonu', type: 'rayon', parent: 'Lənkəran-Astara' },
  { id: 'dist-celilabad', name: 'Cəlilabad rayonu', type: 'rayon', parent: 'Lənkəran-Astara' },
  { id: 'dist-lerik', name: 'Lerik rayonu', type: 'rayon', parent: 'Lənkəran-Astara' },
  { id: 'dist-yardimli', name: 'Yardımlı rayonu', type: 'rayon', parent: 'Lənkəran-Astara' },

  // 8. Mərkəzi Aran
  { id: 'dist-mingecevir', name: 'Mingəçevir şəhəri', type: 'seher', parent: 'Mərkəzi Aran' },
  { id: 'dist-yevlax', name: 'Yevlax şəhəri', type: 'seher', parent: 'Mərkəzi Aran' },
  { id: 'dist-agdas', name: 'Ağdaş rayonu', type: 'rayon', parent: 'Mərkəzi Aran' },
  { id: 'dist-goycay', name: 'Göyçay rayonu', type: 'rayon', parent: 'Mərkəzi Aran' },
  { id: 'dist-kurdemir', name: 'Kürdəmir rayonu', type: 'rayon', parent: 'Mərkəzi Aran' },
  { id: 'dist-ucar', name: 'Ucar rayonu', type: 'rayon', parent: 'Mərkəzi Aran' },
  { id: 'dist-zerdab', name: 'Zərdab rayonu', type: 'rayon', parent: 'Mərkəzi Aran' },

  // 9. Şirvan-Salyan
  { id: 'dist-sirvan', name: 'Şirvan şəhəri', type: 'seher', parent: 'Şirvan-Salyan' },
  { id: 'dist-bilesuvar', name: 'Biləsuvar rayonu', type: 'rayon', parent: 'Şirvan-Salyan' },
  { id: 'dist-haciqabul', name: 'Hacıqabul rayonu', type: 'rayon', parent: 'Şirvan-Salyan' },
  { id: 'dist-neftcala', name: 'Neftçala rayonu', type: 'rayon', parent: 'Şirvan-Salyan' },
  { id: 'dist-salyan', name: 'Salyan rayonu', type: 'rayon', parent: 'Şirvan-Salyan' },

  // 10. Mil-Muğan
  { id: 'dist-beyleqan', name: 'Beyləqan rayonu', type: 'rayon', parent: 'Mil-Muğan' },
  { id: 'dist-imisli', name: 'İmişli rayonu', type: 'rayon', parent: 'Mil-Muğan' },
  { id: 'dist-saatli', name: 'Saatlı rayonu', type: 'rayon', parent: 'Mil-Muğan' },
  { id: 'dist-sabirabad', name: 'Sabirabad rayonu', type: 'rayon', parent: 'Mil-Muğan' },

  // 11. Dağlıq Şirvan
  { id: 'dist-agsu', name: 'Ağsu rayonu', type: 'rayon', parent: 'Dağlıq Şirvan' },
  { id: 'dist-ismayilli', name: 'İsmayıllı rayonu', type: 'rayon', parent: 'Dağlıq Şirvan' },
  { id: 'dist-qobustan', name: 'Qobustan rayonu', type: 'rayon', parent: 'Dağlıq Şirvan' },
  { id: 'dist-samaxi', name: 'Şamaxı rayonu', type: 'rayon', parent: 'Dağlıq Şirvan' },

  // 12. Qarabağ
  { id: 'dist-xankendi', name: 'Xankəndi şəhəri', type: 'seher', parent: 'Qarabağ' },
  { id: 'dist-agcabedi', name: 'Ağcabədi rayonu', type: 'rayon', parent: 'Qarabağ' },
  { id: 'dist-agdam', name: 'Ağdam rayonu', type: 'rayon', parent: 'Qarabağ' },
  { id: 'dist-berde', name: 'Bərdə rayonu', type: 'rayon', parent: 'Qarabağ' },
  { id: 'dist-fuzuli', name: 'Füzuli rayonu', type: 'rayon', parent: 'Qarabağ' },
  { id: 'dist-xocali', name: 'Xocalı rayonu', type: 'rayon', parent: 'Qarabağ' },
  { id: 'dist-xocavend', name: 'Xocavənd rayonu', type: 'rayon', parent: 'Qarabağ' },
  { id: 'dist-susa', name: 'Şuşa rayonu', type: 'rayon', parent: 'Qarabağ' },
  { id: 'dist-terter', name: 'Tərtər rayonu', type: 'rayon', parent: 'Qarabağ' },

  // 13. Şərqi Zəngəzur
  { id: 'dist-cebrayil', name: 'Cəbrayıl rayonu', type: 'rayon', parent: 'Şərqi Zəngəzur' },
  { id: 'dist-kelbecer', name: 'Kəlbəcər rayonu', type: 'rayon', parent: 'Şərqi Zəngəzur' },
  { id: 'dist-qubadli', name: 'Qubadlı rayonu', type: 'rayon', parent: 'Şərqi Zəngəzur' },
  { id: 'dist-lacin', name: 'Laçın rayonu', type: 'rayon', parent: 'Şərqi Zəngəzur' },
  { id: 'dist-zengilan', name: 'Zəngilan rayonu', type: 'rayon', parent: 'Şərqi Zəngəzur' },

  // 14. Naxçıvan Muxtar Respublikası
  { id: 'dist-naxcivan', name: 'Naxçıvan şəhəri', type: 'seher', parent: 'Naxçıvan MR' },
  { id: 'dist-babek', name: 'Babək rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
  { id: 'dist-serur', name: 'Şərur rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
  { id: 'dist-ordubad', name: 'Ordubad rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
  { id: 'dist-culfa', name: 'Culfa rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
  { id: 'dist-kengerli', name: 'Kəngərli rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
  { id: 'dist-sahbuz', name: 'Şahbuz rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
  { id: 'dist-sederek', name: 'Sədərək rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
];

export const INITIAL_AZERBAIJAN_SCHOOLS = [
  // ==========================================
  // BABƏK RAYONU VƏ ƏTRAFI (Cəhri, Şıxmahmud, Nehrəm və s.)
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
  // ŞƏRUR RAYONU
  // ==========================================
  { id: 'sch-ser-mahmud', name: 'Mahmudkənd tam orta məktəbi', district: 'Şərur rayonu', settlement: 'Mahmudkənd', utis_code: '7003010', type: 'tam_orta' },
  { id: 'sch-ser-yengice', name: 'Yengicə kənd tam orta məktəbi', district: 'Şərur rayonu', settlement: 'Yengicə kəndi', utis_code: '7003011', type: 'tam_orta' },
  { id: 'sch-ser-cercibogan', name: 'Çərçiboğan kənd tam orta məktəbi', district: 'Şərur rayonu', settlement: 'Çərçiboğan kəndi', utis_code: '7003012', type: 'tam_orta' },
  { id: 'sch-ser-demirci', name: 'Dəmirçi kənd tam orta məktəbi', district: 'Şərur rayonu', settlement: 'Dəmirçi kəndi', utis_code: '7003013', type: 'tam_orta' },
  { id: 'sch-ser-01', name: 'Şərur şəhər 1 nömrəli tam orta məktəb', district: 'Şərur rayonu', settlement: 'Şərur şəhəri', utis_code: '7003001', type: 'tam_orta' },

  // ==========================================
  // NAXÇIVAN ŞƏHƏRİ
  // ==========================================
  { id: 'sch-nax-01', name: '1 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', settlement: 'Naxçıvan mərkəz', utis_code: '7001001', type: 'tam_orta' },
  { id: 'sch-nax-02', name: '2 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', settlement: 'Naxçıvan mərkəz', utis_code: '7001002', type: 'tam_orta' },
  { id: 'sch-nax-03', name: '3 nömrəli rus təmayüllü tam orta məktəb', district: 'Naxçıvan şəhəri', settlement: 'Naxçıvan mərkəz', utis_code: '7001003', type: 'tam_orta' },
  { id: 'sch-nax-hl', name: 'Heydər Əliyev adına Hərbi Lisey', district: 'Naxçıvan şəhəri', settlement: 'Naxçıvan mərkəz', utis_code: '7001020', type: 'lisey' },
  { id: 'sch-nax-ql', name: 'Naxçıvan Qızlar Liseyi', district: 'Naxçıvan şəhəri', settlement: 'Naxçıvan mərkəz', utis_code: '7001021', type: 'lisey' },
  { id: 'sch-nax-aliabad', name: 'Əliabad qəsəbə tam orta məktəbi', district: 'Naxçıvan şəhəri', settlement: 'Əliabad qəsəbəsi', utis_code: '7001024', type: 'tam_orta' },

  // ==========================================
  // ORDUBAD RAYONU
  // ==========================================
  { id: 'sch-ord-01', name: 'M.F.Axundov adına 1 nömrəli tam orta məktəb', district: 'Ordubad rayonu', settlement: 'Ordubad şəhəri', utis_code: '7004001', type: 'tam_orta' },
  { id: 'sch-ord-venend', name: 'Vənənd kənd tam orta məktəbi', district: 'Ordubad rayonu', settlement: 'Vənənd kəndi', utis_code: '7004005', type: 'tam_orta' },
  { id: 'sch-ord-deste', name: 'Dəstə kənd tam orta məktəbi', district: 'Ordubad rayonu', settlement: 'Dəstə kəndi', utis_code: '7004006', type: 'tam_orta' },

  // ==========================================
  // CULFA, KƏNGƏRLİ, ŞAHBUZ, SƏDƏRƏK
  // ==========================================
  { id: 'sch-cul-01', name: 'Culfa şəhər 1 nömrəli tam orta məktəb', district: 'Culfa rayonu', settlement: 'Culfa şəhəri', utis_code: '7005001', type: 'tam_orta' },
  { id: 'sch-keng-qivraq', name: 'Qıvraq qəsəbə tam orta məktəbi', district: 'Kəngərli rayonu', settlement: 'Qıvraq qəsəbəsi', utis_code: '7006001', type: 'tam_orta' },
  { id: 'sch-sah-01', name: 'Şahbuz şəhər 1 nömrəli tam orta məktəb', district: 'Şahbuz rayonu', settlement: 'Şahbuz şəhəri', utis_code: '7007001', type: 'tam_orta' },
  { id: 'sch-sed-heydar', name: 'Heydərabad qəsəbə tam orta məktəbi', district: 'Sədərək rayonu', settlement: 'Heydərabad qəsəbəsi', utis_code: '7008001', type: 'tam_orta' },

  // ==========================================
  // BAKI ŞƏHƏRİ MƏKTƏBLƏRİ
  // ==========================================
  { id: 'sch-baki-287', name: 'Bakı şəhəri 287 nömrəli Zəkalar liseyi', district: 'Bakı şəhəri - Yasamal', settlement: 'Yasamal qəsəbəsi', utis_code: '1001287', type: 'lisey' },
  { id: 'sch-baki-006', name: '6 nömrəli məktəb-lisey', district: 'Bakı şəhəri - Səbail', settlement: 'Səbail mərkəz', utis_code: '1001006', type: 'lisey' },
  { id: 'sch-baki-132', name: '132-134 nömrəli Təhsil Kompleksi', district: 'Bakı şəhəri - Səbail', settlement: 'İçərişəhər', utis_code: '1001132', type: 'tam_orta' },
  { id: 'sch-baki-160', name: '160 nömrəli Klassik Gimnaziya', district: 'Bakı şəhəri - Səbail', settlement: 'Səbail mərkəz', utis_code: '1001160', type: 'gimnaziya' },
  { id: 'sch-baki-023', name: 'Tahir Həsənov adına 23 nömrəli tam orta məktəb', district: 'Bakı şəhəri - Nəsimi', settlement: 'Nəsimi mərkəz', utis_code: '1001023', type: 'tam_orta' },
  { id: 'sch-baki-eur', name: 'Bakı Avropa Liseyi', district: 'Bakı şəhəri - Yasamal', settlement: 'Yasamal mərkəz', utis_code: '1001999', type: 'lisey' },
  { id: 'sch-baki-zarifa', name: 'Akademik Zərifə Əliyeva adına Lisey', district: 'Bakı şəhəri - Yasamal', settlement: 'Yasamal mərkəz', utis_code: '1001888', type: 'lisey' },
  { id: 'sch-baki-frit', name: 'Fizika, riyaziyyat və informatika təmayüllü lisey (FRİTL)', district: 'Bakı şəhəri - Yasamal', settlement: 'Yasamal mərkəz', utis_code: '1001777', type: 'lisey' },
  { id: 'sch-baki-kbtl', name: 'Kimya-biologiya təmayüllü lisey (KBTL)', district: 'Bakı şəhəri - Nərimanov', settlement: 'Nərimanov mərkəz', utis_code: '1001666', type: 'lisey' },
  { id: 'sch-baki-082', name: '82 nömrəli tam orta məktəb', district: 'Bakı şəhəri - Nərimanov', settlement: 'Nərimanov mərkəz', utis_code: '1001082', type: 'tam_orta' },
  { id: 'sch-baki-095', name: '95 nömrəli tam orta məktəb', district: 'Bakı şəhəri - Xətai', settlement: 'Əhmədli qəsəbəsi', utis_code: '1001095', type: 'tam_orta' },
  { id: 'sch-baki-264', name: '264 nömrəli məktəb-lisey', district: 'Bakı şəhəri - Xətai', settlement: 'Xətai mərkəz', utis_code: '1001264', type: 'lisey' },
  { id: 'sch-baki-276', name: '276 nömrəli tam orta məktəb', district: 'Bakı şəhəri - Binəqədi', settlement: 'Biləcəri qəsəbəsi', utis_code: '1001276', type: 'tam_orta' },
  { id: 'sch-baki-115', name: '115 nömrəli tam orta məktəb', district: 'Bakı şəhəri - Binəqədi', settlement: 'Binəqədi qəsəbəsi', utis_code: '1001115', type: 'tam_orta' },
  { id: 'sch-baki-107', name: '107 nömrəli tam orta məktəb', district: 'Bakı şəhəri - Sabunçu', settlement: 'Bakıxanov qəsəbəsi', utis_code: '1001107', type: 'tam_orta' },
  { id: 'sch-baki-074', name: '74 nömrəli tam orta məktəb', district: 'Bakı şəhəri - Sabunçu', settlement: 'Sabunçu qəsəbəsi', utis_code: '1001074', type: 'tam_orta' },

  // ==========================================
  // SUMQAYIT ŞƏHƏRİ MƏKTƏBLƏRİ
  // ==========================================
  { id: 'sch-sum-teg', name: 'Sumqayıt Təbiət elmləri təmayüllü gimnaziya', district: 'Sumqayıt şəhəri', settlement: 'Sumqayıt mərkəz', utis_code: '2001000', type: 'gimnaziya' },
  { id: 'sch-sum-ist', name: 'Sumqayıt şəhər İstedad liseyi', district: 'Sumqayıt şəhəri', settlement: 'Sumqayıt mərkəz', utis_code: '2001001', type: 'lisey' },
  { id: 'sch-sum-001', name: 'Sumqayıt şəhər 1 nömrəli tam orta məktəb', district: 'Sumqayıt şəhəri', settlement: '1-ci mikrorayon', utis_code: '2001002', type: 'tam_orta' },
  { id: 'sch-sum-011', name: 'Sumqayıt şəhər 11 nömrəli tam orta məktəb', district: 'Sumqayıt şəhəri', settlement: '3-cü mikrorayon', utis_code: '2001011', type: 'tam_orta' },
  { id: 'sch-sum-022', name: 'Sumqayıt şəhər 22 nömrəli tam orta məktəb', district: 'Sumqayıt şəhəri', settlement: '8-ci mikrorayon', utis_code: '2001022', type: 'tam_orta' },

  // ==========================================
  // GƏNCƏ ŞƏHƏRİ MƏKTƏBLƏRİ
  // ==========================================
  { id: 'sch-gen-frl', name: 'Gəncə şəhər Fizika, riyaziyyat və informatika təmayüllü lisey', district: 'Gəncə şəhəri', settlement: 'Gəncə mərkəz', utis_code: '3001000', type: 'lisey' },
  { id: 'sch-gen-004', name: 'Gəncə şəhər 4 nömrəli tam orta məktəb', district: 'Gəncə şəhəri', settlement: 'Gəncə mərkəz', utis_code: '3001004', type: 'tam_orta' },
  { id: 'sch-gen-016', name: 'Mirzə Şəfi Vazeh adına 16 nömrəli tam orta məktəb', district: 'Gəncə şəhəri', settlement: 'Gəncə mərkəz', utis_code: '3001016', type: 'tam_orta' },
  { id: 'sch-gen-026', name: 'Gəncə şəhər 26 nömrəli məktəb-lisey', district: 'Gəncə şəhəri', settlement: 'Gəncə mərkəz', utis_code: '3001026', type: 'lisey' },

  // ==========================================
  // ABŞERON RAYONU MƏKTƏBLƏRİ
  // ==========================================
  { id: 'sch-abs-xirdalan-1', name: 'Xırdalan şəhər 1 nömrəli tam orta məktəb', district: 'Abşeron rayonu', settlement: 'Xırdalan şəhəri', utis_code: '4001001', type: 'tam_orta' },
  { id: 'sch-abs-xirdalan-2', name: 'Xırdalan şəhər 2 nömrəli tam orta məktəb', district: 'Abşeron rayonu', settlement: 'Xırdalan şəhəri', utis_code: '4001002', type: 'tam_orta' },
  { id: 'sch-abs-saray-1', name: 'Saray qəsəbə 1 nömrəli tam orta məktəb', district: 'Abşeron rayonu', settlement: 'Saray qəsəbəsi', utis_code: '4001010', type: 'tam_orta' },
  { id: 'sch-abs-masazir-1', name: 'Masazır kənd 1 nömrəli tam orta məktəb', district: 'Abşeron rayonu', settlement: 'Masazır kəndi', utis_code: '4001020', type: 'tam_orta' },
  { id: 'sch-abs-mehdiabad-1', name: 'Mehdiabad qəsəbə 1 nömrəli tam orta məktəb', district: 'Abşeron rayonu', settlement: 'Mehdiabad qəsəbəsi', utis_code: '4001030', type: 'tam_orta' },

  // ==========================================
  // QARABAĞ VƏ ŞƏRQİ ZƏNGƏZUR MƏKTƏBLƏRİ
  // ==========================================
  { id: 'sch-susa-01', name: 'Şuşa şəhər 1 nömrəli tam orta məktəb', district: 'Şuşa rayonu', settlement: 'Şuşa şəhəri', utis_code: '8001001', type: 'tam_orta' },
  { id: 'sch-fuzuli-uluqbey', name: 'Mirzə Uluqbəy adına 1 nömrəli tam orta məktəb', district: 'Füzuli rayonu', settlement: 'Füzuli şəhəri', utis_code: '8002001', type: 'tam_orta' },
  { id: 'sch-zengilan-agali', name: 'Ağalı kənd tam orta məktəbi', district: 'Zəngilan rayonu', settlement: 'Ağalı kəndi', utis_code: '8003001', type: 'tam_orta' },
  { id: 'sch-lacin-02', name: 'Laçın şəhər 2 nömrəli tam orta məktəb', district: 'Laçın rayonu', settlement: 'Laçın şəhəri', utis_code: '8004002', type: 'tam_orta' },
  { id: 'sch-agdam-01', name: 'Ağdam şəhər 1 nömrəli tam orta məktəb', district: 'Ağdam rayonu', settlement: 'Ağdam şəhəri', utis_code: '8005001', type: 'tam_orta' },
  { id: 'sch-berde-01', name: 'Bərdə şəhər 1 nömrəli tam orta məktəb', district: 'Bərdə rayonu', settlement: 'Bərdə şəhəri', utis_code: '8006001', type: 'tam_orta' },

  // ==========================================
  // ŞƏKİ, QUBA, LƏNKƏRAN, ŞAMAXI, MİNGƏÇEVİR
  // ==========================================
  { id: 'sch-seki-01', name: 'Şəki şəhər 1 nömrəli tam orta məktəb', district: 'Şəki şəhəri', settlement: 'Şəki mərkəz', utis_code: '5001001', type: 'tam_orta' },
  { id: 'sch-quba-01', name: 'Quba şəhər 1 nömrəli tam orta məktəb', district: 'Quba rayonu', settlement: 'Quba mərkəz', utis_code: '5002001', type: 'tam_orta' },
  { id: 'sch-xacmaz-01', name: 'Xaçmaz şəhər 1 nömrəli tam orta məktəb', district: 'Xaçmaz rayonu', settlement: 'Xaçmaz mərkəz', utis_code: '5003001', type: 'tam_orta' },
  { id: 'sch-lenkeran-01', name: 'Lənkəran şəhər 1 nömrəli tam orta məktəb', district: 'Lənkəran rayonu', settlement: 'Lənkəran mərkəz', utis_code: '6001001', type: 'tam_orta' },
  { id: 'sch-samaxi-01', name: 'Şamaxı şəhər 1 nömrəli tam orta məktəb', district: 'Şamaxı rayonu', settlement: 'Şamaxı mərkəz', utis_code: '6002001', type: 'tam_orta' },
  { id: 'sch-mingecevir-01', name: 'Mingəçevir şəhər 1 nömrəli tam orta məktəb', district: 'Mingəçevir şəhəri', settlement: 'Mingəçevir mərkəz', utis_code: '6003001', type: 'tam_orta' },
  { id: 'sch-sirvan-01', name: 'Şirvan şəhər 1 nömrəli tam orta məktəb', district: 'Şirvan şəhəri', settlement: 'Şirvan mərkəz', utis_code: '6004001', type: 'tam_orta' },
];
