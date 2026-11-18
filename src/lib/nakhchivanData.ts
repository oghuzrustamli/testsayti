// src/lib/nakhchivanData.ts
// Naxçıvan Muxtar Respublikası Regional Təhsil Məlumat Bazası və Sabitləri

export interface DistrictInfo {
  id: string;
  name: string;
  shortName: string;
  center: string;
}

export interface SchoolRecordItem {
  id: string;
  name: string;
  district: string;
  utis_code: string;
  type: 'tam_orta' | 'lisey' | 'esas_orta';
  status: 'active' | 'inactive';
}

export const NAKHCHIVAN_DISTRICTS: DistrictInfo[] = [
  { id: 'naxcivan_seher', name: 'Naxçıvan şəhəri', shortName: 'Naxçıvan ş.', center: 'Naxçıvan şəhəri' },
  { id: 'babek', name: 'Babək rayonu', shortName: 'Babək ray.', center: 'Babək şəhəri' },
  { id: 'serur', name: 'Şərur rayonu', shortName: 'Şərur ray.', center: 'Şərur şəhəri' },
  { id: 'ordubad', name: 'Ordubad rayonu', shortName: 'Ordubad ray.', center: 'Ordubad şəhəri' },
  { id: 'culfa', name: 'Culfa rayonu', shortName: 'Culfa ray.', center: 'Culfa şəhəri' },
  { id: 'kengerli', name: 'Kəngərli rayonu', shortName: 'Kəngərli ray.', center: 'Qıvraq qəsəbəsi' },
  { id: 'sahbuz', name: 'Şahbuz rayonu', shortName: 'Şahbuz ray.', center: 'Şahbuz şəhəri' },
  { id: 'sederek', name: 'Sədərək rayonu', shortName: 'Sədərək ray.', center: 'Heydərabad qəsəbəsi' },
];

export const MONITORING_GRADES = ['IV sinif', 'VI sinif', 'IX sinif', 'XI sinif'] as const;
export type MonitoringGrade = typeof MONITORING_GRADES[number];

export const MONITORING_SUBJECTS = [
  'Azərbaycan dili',
  'Riyaziyyat',
  'Xarici dil',
  'Təbiət / Həyat bilgisi',
  'Tarix',
  'Fizika',
  'Kimya',
  'Biologiya',
  'Coğrafiya'
] as const;
export type MonitoringSubject = typeof MONITORING_SUBJECTS[number];

export const MONITORING_PERIODS = [
  { id: 'mon_1', title: 'I Monitorinq', date: 'Oktyabr 2025' },
  { id: 'mon_2', title: 'II Monitorinq', date: 'Yanvar 2026' },
  { id: 'mon_3', title: 'III Monitorinq', date: 'Aprel 2026' },
] as const;

// Naxçıvan MR-in bütün 8 rayon və şəhəri üzrə rəsmi ümumtəhsil məktəblərinin vahid elektron siyahısı
export const OFFICIAL_NAKHCHIVAN_SCHOOLS: SchoolRecordItem[] = [
  // ==========================================
  // 1. NAXÇIVAN ŞƏHƏRİ
  // ==========================================
  { id: 'sch-nax-01', name: '1 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', utis_code: '7001001', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-02', name: '2 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', utis_code: '7001002', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-03', name: '3 nömrəli rus təmayüllü tam orta məktəb', district: 'Naxçıvan şəhəri', utis_code: '7001003', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-04', name: '4 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', utis_code: '7001004', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-05', name: '5 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', utis_code: '7001005', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-06', name: '6 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', utis_code: '7001006', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-07', name: '7 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', utis_code: '7001007', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-08', name: '8 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', utis_code: '7001008', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-09', name: '9 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', utis_code: '7001009', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-10', name: '10 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', utis_code: '7001010', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-11', name: '11 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', utis_code: '7001011', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-12', name: '12 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', utis_code: '7001012', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-14', name: '14 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', utis_code: '7001014', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-15', name: '15 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', utis_code: '7001015', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-16', name: '16 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', utis_code: '7001016', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-17', name: '17 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', utis_code: '7001017', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-hl', name: 'Heydər Əliyev adına Hərbi Lisey', district: 'Naxçıvan şəhəri', utis_code: '7001020', type: 'lisey', status: 'active' },
  { id: 'sch-nax-ql', name: 'Naxçıvan Qızlar Liseyi', district: 'Naxçıvan şəhəri', utis_code: '7001021', type: 'lisey', status: 'active' },
  { id: 'sch-nax-kbl', name: 'Naxçıvan şəhər Kimya-Biologiya Təmayüllü Lisey', district: 'Naxçıvan şəhəri', utis_code: '7001022', type: 'lisey', status: 'active' },
  { id: 'sch-nax-garn', name: 'Naxçıvan Qarnizonu Tam Orta Məktəbi', district: 'Naxçıvan şəhəri', utis_code: '7001023', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-aliabad', name: 'Əliabad qəsəbə tam orta məktəbi', district: 'Naxçıvan şəhəri', utis_code: '7001024', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-qaracuq', name: 'Qaraçuq kənd tam orta məktəbi', district: 'Naxçıvan şəhəri', utis_code: '7001025', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-qaraxan', name: 'Qaraxanbəyli kənd tam orta məktəbi', district: 'Naxçıvan şəhəri', utis_code: '7001026', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-bulqan', name: 'Bulqan kənd tam orta məktəbi', district: 'Naxçıvan şəhəri', utis_code: '7001027', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-tumbul', name: 'Tumbul kənd tam orta məktəbi', district: 'Naxçıvan şəhəri', utis_code: '7001028', type: 'tam_orta', status: 'active' },
  { id: 'sch-nax-haciniyyet', name: 'Hacıniyyət kənd tam orta məktəbi', district: 'Naxçıvan şəhəri', utis_code: '7001029', type: 'tam_orta', status: 'active' },

  // ==========================================
  // 2. BABƏK RAYONU
  // ==========================================
  { id: 'sch-bab-01', name: 'Babək şəhər 1 nömrəli tam orta məktəb', district: 'Babək rayonu', utis_code: '7002001', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-02', name: 'Babək şəhər 2 nömrəli tam orta məktəb', district: 'Babək rayonu', utis_code: '7002002', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-nehrem-1', name: 'Nehrəm qəsəbə 1 nömrəli tam orta məktəb', district: 'Babək rayonu', utis_code: '7002003', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-nehrem-2', name: 'Nehrəm qəsəbə 2 nömrəli tam orta məktəb', district: 'Babək rayonu', utis_code: '7002004', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-nehrem-3', name: 'Nehrəm qəsəbə 3 nömrəli tam orta məktəb', district: 'Babək rayonu', utis_code: '7002005', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-cehri-1', name: 'Cəhri qəsəbə 1 nömrəli tam orta məktəb', district: 'Babək rayonu', utis_code: '7002006', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-cehri-2', name: 'Q.Sadiqov adına Cəhri qəsəbə 2 №-li tam orta məktəb', district: 'Babək rayonu', utis_code: '7002007', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-sirab', name: 'Sirab kənd tam orta məktəbi', district: 'Babək rayonu', utis_code: '7002008', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-sixmahmud', name: 'Şıxmahmud kənd tam orta məktəbi', district: 'Babək rayonu', utis_code: '7002009', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-zeyneddin', name: 'Zeynəddin kənd tam orta məktəbi', district: 'Babək rayonu', utis_code: '7002010', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-qahab', name: 'Qahab kənd tam orta məktəbi', district: 'Babək rayonu', utis_code: '7002011', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-naxisnergiz', name: 'Naxışnərgiz kənd tam orta məktəbi', district: 'Babək rayonu', utis_code: '7002012', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-kultepe', name: 'Kültəpə kənd tam orta məktəbi', district: 'Babək rayonu', utis_code: '7002013', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-cesmebasar', name: 'Çeşməbasar kənd tam orta məktəbi', district: 'Babək rayonu', utis_code: '7002014', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-vayxir', name: 'Vayxır kənd tam orta məktəbi', district: 'Babək rayonu', utis_code: '7002015', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-yarimca', name: 'Yarımca kənd tam orta məktəbi', district: 'Babək rayonu', utis_code: '7002016', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-didivar', name: 'Didivar kənd tam orta məktəbi', district: 'Babək rayonu', utis_code: '7002017', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-kerimbeyli', name: 'Kərimbəyli kənd tam orta məktəbi', district: 'Babək rayonu', utis_code: '7002018', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-qaraqala', name: 'Qaraqala kənd tam orta məktəbi', district: 'Babək rayonu', utis_code: '7002019', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-xelilli', name: 'Xəlilli kənd tam orta məktəbi', district: 'Babək rayonu', utis_code: '7002020', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-mezre', name: 'Məzrə kənd tam orta məktəbi', district: 'Babək rayonu', utis_code: '7002021', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-sekerabad', name: 'Şəkərabad kənd tam orta məktəbi', district: 'Babək rayonu', utis_code: '7002022', type: 'tam_orta', status: 'active' },
  { id: 'sch-bab-payiz', name: 'Payız kənd tam orta məktəbi', district: 'Babək rayonu', utis_code: '7002023', type: 'tam_orta', status: 'active' },

  // ==========================================
  // 3. ŞƏRUR RAYONU
  // ==========================================
  { id: 'sch-sar-01', name: 'Şərur şəhər 1 nömrəli tam orta məktəb', district: 'Şərur rayonu', utis_code: '7003001', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-02', name: 'Şərur şəhər 2 nömrəli tam orta məktəb', district: 'Şərur rayonu', utis_code: '7003002', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-tl', name: 'Şərur Türk Liseyi', district: 'Şərur rayonu', utis_code: '7003003', type: 'lisey', status: 'active' },
  { id: 'sch-sar-dudenge', name: 'Düdəngə kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003004', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-cercibogan', name: 'Çərçiboğan kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003005', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-yengice', name: 'Yengicə kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003006', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-mahmudkend', name: 'Mahmudkənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003007', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-danyeri', name: 'Danyeri kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003008', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-muganli', name: 'Muğanlı kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003009', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-xanliqlar', name: 'Xanlıqlar kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003010', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-ibadulla', name: 'İbadulla kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003011', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-arpacay', name: 'Arpaçay kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003012', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-dervisler', name: 'Dərvişlər kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003013', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-siyaqut', name: 'Siyaqut kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003014', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-qorculu', name: 'Qorçulu kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003015', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-arbatan', name: 'Arbatan kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003016', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-pusyan', name: 'Püsyan kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003017', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-axura', name: 'Axura kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003018', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-hemzeli', name: 'Həmzəli kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003019', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-tenenem', name: 'Tənənəm kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003020', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-sahbulaq', name: 'Şahbulaq kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003021', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-oglanqala', name: 'Oğlanqala kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003022', type: 'tam_orta', status: 'active' },
  { id: 'sch-sar-comaxtur', name: 'Çomaxtur kənd tam orta məktəbi', district: 'Şərur rayonu', utis_code: '7003023', type: 'tam_orta', status: 'active' },

  // ==========================================
  // 4. ORDUBAD RAYONU
  // ==========================================
  { id: 'sch-ord-01', name: 'Ordubad şəhər 1 nömrəli tam orta məktəb', district: 'Ordubad rayonu', utis_code: '7004001', type: 'tam_orta', status: 'active' },
  { id: 'sch-ord-02', name: 'Ordubad şəhər 2 nömrəli tam orta məktəb', district: 'Ordubad rayonu', utis_code: '7004002', type: 'tam_orta', status: 'active' },
  { id: 'sch-ord-03', name: 'Ordubad şəhər 3 nömrəli tam orta məktəb', district: 'Ordubad rayonu', utis_code: '7004003', type: 'tam_orta', status: 'active' },
  { id: 'sch-ord-sidqi', name: 'M.T.Sidqi adına tam orta məktəb', district: 'Ordubad rayonu', utis_code: '7004004', type: 'tam_orta', status: 'active' },
  { id: 'sch-ord-venend-1', name: 'Vənənd kənd 1 nömrəli tam orta məktəb', district: 'Ordubad rayonu', utis_code: '7004005', type: 'tam_orta', status: 'active' },
  { id: 'sch-ord-venend-2', name: 'Vənənd kənd 2 nömrəli tam orta məktəb', district: 'Ordubad rayonu', utis_code: '7004006', type: 'tam_orta', status: 'active' },
  { id: 'sch-ord-deste', name: 'Dəstə kənd tam orta məktəbi', district: 'Ordubad rayonu', utis_code: '7004007', type: 'tam_orta', status: 'active' },
  { id: 'sch-ord-unus', name: 'Unus kənd tam orta məktəbi', district: 'Ordubad rayonu', utis_code: '7004008', type: 'tam_orta', status: 'active' },
  { id: 'sch-ord-genze', name: 'Gənzə kənd tam orta məktəbi', district: 'Ordubad rayonu', utis_code: '7004009', type: 'tam_orta', status: 'active' },
  { id: 'sch-ord-nusnus', name: 'Nüsnüs kənd tam orta məktəbi', district: 'Ordubad rayonu', utis_code: '7004010', type: 'tam_orta', status: 'active' },
  { id: 'sch-ord-eylis-yuxari', name: 'Yuxarı Əylis kənd tam orta məktəbi', district: 'Ordubad rayonu', utis_code: '7004011', type: 'tam_orta', status: 'active' },
  { id: 'sch-ord-eylis-asagi', name: 'Aşağı Əylis kənd tam orta məktəbi', district: 'Ordubad rayonu', utis_code: '7004012', type: 'tam_orta', status: 'active' },
  { id: 'sch-ord-duylun', name: 'Düylün kənd tam orta məktəbi', district: 'Ordubad rayonu', utis_code: '7004013', type: 'tam_orta', status: 'active' },
  { id: 'sch-ord-bilev', name: 'Biləv kənd tam orta məktəbi', district: 'Ordubad rayonu', utis_code: '7004014', type: 'tam_orta', status: 'active' },
  { id: 'sch-ord-cenneb', name: 'Çənnəb kənd tam orta məktəbi', district: 'Ordubad rayonu', utis_code: '7004015', type: 'tam_orta', status: 'active' },
  { id: 'sch-ord-tivi', name: 'Tivi kənd tam orta məktəbi', district: 'Ordubad rayonu', utis_code: '7004016', type: 'tam_orta', status: 'active' },
  { id: 'sch-ord-keleki', name: 'Kələki kənd tam orta məktəbi', district: 'Ordubad rayonu', utis_code: '7004017', type: 'tam_orta', status: 'active' },

  // ==========================================
  // 5. CULFA RAYONU
  // ==========================================
  { id: 'sch-cul-01', name: 'Culfa şəhər 1 nömrəli tam orta məktəb', district: 'Culfa rayonu', utis_code: '7005001', type: 'tam_orta', status: 'active' },
  { id: 'sch-cul-02', name: 'Culfa şəhər 2 nömrəli tam orta məktəb', district: 'Culfa rayonu', utis_code: '7005002', type: 'tam_orta', status: 'active' },
  { id: 'sch-cul-03', name: 'Culfa şəhər 3 nömrəli tam orta məktəb', district: 'Culfa rayonu', utis_code: '7005003', type: 'tam_orta', status: 'active' },
  { id: 'sch-cul-ebrequnus', name: 'Əbrəqunus kənd tam orta məktəbi', district: 'Culfa rayonu', utis_code: '7005004', type: 'tam_orta', status: 'active' },
  { id: 'sch-cul-yayci-1', name: 'Yaycı kənd 1 nömrəli tam orta məktəb', district: 'Culfa rayonu', utis_code: '7005005', type: 'tam_orta', status: 'active' },
  { id: 'sch-cul-yayci-2', name: 'Yaycı kənd 2 nömrəli tam orta məktəb', district: 'Culfa rayonu', utis_code: '7005006', type: 'tam_orta', status: 'active' },
  { id: 'sch-cul-beneniyar', name: 'Bənəniyar kənd tam orta məktəbi', district: 'Culfa rayonu', utis_code: '7005007', type: 'tam_orta', status: 'active' },
  { id: 'sch-cul-qazanci', name: 'Qazançı kənd tam orta məktəbi', district: 'Culfa rayonu', utis_code: '7005008', type: 'tam_orta', status: 'active' },
  { id: 'sch-cul-saltaq', name: 'Saltaq kənd tam orta məktəbi', district: 'Culfa rayonu', utis_code: '7005009', type: 'tam_orta', status: 'active' },
  { id: 'sch-cul-kirna', name: 'Kırna kənd tam orta məktəbi', district: 'Culfa rayonu', utis_code: '7005010', type: 'tam_orta', status: 'active' },
  { id: 'sch-cul-dize', name: 'Dizə kənd tam orta məktəbi', district: 'Culfa rayonu', utis_code: '7005011', type: 'tam_orta', status: 'active' },
  { id: 'sch-cul-erezin', name: 'Ərəzin kənd tam orta məktəbi', district: 'Culfa rayonu', utis_code: '7005012', type: 'tam_orta', status: 'active' },
  { id: 'sch-cul-camaldin', name: 'Camaldın kənd tam orta məktəbi', district: 'Culfa rayonu', utis_code: '7005013', type: 'tam_orta', status: 'active' },
  { id: 'sch-cul-milax', name: 'Milax kənd tam orta məktəbi', district: 'Culfa rayonu', utis_code: '7005014', type: 'tam_orta', status: 'active' },
  { id: 'sch-cul-elince', name: 'Əlincə kənd tam orta məktəbi', district: 'Culfa rayonu', utis_code: '7005015', type: 'tam_orta', status: 'active' },
  { id: 'sch-cul-xaneqah', name: 'Xanəgah kənd tam orta məktəbi', district: 'Culfa rayonu', utis_code: '7005016', type: 'tam_orta', status: 'active' },

  // ==========================================
  // 6. KƏNGƏRLİ RAYONU
  // ==========================================
  { id: 'sch-ken-qivraq', name: 'Qıvraq qəsəbə tam orta məktəbi', district: 'Kəngərli rayonu', utis_code: '7006001', type: 'tam_orta', status: 'active' },
  { id: 'sch-ken-sahtaxti', name: 'Şahtaxtı kənd tam orta məktəbi', district: 'Kəngərli rayonu', utis_code: '7006002', type: 'tam_orta', status: 'active' },
  { id: 'sch-ken-qarabaglar-1', name: 'Qarabağlar kənd 1 nömrəli tam orta məktəb', district: 'Kəngərli rayonu', utis_code: '7006003', type: 'tam_orta', status: 'active' },
  { id: 'sch-ken-qarabaglar-2', name: 'Qarabağlar kənd 2 nömrəli tam orta məktəb', district: 'Kəngərli rayonu', utis_code: '7006004', type: 'tam_orta', status: 'active' },
  { id: 'sch-ken-xok', name: 'Xok kənd tam orta məktəbi', district: 'Kəngərli rayonu', utis_code: '7006005', type: 'tam_orta', status: 'active' },
  { id: 'sch-ken-calxanqala', name: 'Çalxanqala kənd tam orta məktəbi', district: 'Kəngərli rayonu', utis_code: '7006006', type: 'tam_orta', status: 'active' },
  { id: 'sch-ken-yurdcu', name: 'Yurdçu kənd tam orta məktəbi', district: 'Kəngərli rayonu', utis_code: '7006007', type: 'tam_orta', status: 'active' },
  { id: 'sch-ken-boyukduz', name: 'Böyükdüz kənd tam orta məktəbi', district: 'Kəngərli rayonu', utis_code: '7006008', type: 'tam_orta', status: 'active' },
  { id: 'sch-ken-tezekend', name: 'Təzəkənd tam orta məktəbi', district: 'Kəngərli rayonu', utis_code: '7006009', type: 'tam_orta', status: 'active' },

  // ==========================================
  // 7. ŞAHBUZ RAYONU
  // ==========================================
  { id: 'sch-sah-01', name: 'Şahbuz şəhər 1 nömrəli tam orta məktəb', district: 'Şahbuz rayonu', utis_code: '7007001', type: 'tam_orta', status: 'active' },
  { id: 'sch-sah-02', name: 'Şahbuz şəhər 2 nömrəli tam orta məktəb', district: 'Şahbuz rayonu', utis_code: '7007002', type: 'tam_orta', status: 'active' },
  { id: 'sch-sah-kuku', name: 'Kükü kənd tam orta məktəbi', district: 'Şahbuz rayonu', utis_code: '7007003', type: 'tam_orta', status: 'active' },
  { id: 'sch-sah-badamli-qes', name: 'Badamlı qəsəbə tam orta məktəbi', district: 'Şahbuz rayonu', utis_code: '7007004', type: 'tam_orta', status: 'active' },
  { id: 'sch-sah-badamli-knd', name: 'Badamlı kənd tam orta məktəbi', district: 'Şahbuz rayonu', utis_code: '7007005', type: 'tam_orta', status: 'active' },
  { id: 'sch-sah-nursu', name: 'Nursu kənd tam orta məktəbi', district: 'Şahbuz rayonu', utis_code: '7007006', type: 'tam_orta', status: 'active' },
  { id: 'sch-sah-kolani', name: 'Kolani kənd tam orta məktəbi', district: 'Şahbuz rayonu', utis_code: '7007007', type: 'tam_orta', status: 'active' },
  { id: 'sch-sah-kecili', name: 'Keçili kənd tam orta məktəbi', district: 'Şahbuz rayonu', utis_code: '7007008', type: 'tam_orta', status: 'active' },
  { id: 'sch-sah-bicenek', name: 'Biçənək kənd tam orta məktəbi', district: 'Şahbuz rayonu', utis_code: '7007009', type: 'tam_orta', status: 'active' },
  { id: 'sch-sah-kulus', name: 'Külüs kənd tam orta məktəbi', district: 'Şahbuz rayonu', utis_code: '7007010', type: 'tam_orta', status: 'active' },
  { id: 'sch-sah-sahbuzkend', name: 'Şahbuzkənd tam orta məktəbi', district: 'Şahbuz rayonu', utis_code: '7007011', type: 'tam_orta', status: 'active' },
  { id: 'sch-sah-guney', name: 'Güney Qışlaq kənd tam orta məktəbi', district: 'Şahbuz rayonu', utis_code: '7007012', type: 'tam_orta', status: 'active' },
  { id: 'sch-sah-mahmudoba', name: 'Mahmudoba kənd tam orta məktəbi', district: 'Şahbuz rayonu', utis_code: '7007013', type: 'tam_orta', status: 'active' },

  // ==========================================
  // 8. SƏDƏRƏK RAYONU
  // ==========================================
  { id: 'sch-sed-heyderabad', name: 'Heydərabad qəsəbə tam orta məktəbi', district: 'Sədərək rayonu', utis_code: '7008001', type: 'tam_orta', status: 'active' },
  { id: 'sch-sed-01', name: 'Sədərək kənd 1 nömrəli tam orta məktəb', district: 'Sədərək rayonu', utis_code: '7008002', type: 'tam_orta', status: 'active' },
  { id: 'sch-sed-02', name: 'Sədərək kənd 2 nömrəli tam orta məktəb', district: 'Sədərək rayonu', utis_code: '7008003', type: 'tam_orta', status: 'active' },
  { id: 'sch-sed-03', name: 'Sədərək kənd 3 nömrəli tam orta məktəb', district: 'Sədərək rayonu', utis_code: '7008004', type: 'tam_orta', status: 'active' },
  { id: 'sch-sed-qaraagac', name: 'Qaraağac kənd tam orta məktəbi', district: 'Sədərək rayonu', utis_code: '7008005', type: 'tam_orta', status: 'active' },
  { id: 'sch-sed-demirci', name: 'Dəmirçi kənd tam orta məktəbi', district: 'Sədərək rayonu', utis_code: '7008006', type: 'tam_orta', status: 'active' }
];

// LocalStorage caching helper for persistent admin additions
const STORAGE_KEY_CUSTOM_SCHOOLS = 'edx_custom_nakhchivan_schools';

export function getAllSchools(): SchoolRecordItem[] {
  if (typeof window === 'undefined') return OFFICIAL_NAKHCHIVAN_SCHOOLS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_SCHOOLS);
    if (!raw) return OFFICIAL_NAKHCHIVAN_SCHOOLS;
    const custom: SchoolRecordItem[] = JSON.parse(raw);
    const existingIds = new Set(custom.map(s => s.id));
    const merged = [...custom, ...OFFICIAL_NAKHCHIVAN_SCHOOLS.filter(s => !existingIds.has(s.id))];
    return merged;
  } catch {
    return OFFICIAL_NAKHCHIVAN_SCHOOLS;
  }
}

export function saveSchool(school: SchoolRecordItem): SchoolRecordItem[] {
  const current = getAllSchools();
  const idx = current.findIndex(s => s.id === school.id || s.utis_code === school.utis_code);
  let updated: SchoolRecordItem[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = { ...updated[idx], ...school };
  } else {
    updated = [school, ...current];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CUSTOM_SCHOOLS, JSON.stringify(updated));
  }
  return updated;
}

export function getSchoolsByDistrict(districtName: string): SchoolRecordItem[] {
  return getAllSchools().filter(s => s.district === districtName && s.status === 'active');
}

// Generate DISTRICT_SCHOOLS name array map for quick dropdowns
export const DISTRICT_SCHOOLS: Record<string, string[]> = {
  'Naxçıvan şəhəri': OFFICIAL_NAKHCHIVAN_SCHOOLS.filter(s => s.district === 'Naxçıvan şəhəri').map(s => s.name),
  'Babək rayonu': OFFICIAL_NAKHCHIVAN_SCHOOLS.filter(s => s.district === 'Babək rayonu').map(s => s.name),
  'Şərur rayonu': OFFICIAL_NAKHCHIVAN_SCHOOLS.filter(s => s.district === 'Şərur rayonu').map(s => s.name),
  'Ordubad rayonu': OFFICIAL_NAKHCHIVAN_SCHOOLS.filter(s => s.district === 'Ordubad rayonu').map(s => s.name),
  'Culfa rayonu': OFFICIAL_NAKHCHIVAN_SCHOOLS.filter(s => s.district === 'Culfa rayonu').map(s => s.name),
  'Kəngərli rayonu': OFFICIAL_NAKHCHIVAN_SCHOOLS.filter(s => s.district === 'Kəngərli rayonu').map(s => s.name),
  'Şahbuz rayonu': OFFICIAL_NAKHCHIVAN_SCHOOLS.filter(s => s.district === 'Şahbuz rayonu').map(s => s.name),
  'Sədərək rayonu': OFFICIAL_NAKHCHIVAN_SCHOOLS.filter(s => s.district === 'Sədərək rayonu').map(s => s.name)
};

// UTİS Code Validator (7 rəqəmli rəsmi şagird/müəllim UTİS kodu)
export function isValidUtisCode(code: string): { valid: boolean; message?: string } {
  const trimmed = (code || '').trim();
  if (!trimmed) {
    return { valid: false, message: 'UTİS kodu daxil edilməlidir' };
  }
  if (!/^\d{7}$/.test(trimmed)) {
    return { valid: false, message: 'UTİS kodu dəqiq 7 rəqəmdən ibarət olmalıdır (Məsələn: 1048291)' };
  }
  return { valid: true };
}

// Analytical Data Structures
export interface StudentRankingItem {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  utisCode: string;
  district: string;
  school: string;
  grade: string;
  testsCount: number;
  totalScore: number;
  avgPercentage: number;
  correctAnswersCount: number;
  totalAnswersCount: number;
  accuracyPercentage: number;
  schoolRank: number;
  districtRank: number;
  nmrRank: number;
  lastCompletedAt?: string;
}

export interface SchoolRecord {
  id: string;
  name: string;
  district: string;
  utisCode?: string;
  studentsCount: number;
  totalTestsTaken: number;
  totalScore: number;
  overallScore: number;
  successRate: number;
  minScore: number;
  maxScore: number;
  gradeScores: Record<string, number>;
  subjectScores: Record<string, number>;
  districtRank: number;
  nmrRank: number;
  dynamics: {
    mon1: number;
    mon2: number;
    mon3: number;
    changePct: number;
  };
}

export interface DistrictRecord {
  id: string;
  name: string;
  schoolsCount: number;
  participatingSchoolsCount: number;
  studentsCount: number;
  totalTestsTaken: number;
  totalScore: number;
  overallScore: number;
  successRate: number;
  minScore: number;
  maxScore: number;
  gradeScores: Record<string, number>;
  subjectScores: Record<string, number>;
  topSchool: { name: string; score: number };
  lowestSchool: { name: string; score: number };
  nmrRank: number;
  dynamics: {
    mon1: number;
    mon2: number;
    mon3: number;
    changePct: number;
  };
}

export interface NmrOverviewStats {
  totalStudents: number;
  totalSchools: number;
  overallAverage: number;
  gradeAverages: Record<string, number>;
  subjectAverages: Record<string, number>;
  topDistrict: { name: string; score: number };
  lowestDistrict: { name: string; score: number };
  topSchool: { name: string; district: string; score: number };
  lowestSchool: { name: string; district: string; score: number };
  minScore: { score: number; school: string; district: string };
  avgScore: number;
  maxScore: { score: number; school: string; district: string };
}
