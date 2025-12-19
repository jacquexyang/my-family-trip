import { 
  Plane, Train, MapPin, AlertCircle, Utensils, Users, Moon, Coffee, 
  Gift, Snowflake, Camera, Castle, Anchor, ShoppingBag, CheckCircle2, Car, Sun
} from 'lucide-react';

// 1. 預設打包清單
export const DEFAULT_PACKING_LIST = [
  { category: "證件與錢財", name: "護照 (效期6個月以上)" },
  { category: "證件與錢財", name: "韓幣 / 信用卡 / WOWPASS" },
  { category: "證件與錢財", name: "網卡 / E-sim / Wifi機" },
  { category: "證件與錢財", name: "機票 / 住宿憑證" },
  { category: "證件與錢財", name: "T-money 交通卡 (建議先儲值)" },
  { category: "電子產品", name: "轉接頭 (韓國雙圓孔 4.8mm)" },
  { category: "電子產品", name: "行動電源" },
  { category: "電子產品", name: "充電線 (手機/手錶)" },
  { category: "衣物 (冬季)", name: "發熱衣 / 發熱褲" },
  { category: "衣物 (冬季)", name: "羽絨外套 / 大衣" },
  { category: "衣物 (冬季)", name: "圍巾 / 毛帽 / 手套" },
  { category: "衣物 (冬季)", name: "好走的鞋子" },
  { category: "個人用品", name: "牙刷牙膏 (韓國環保不提供)" },
  { category: "個人用品", name: "個人藥品 (感冒/腸胃)" },
  { category: "個人用品", name: "保養品 / 護手霜" }
];

// 2. 旅程列表 (首頁用)
export const TRIP_REGISTRY = [
  {
    id: 'seoul_2025',
    title: "冬日首爾聖誕之旅",
    subtitle: "滑雪、美食與聖誕燈飾",
    dates: "2025.12.21 - 2025.12.27",
    coverImage: "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?q=80&w=2000&auto=format&fit=crop",
    defaultPassword: "2024"
  },
  {
    id: 'cruise_2025',
    title: "豪華郵輪海島行",
    subtitle: "沖繩、石垣島放鬆之旅",
    dates: "2026.01.15 - 2026.01.20",
    coverImage: "https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=2000&auto=format&fit=crop",
    defaultPassword: "2025"
  }
];

// 3. 詳細行程資料 - 首爾
const SEOUL_DATA = {
  budget: 60000,
  defaultParticipants: [
    { id: 1, name: "Howard家", avatar: "https://i.pravatar.cc/150?u=1" },
    { id: 2, name: "楓家", avatar: "https://i.pravatar.cc/150?u=5" },
  ],
  days: [
    {
      day: 1,
      label: "Day 1",
      date: "12/21 (日)", 
      weather: "snow",
      items: [
        { id: 101, time: "07:05", type: "transport", title: "桃園機場起飛", note: "長榮航空 BR170", desc: "預計 10:30 抵達仁川機場 (ICN)。", icon: Plane, location: "Taoyuan International Airport" },
        { id: 102, time: "11:40", type: "transport", title: "前往弘大", note: "AREX 機場快線 (普通車)", desc: "搭乘普通車前往弘大入口站 (約53分)。\n💡 建議：機場有 WOWPASS 機台可直接存台幣辦卡。", icon: Train, location: "Incheon International Airport" },
        { id: 1025, time: "12:50", type: "transport", title: "交通：前往民宿路線", note: "弘大站 6號出口 (步行5分)", desc: "【地鐵路線 (推薦)】\n弘大站 6號出口 -> 直行 150m -> 經過 7-11 和 Guripdongyo 幼兒園後 -> 第一個巷口左轉 -> 步行 30m 抵達。", icon: MapPin, location: "Hongik University Station Exit 6" },
        { id: 103, time: "12:55", type: "info", title: "寄放行李：RAON 保管所", note: "弘大站 7號出口 (站內)", desc: "位於 7 號出口旁 (地下2樓，免刷卡區)。", icon: AlertCircle, location: "Hongik University Station Exit 7" },
        { id: 104, time: "13:10", type: "food", title: "弘大午餐", note: "商圈簡單用餐", price: "約 ₩10,000 - ₩15,000", icon: Utensils, location: "Hongdae Shopping Street" },
        { id: 105, time: "14:00", type: "sightseeing", title: "弘大亂打秀", note: "Nanta Show", icon: Users, location: "29 Yanghwa-ro 16-gil, Mapo-gu, Seoul" },
        { id: 106, time: "15:30", type: "hotel", title: "民宿 Check-in", note: "The Purple Stay (3F)", desc: "地址：18 Sinchon-ro 8-gil 3층, 首爾", icon: Moon, location: "18 Sinchon-ro 8-gil, Mapo-gu, Seoul" },
        { id: 107, time: "18:00", type: "food", title: "胖胖豬頰肉", note: "推薦一：老字號燒肉", price: "約 ₩15,000 - ₩25,000", rating: 4.6, address: "126 Eoulmadang-ro, Mapo-gu, Seoul", icon: Utensils, location: "Tong Tong Dwaeji" },
        { id: 108, time: "18:00", type: "food", title: "小豬存錢筒", note: "推薦二：石頭烤肉", price: "約 ₩18,000 - ₩30,000", rating: 4.3, address: "146-1 Eoulmadang-ro, Mapo-gu, Seoul", icon: Utensils, location: "Piggy Bank Stone Grill" },
        { id: 109, time: "18:00", type: "food", title: "二代祖馬鈴薯排骨湯", note: "推薦三：暖胃湯鍋", price: "約 ₩12,000 - ₩20,000", rating: 4.2, address: "196 Donggyo-ro, Mapo-gu, Seoul", icon: Utensils, location: "I-daejo Ppyeodagwi" },
        { id: 110, time: "18:00", type: "food", title: "給豚的男人", note: "推薦四：濟州島豬肉", price: "約 ₩20,000 - ₩40,000", rating: 4.1, address: "34-9 Jandari-ro 6-gil, Mapo-gu, Seoul", icon: Utensils, location: "Donju-Neun Namja" },
      ]
    },
    {
      day: 2,
      label: "Day 2",
      date: "12/22 (一)", 
      weather: "sunny",
      items: [
        { id: 201, time: "09:00", type: "transport", title: "包車出發", note: "民宿門口集合", icon: Car, location: "18 Sinchon-ro 8-gil, Mapo-gu, Seoul" },
        { id: 202, time: "10:30", type: "sightseeing", title: "江華島 Luge", note: "斜坡滑車", icon: Users, location: "4-15 Seondu-ri, Gilsang-myeon, Ganghwa-gun, Incheon" },
        { id: 203, time: "12:30", type: "food", title: "午餐：山塘韓定食", note: "江華島特色", price: "約 ₩20,000 - ₩30,000", rating: 4.0, address: "186-19 Cheoljongsijang-gil, Yangsa-myeon, Ganghwa-gun, Incheon", icon: Utensils, location: "Sandang Ganghwa" },
        { id: 204, time: "13:30", type: "sightseeing", title: "小倉織物體驗館", note: "手帕蓋章 DIY", icon: Gift, location: "8 Nammunan-gil 20beon-gil, Ganghwa-eup, Ganghwa-gun, Incheon" },
        { id: 205, time: "14:30", type: "food", title: "朝陽紡織咖啡廳", note: "網美打卡點", price: "約 ₩10,000 - ₩18,000", rating: 4.5, address: "12 Hyangnamu-gil 5beon-gil, Ganghwa-eup, Ganghwa-gun, Incheon", icon: Coffee, location: "Joyang Bangjik" },
        { id: 2055, time: "15:45", type: "transport", title: "⚠️ 關鍵時刻：移動", note: "必須準時離開", desc: "前往愛妓峰 (約30分)。因是軍事管制區，有嚴格入場時間限制。", icon: AlertCircle, location: "Ganghwa-gun" },
        { id: 206, time: "16:15", type: "sightseeing", title: "愛妓峰和平生態公園", note: "星巴克 (需帶護照)", icon: MapPin, location: "289 Pyeonghwagongwon-ro, Wolgot-myeon, Gimpo-si, Gyeonggi-do" },
        { id: 207, time: "19:00", type: "transport", title: "返回弘大/新村", note: "下車用餐", icon: Car, location: "Sinchon Station" },
        { id: 208, time: "19:30", type: "food", title: "晚餐：孔陵一隻雞", note: "暖身鍋物", price: "約 ₩15,000 - ₩22,000", rating: 4.4, address: "54 Yonsei-ro 2-gil, Seodaemun-gu, Seoul", icon: Utensils, location: "Gongneung Dakhanmari Sinchon" },
      ]
    },
    {
      day: 3,
      label: "Day 3",
      date: "12/23 (二)", 
      weather: "snow",
      items: [
        { id: 301, time: "07:30", type: "transport", title: "滑雪團集合", note: "KKday 行程 (弘大)", icon: Car, location: "Hongik University Station Exit 8" },
        { id: 302, time: "全天", type: "sightseeing", title: "芝山森林滑雪渡假村", note: "滑雪體驗", icon: Snowflake, location: "267 Jisan-ro, Majang-myeon, Icheon-si, Gyeonggi-do" },
        { id: 303, time: "17:30", type: "transport", title: "返回首爾", note: "約 18:00 抵達弘大", icon: Car, location: "Hongik University Station" },
        { id: 304, time: "晚上", type: "food", title: "晚餐：胖胖豬頰肉", note: "三層肉/韓牛", price: "約 ₩25,000 - ₩45,000", rating: 4.3, address: "126 Eoulmadang-ro, Mapo-gu, Seoul", icon: Utensils, location: "Tong Tong Dwaeji" },
        { id: 308, time: "20:30", type: "sightseeing", title: "舒壓按摩", note: "The Foot Shop", desc: "緩解滑雪後的肌肉痠痛。", icon: Moon, location: "198 Donggyo-ro, Mapo-gu, Seoul" },
      ]
    },
    {
      day: 4,
      label: "Day 4",
      date: "12/24 (三)", 
      weather: "snow",
      items: [
        { id: 401, time: "09:00", type: "transport", title: "前往三成站", note: "地鐵 2號線", icon: Train, location: "Samseong Station" },
        { id: 402, time: "10:00", type: "sightseeing", title: "COEX 星空圖書館", note: "巨型聖誕樹", icon: Camera, location: "513 Yeongdong-daero, Gangnam-gu, Seoul" },
        { id: 403, time: "11:30", type: "food", title: "午餐：COEX Mall", note: "建議在此用餐", price: "約 ₩15,000 - ₩25,000", icon: Utensils, location: "COEX Mall" },
        { id: 404, time: "12:30", type: "transport", title: "移動至蠶室", note: "地鐵 2號線", icon: Train, location: "Jamsil Station" },
        { id: 405, time: "13:00", type: "sightseeing", title: "樂天世界 (聖誕夜)", note: "Lotte World", icon: Castle, location: "240 Olympic-ro, Songpa-gu, Seoul" },
        { id: 406, time: "20:00", type: "sightseeing", title: "石村湖 / 樂天塔", note: "聖誕燈飾夜景", icon: Gift, location: "47 Jamsil-dong, Songpa-gu, Seoul" },
        { id: 407, time: "20:30", type: "food", title: "平安夜晚餐：Godosik", note: "松理團路", price: "約 ₩25,000 - ₩50,000", rating: 4.6, address: "101-1 Songpa-dong, Songpa-gu, Seoul", icon: Utensils, location: "Godosik Jamsil" },
        { id: 408, time: "22:00", type: "transport", title: "返回弘大", note: "地鐵 2號線", icon: Train, location: "Hongik University Station" },
      ]
    },
    {
      day: 5, 
      label: "Day 5",
      date: "12/25 (四)", 
      weather: "snow",
      items: [
        { id: 501, time: "09:30", type: "transport", title: "前往光化門", note: "地鐵/公車", icon: Train, location: "Gwanghwamun Station" },
        { id: 502, time: "10:00", type: "sightseeing", title: "光化門", note: "守門將換崗儀式", icon: Users, location: "172 Sejong-daero, Jongno-gu, Seoul" },
        { id: 503, time: "10:30", type: "sightseeing", title: "景福宮", note: "參觀", icon: Castle, location: "161 Sajik-ro, Jongno-gu, Seoul" },
        { id: 504, time: "12:30", type: "food", title: "通仁市場 (午餐)", note: "銅錢便當", price: "約 ₩10,000 - ₩15,000", rating: 4.3, address: "18 Jahamun-ro 15-gil, Jongno-gu, Seoul", icon: Utensils, location: "Tongin Market" },
        { id: 505, time: "14:30", type: "sightseeing", title: "西村散策", note: "韓屋咖啡廳", icon: Coffee, location: "Seochon Village, Jongno-gu, Seoul" },
        { id: 506, time: "17:00", type: "sightseeing", title: "漫步回光化門", note: "前往廣場", icon: MapPin, location: "172 Sejong-daero, Jongno-gu, Seoul" },
        { id: 507, time: "18:00", type: "sightseeing", title: "光化門耶誕市集", note: "燈飾節", icon: Gift, location: "172 Sejong-daero, Jongno-gu, Seoul" },
        { id: 508, time: "20:00", type: "food", title: "聖誕晚餐：世宗村", note: "鐘路美食街", price: "約 ₩30,000 - ₩60,000", address: "Jahamun-ro 1-gil, Jongno-gu, Seoul", icon: Utensils, location: "Sejong Village Food Culture Street" },
      ]
    },
    {
      day: 6,
      label: "Day 6",
      date: "12/26 (五)", 
      weather: "sunny",
      items: [
        { id: 601, time: "10:00", type: "sightseeing", title: "昌信洞文具街", note: "東大門", icon: ShoppingBag, location: "36 Jong-ro 52-gil, Jongno-gu, Seoul" },
        { id: 602, time: "12:30", type: "food", title: "廣藏市場 (午餐)", note: "必吃三寶", price: "約 ₩15,000 - ₩25,000", rating: 4.1, address: "88 Changgyeonggung-ro, Jongno-gu, Seoul", icon: Utensils, location: "Gwangjang Market" },
        { id: 603, time: "14:30", type: "sightseeing", title: "潮牌一條街", note: "聖水洞", icon: Users, location: "Seongsu-dong, Seongdong-gu, Seoul" },
        { id: 604, time: "17:00", type: "sightseeing", title: "明洞新世界百貨", note: "3D 聖誕裝飾", icon: Camera, location: "63 Sogong-ro, Jung-gu, Seoul" },
        { id: 605, time: "18:30", type: "sightseeing", title: "清溪川首爾燈節", note: "散步", icon: Gift, location: "1 Cheonggyecheon-ro, Jongno-gu, Seoul" },
        { id: 606, time: "19:30", type: "food", title: "晚餐：陳玉華一隻雞", note: "東大門", price: "約 ₩15,000 - ₩22,000", rating: 4.2, address: "18 Jong-ro 40ga-gil, Jongno-gu, Seoul", icon: Utensils, location: "Jinokhwa Halmae Wonjo Dakhanmari" },
      ]
    },
    {
      day: 7,
      label: "Day 7",
      date: "12/27 (六)", 
      weather: "sunny",
      items: [
        { id: 701, time: "10:00", type: "hotel", title: "退房 Check-out", note: "寄放行李", desc: "建議弘大站 RAON/T-Luggage。", icon: Moon, location: "Hongik University Station" },
        { id: 702, time: "11:00", type: "sightseeing", title: "望遠市場", note: "最後採買", icon: ShoppingBag, location: "14 Poeun-ro 6-gil, Mapo-gu, Seoul" },
        { id: 703, time: "12:00", type: "food", title: "午餐：酥脆馬車", note: "炸豬排", price: "約 ₩10,000 - ₩15,000", rating: 4.4, address: "39 Mangwon-ro 8-gil, Mapo-gu, Seoul", icon: Utensils, location: "Basak Macha" },
        { id: 704, time: "13:00", type: "food", title: "Ugly Bakery", note: "望遠洞", price: "約 ₩8,000 - ₩15,000", rating: 4.0, address: "73 World Cup-ro 13-gil, Mapo-gu, Seoul", icon: Coffee, location: "Ugly Bakery" },
        { id: 705, time: "15:30", type: "transport", title: "取行李", note: "弘大站", icon: MapPin, location: "Hongik University Station" },
        { id: 706, time: "16:00", type: "transport", title: "前往機場", note: "AREX 機場快線", icon: Train, location: "Incheon International Airport" },
        { id: 707, time: "17:15", type: "transport", title: "抵達機場", note: "登機/退稅", icon: CheckCircle2, location: "Incheon International Airport" },
        { id: 708, time: "19:45", type: "transport", title: "搭機返台 (BR159)", note: "21:40 抵達桃園", icon: Plane, location: "Incheon International Airport" },
      ]
    }
  ]
};

// 4. 詳細行程資料 - 郵輪
const CRUISE_DATA = {
  budget: 100000,
  defaultParticipants: [
    { id: 1, name: "Howard家", avatar: "https://i.pravatar.cc/150?u=1" },
  ],
  days: [
    {
      day: 1,
      label: "Day 1",
      date: "1/15 (四)",
      weather: "sunny",
      items: [
        { id: 101, time: "14:00", type: "transport", title: "基隆港登船", note: "辦理登船手續", icon: Anchor, location: "Keelung Port" }
      ]
    }
  ]
};

// 整合匯出
export const ALL_TRIPS_CONFIG = {
  'seoul_2025': { data: SEOUL_DATA },
  'cruise_2025': { data: CRUISE_DATA }
};