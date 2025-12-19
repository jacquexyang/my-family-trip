import React, { useState, useMemo, useEffect } from 'react';
import { 
  MapPin, Clock, Users, Share2, ChevronLeft, MoreHorizontal, Coffee, 
  Camera, Utensils, Train, Moon, Sun, Heart, Calendar, Plane, Navigation, 
  Wallet, ArrowRightLeft, Plus, X, ArrowRight, Umbrella, Car, Snowflake, 
  ExternalLink, Castle, Gift, ShoppingBag, Copy, CheckCircle2, Edit3, 
  Globe, PlusCircle, Briefcase, Lock, KeyRound, CheckSquare, UserPlus, Trash2,
  AlertCircle, Sparkles, Search, Star, ThumbsUp, AlertTriangle, MessageCircle,
  Info, Map, Languages, Calculator, LayoutGrid, Cloud, RefreshCw, Anchor
} from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { 
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, setDoc, getDocs, serverTimestamp, getDoc, writeBatch 
} from "firebase/firestore";

// --- 0. Firebase 設定區 ---
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwBtBbVpJ5RU2LkSVaDsGVbd2QAITx7mA",
  authDomain: "my-family-trip.firebaseapp.com",
  projectId: "my-family-trip",
  storageBucket: "my-family-trip.firebasestorage.app",
  messagingSenderId: "757482722852",
  appId: "1:757482722852:web:2b35e7e4fcd1ab6c362ab1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- 1. 資料庫區 (Data Layer) ---

// 1.1 旅程列表設定 (Trip Registry)
const TRIP_REGISTRY = [
  {
    id: 'seoul_2025',
    title: "冬日首爾聖誕之旅",
    subtitle: "滑雪、美食與聖誕燈飾",
    dates: "2025.12.21 - 2025.12.27",
    coverImage: "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?q=80&w=2000&auto=format&fit=crop",
    defaultPassword: "2024" // 僅用於首次自動初始化資料庫，之後請在 Firebase 修改
  },
  {
    id: 'cruise_2025',
    title: "豪華郵輪海島行",
    subtitle: "沖繩、石垣島放鬆之旅",
    dates: "2026.01.15 - 2026.01.20",
    coverImage: "https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=2000&auto=format&fit=crop",
    defaultPassword: "2025" // 僅用於首次自動初始化資料庫
  }
];

// 1.2 首爾行程內容
const SEOUL_DATA = {
  budget: 60000,
  participants: [
    { id: 1, name: "Howard家", avatar: "https://i.pravatar.cc/150?u=1" },
    { id: 2, name: "楓家", avatar: "https://i.pravatar.cc/150?u=5" },
  ],
  packingList: [
    { category: "證件與錢財", items: [
      { id: 'p1', name: "護照 (效期6個月以上)", checked: false },
      { id: 'p2', name: "韓幣 / 信用卡 / WOWPASS", checked: false },
      { id: 'p3', name: "網卡 / E-sim / Wifi機", checked: false },
      { id: 'p4', name: "機票 / 住宿憑證", checked: false },
      { id: 'p5', name: "T-money 交通卡 (建議先儲值)", checked: false }
    ]},
    { category: "電子產品", items: [
      { id: 'e1', name: "轉接頭 (韓國雙圓孔 4.8mm)", checked: false },
      { id: 'e2', name: "行動電源", checked: false },
      { id: 'e3', name: "充電線 (手機/手錶)", checked: false }
    ]},
    { category: "衣物 (冬季)", items: [
      { id: 'c1', name: "發熱衣 / 發熱褲", checked: false },
      { id: 'c2', name: "羽絨外套 / 大衣", checked: false },
      { id: 'c3', name: "圍巾 / 毛帽 / 手套 (滑雪必備)", checked: false },
      { id: 'c4', name: "好走的鞋子", checked: false }
    ]},
    { category: "個人用品", items: [
      { id: 't1', name: "牙刷牙膏 (韓國環保不提供)", checked: false },
      { id: 't2', name: "個人藥品 (感冒/腸胃/暈車)", checked: false },
      { id: 't3', name: "保養品 / 護手霜 / 暖暖包", checked: false }
    ]}
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
        { 
          id: 1025, 
          time: "12:50", 
          type: "transport", 
          title: "交通：前往民宿路線", 
          note: "弘大站 6號出口 (步行5分)", 
          desc: "【地鐵路線 (推薦)】\n弘大站 6號出口 -> 直行 150m -> 經過 7-11 和 Guripdongyo 幼兒園後 -> 第一個巷口左轉 -> 步行 30m 抵達。\n\n【機場巴士 6002】\n新村五路口(現代百貨)下車 -> 過馬路往 No Brand Burger -> 左走 260m -> 新村長老教會過馬路 -> 右走 40m -> 從大韓口琴協會旁左側小巷進入直走 90m。", 
          icon: MapPin, 
          location: "Hongik University Station Exit 6" 
        },
        { id: 103, time: "12:55", type: "info", title: "寄放行李：RAON 保管所", note: "弘大站 7號出口 (站內)", desc: "位於 7 號出口旁 (地下2樓，免刷卡區)。\n💰 費用(單日)：S ₩4,000 / M ₩6,000 / L ₩8,000\n✅ 無需預約，可直接現場辦理 (營業時間 09:30-21:30)。", icon: AlertCircle, location: "Hongik University Station Exit 7" },
        { 
          id: 104, 
          time: "13:10", 
          type: "food", 
          title: "弘大午餐", 
          note: "商圈簡單用餐", 
          desc: "隨意挑選弘大商圈的餐廳，或是路邊小吃。",
          price: "約 ₩10,000 - ₩15,000",
          icon: Utensils, 
          location: "Hongdae Shopping Street" 
        },
        { id: 105, time: "14:00", type: "sightseeing", title: "弘大亂打秀", note: "Nanta Show", desc: "需提早 20 分鐘換票入場。", icon: Users, location: "29 Yanghwa-ro 16-gil, Mapo-gu, Seoul" },
        { 
          id: 106, 
          time: "15:30", 
          type: "hotel", 
          title: "民宿 Check-in", 
          note: "The Purple Stay (3F)", 
          desc: "地址：18 Sinchon-ro 8-gil 3층, 首爾, 首爾 04056, 南韓\n(3F, 18 Sinchon-ro 8-gil, Mapo-gu)\n請參照上方地鐵/巴士指引前往。", 
          icon: Moon, 
          location: "18 Sinchon-ro 8-gil, Mapo-gu, Seoul" 
        },
        { 
          id: 107, 
          time: "18:00", 
          type: "food", 
          title: "胖胖豬頰肉 (통통돼지뽈살)", 
          note: "推薦一：老字號燒肉", 
          desc: "弘大 25 年老店，招牌是口感 Q 彈的豬頰肉，比五花肉清爽不油膩，價格親民。\n必點：豬頰肉、五花肉。", 
          price: "約 ₩15,000 - ₩25,000",
          rating: 4.6,
          address: "126 Eoulmadang-ro, Mapo-gu, Seoul",
          icon: Utensils, 
          location: "Tong Tong Dwaeji" 
        },
        { 
          id: 108, 
          time: "18:00", 
          type: "food", 
          title: "小豬存錢筒 (돼지저금통)", 
          note: "推薦二：石頭烤肉", 
          desc: "用天然麥飯石代替烤網，肉受熱均勻不易焦，還能吸附油脂，是弘大非常有特色的烤肉店。", 
          price: "約 ₩18,000 - ₩30,000",
          rating: 4.3,
          address: "146-1 Eoulmadang-ro, Mapo-gu, Seoul",
          icon: Utensils, 
          location: "Piggy Bank Stone Grill" 
        },
        { 
          id: 109, 
          time: "18:00", 
          type: "food", 
          title: "二代祖馬鈴薯排骨湯", 
          note: "推薦三：暖胃湯鍋", 
          desc: "24小時營業。湯頭濃郁微辣，排骨燉得非常軟爛，冬天喝一碗熱湯非常舒服。", 
          price: "約 ₩12,000 - ₩20,000",
          rating: 4.2,
          address: "196 Donggyo-ro, Mapo-gu, Seoul",
          icon: Utensils, 
          location: "I-daejo Ppyeodagwi" 
        },
        { 
          id: 110, 
          time: "18:00", 
          type: "food", 
          title: "給豚的男人 (돈주는남자)", 
          note: "推薦四：濟州島豬肉", 
          desc: "連續多年票選弘大美食第一名。主打濟州島豬肉，必沾特製麻藥醬汁，非常解膩。", 
          price: "約 ₩20,000 - ₩40,000",
          rating: 4.1,
          address: "34-9 Jandari-ro 6-gil, Mapo-gu, Seoul",
          icon: Utensils, 
          location: "Donju-Neun Namja" 
        },
      ]
    },
    {
      day: 2,
      label: "Day 2",
      date: "12/22 (一)", 
      weather: "sunny",
      items: [
        { id: 201, time: "09:00", type: "transport", title: "包車出發", note: "民宿門口集合", desc: "前往江華海邊度假村 (約 80 分鐘)。", icon: Car, location: "18 Sinchon-ro 8-gil, Mapo-gu, Seoul" },
        { id: 202, time: "10:30", type: "sightseeing", title: "江華島 Luge", note: "斜坡滑車", desc: "建議玩 2 次。❄️ 冬天滑行風大，記得戴手套/圍巾保暖！", icon: Users, location: "4-15 Seondu-ri, Gilsang-myeon, Ganghwa-gun, Incheon" },
        { 
          id: 203, 
          time: "12:30", 
          type: "food", 
          title: "午餐：山塘韓定食 (산당)", 
          note: "江華島特色", 
          desc: "精緻的韓式定食料理，包含多樣小菜與主食。",
          price: "約 ₩20,000 - ₩30,000",
          rating: 4.0,
          address: "186-19 Cheoljongsijang-gil, Yangsa-myeon, Ganghwa-gun, Incheon", 
          icon: Utensils, 
          location: "Sandang Ganghwa" 
        },
        { id: 204, time: "13:30", type: "sightseeing", title: "小倉織物體驗館", note: "手帕蓋章 DIY", icon: Gift, location: "8 Nammunan-gil 20beon-gil, Ganghwa-eup, Ganghwa-gun, Incheon" },
        { 
          id: 205, 
          time: "14:30", 
          type: "food", 
          title: "朝陽紡織咖啡廳 (조양방직)", 
          note: "網美打卡點", 
          desc: "必訪的復古美術館風格咖啡廳。飲料與蛋糕價格稍高。",
          price: "約 ₩10,000 - ₩18,000",
          rating: 4.5,
          address: "12 Hyangnamu-gil 5beon-gil, Ganghwa-eup, Ganghwa-gun, Incheon",
          icon: Coffee, 
          location: "Joyang Bangjik" 
        },
        { id: 206, time: "16:15", type: "sightseeing", title: "愛妓峰和平生態公園", note: "星巴克 (需帶護照)", desc: "眺望北韓景觀。", icon: MapPin, location: "289 Pyeonghwagongwon-ro, Wolgot-myeon, Gimpo-si, Gyeonggi-do" },
        { id: 207, time: "19:00", type: "transport", title: "返回弘大/新村", note: "下車用餐", icon: Car, location: "Sinchon Station" },
        { 
          id: 208, 
          time: "19:30", 
          type: "food", 
          title: "晚餐：孔陵一隻雞 (공릉닭한마리)", 
          note: "暖身鍋物", 
          desc: "消除疲勞，清淡鮮美，最後的雞蛋粥必吃。", 
          price: "約 ₩15,000 - ₩22,000",
          rating: 4.4,
          address: "54 Yonsei-ro 2-gil, Seodaemun-gu, Seoul",
          icon: Utensils, 
          location: "Gongneung Dakhanmari Sinchon" 
        },
      ]
    },
    {
      day: 3,
      label: "Day 3",
      date: "12/23 (二)", 
      weather: "snow",
      items: [
        { id: 301, time: "07:30", type: "transport", title: "滑雪團集合", note: "KKday 行程 (弘大)", desc: "約 07:00-08:00 集合，請依憑證為準。", icon: Car, location: "Hongik University Station Exit 8" },
        { id: 302, time: "全天", type: "sightseeing", title: "芝山森林滑雪渡假村", note: "滑雪體驗", icon: Snowflake, location: "267 Jisan-ro, Majang-myeon, Icheon-si, Gyeonggi-do" },
        { id: 303, time: "17:30", type: "transport", title: "返回首爾", note: "約 18:00 抵達弘大", icon: Car, location: "Hongik University Station" },
        { 
          id: 304, 
          time: "晚上", 
          type: "food", 
          title: "晚餐：胖胖豬頰肉 (통통돼지뽈살)", 
          note: "三層肉/韓牛", 
          desc: "滑雪消耗大，建議吃好一點補充體力。(若Day1沒吃，這天可以來)", 
          price: "約 ₩25,000 - ₩45,000",
          rating: 4.6,
          address: "126 Eoulmadang-ro, Mapo-gu, Seoul",
          icon: Utensils, 
          location: "Tong Tong Dwaeji" 
        },
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
        { 
          id: 403, 
          time: "11:30", 
          type: "food", 
          title: "午餐：COEX Mall", 
          note: "建議在此用餐", 
          desc: "選擇多環境好，先吃飽再進樂天世界戰鬥。", 
          price: "約 ₩15,000 - ₩25,000",
          icon: Utensils, 
          location: "COEX Mall" 
        },
        { 
          id: 404, 
          time: "12:30", 
          type: "transport", 
          title: "移動至蠶室", 
          note: "地鐵 2號線", 
          desc: "三成 ➔ 蠶室 (約6分鐘)。", 
          icon: Train, 
          location: "Jamsil Station" 
        },
        { id: 405, time: "13:00", type: "sightseeing", title: "樂天世界 (聖誕夜)", note: "Lotte World", desc: "下午入場。室內探險世界 + 室外魔幻島。可玩到晚上看遊行。", icon: Castle, location: "240 Olympic-ro, Songpa-gu, Seoul" },
        { id: 406, time: "20:00", type: "sightseeing", title: "石村湖 / 樂天塔", note: "聖誕燈飾夜景", icon: Gift, location: "47 Jamsil-dong, Songpa-gu, Seoul" },
        { 
          id: 407, 
          time: "20:30", 
          type: "food", 
          title: "平安夜晚餐：Godosik (고도식)", 
          note: "松理團路", 
          desc: "高人氣烤肉店，專人代烤。平安夜人多，預算建議拉高。", 
          price: "約 ₩25,000 - ₩50,000",
          rating: 4.6,
          address: "101-1 Songpa-dong, Songpa-gu, Seoul",
          icon: Utensils, 
          location: "Godosik Jamsil" 
        },
        { id: 408, time: "22:00", type: "transport", title: "返回弘大", note: "地鐵 2號線直達", icon: Train, location: "Hongik University Station" },
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
        { 
          id: 504, 
          time: "12:30", 
          type: "food", 
          title: "通仁市場 (午餐)", 
          note: "銅錢便當", 
          desc: "用古銅錢換購市場小吃，體驗傳統樂趣。", 
          price: "約 ₩10,000 - ₩15,000",
          rating: 4.3,
          address: "18 Jahamun-ro 15-gil, Jongno-gu, Seoul",
          icon: Utensils, 
          location: "Tongin Market" 
        },
        { id: 505, time: "14:30", type: "sightseeing", title: "西村散策", note: "韓屋咖啡廳/文創", icon: Coffee, location: "Seochon Village, Jongno-gu, Seoul" },
        { id: 506, time: "17:00", type: "sightseeing", title: "漫步回光化門", note: "前往廣場", icon: MapPin, location: "172 Sejong-daero, Jongno-gu, Seoul" },
        { id: 507, time: "18:00", type: "sightseeing", title: "光化門耶誕市集", note: "Seoul Lantern Festival", desc: "感受聖誕氣氛。", icon: Gift, location: "172 Sejong-daero, Jongno-gu, Seoul" },
        { 
          id: 508, 
          time: "20:00", 
          type: "food", 
          title: "聖誕晚餐：世宗村飲食文化街", 
          note: "鐘路美食街", 
          desc: "聖誕節聚餐，建議避開人潮最多的主街，往鐘路巷弄尋找。", 
          price: "約 ₩30,000 - ₩60,000",
          address: "Jahamun-ro 1-gil, Jongno-gu, Seoul",
          icon: Utensils, 
          location: "Sejong Village Food Culture Street" 
        },
      ]
    },
    {
      day: 6,
      label: "Day 6",
      date: "12/26 (五)", 
      weather: "sunny",
      items: [
        { id: 601, time: "10:00", type: "sightseeing", title: "昌信洞文具玩具市場", note: "東大門/東廟站", desc: "批發市場挖寶。", icon: ShoppingBag, location: "36 Jong-ro 52-gil, Jongno-gu, Seoul" },
        { 
          id: 602, 
          time: "12:30", 
          type: "food", 
          title: "廣藏市場 (午餐)", 
          note: "綠豆餅/生牛肉/麻藥飯捲", 
          desc: "韓國傳統市場美食天堂。生牛肉是必點！", 
          price: "約 ₩15,000 - ₩25,000",
          rating: 4.1,
          address: "88 Changgyeonggung-ro, Jongno-gu, Seoul",
          icon: Utensils, 
          location: "Gwangjang Market" 
        },
        { id: 603, time: "14:30", type: "sightseeing", title: "潮牌一條街", note: "聖水洞 或 弘大", icon: Users, location: "Seongsu-dong, Seongdong-gu, Seoul" },
        { id: 604, time: "17:00", type: "sightseeing", title: "明洞新世界百貨", note: "3D 聖誕裝飾", desc: "觀賞外牆燈光秀。", icon: Camera, location: "63 Sogong-ro, Jung-gu, Seoul" },
        { id: 605, time: "18:30", type: "sightseeing", title: "清溪川首爾燈節", note: "散步", desc: "沿著清溪川欣賞燈飾。", icon: Gift, location: "1 Cheonggyecheon-ro, Jongno-gu, Seoul" },
        { 
          id: 606, 
          time: "19:30", 
          type: "food", 
          title: "晚餐：陳玉華一隻雞 (진옥화할매원조닭한마리)", 
          note: "東大門", 
          desc: "就在燈節附近，湯頭鮮美，天冷必吃。", 
          price: "約 ₩15,000 - ₩22,000",
          rating: 4.2,
          address: "18 Jong-ro 40ga-gil, Jongno-gu, Seoul",
          icon: Utensils, 
          location: "Jinokhwa Halmae Wonjo Dakhanmari" 
        },
      ]
    },
    {
      day: 7,
      label: "Day 7",
      date: "12/27 (六)", 
      weather: "sunny",
      items: [
        { id: 701, time: "10:00", type: "hotel", title: "退房 Check-out", note: "寄放行李 (弘大站)", desc: "建議寄放在弘大站 (RAON/T-Luggage)。", icon: Moon, location: "Hongik University Station" },
        { id: 702, time: "11:00", type: "sightseeing", title: "望遠市場", note: "Mangwon Market", desc: "必吃：炸雞丁、可樂餅。買伴手禮。", icon: ShoppingBag, location: "14 Poeun-ro 6-gil, Mapo-gu, Seoul" },
        { 
          id: 703, 
          time: "12:00", 
          type: "food", 
          title: "午餐：酥脆馬車炸豬排 (바삭마차)", 
          note: "市場必吃", 
          desc: "各種口味的手工炸豬排，也有棉花糖冰淇淋。", 
          price: "約 ₩10,000 - ₩15,000",
          rating: 4.4,
          address: "39 Mangwon-ro 8-gil, Mapo-gu, Seoul",
          icon: Utensils, 
          location: "Basak Macha" 
        },
        { 
          id: 704, 
          time: "13:00", 
          type: "food", 
          title: "Ugly Bakery (어글리베이커리)", 
          note: "望遠洞咖啡廳", 
          desc: "爆漿鮮奶油麵包名店，需排隊。", 
          price: "約 ₩8,000 - ₩15,000",
          rating: 4.0,
          address: "73 World Cup-ro 13-gil, Mapo-gu, Seoul",
          icon: Coffee, 
          location: "Ugly Bakery" 
        },
        { id: 705, time: "15:30", type: "transport", title: "取行李", note: "弘大站", icon: MapPin, location: "Hongik University Station" },
        { id: 706, time: "16:00", type: "transport", title: "前往機場", note: "AREX 機場快線", desc: "週六傍晚易塞車，請搭地鐵/快線。", icon: Train, location: "Incheon International Airport" },
        { id: 707, time: "17:15", type: "transport", title: "抵達機場", note: "登機/退稅", icon: CheckCircle2, location: "Incheon International Airport" },
        { id: 708, time: "19:45", type: "transport", title: "搭機返台 (BR159)", note: "21:40 抵達桃園", icon: Plane, location: "Incheon International Airport" },
      ]
    }
  ]
};

// 1.3 郵輪行程內容 (Placeholder)
const CRUISE_DATA = {
  budget: 100000,
  participants: [
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

// --- 2. 元件區 (Components) ---

// 2.1 標籤元件
const Tag = ({ type }) => {
  const styles = {
    food: "bg-orange-50 text-orange-600 border-orange-100",
    sightseeing: "bg-emerald-50 text-emerald-600 border-emerald-100",
    transport: "bg-blue-50 text-blue-600 border-blue-100",
    hotel: "bg-purple-50 text-purple-600 border-purple-100",
    info: "bg-gray-50 text-gray-600 border-gray-100",
  };
  
  const labelMap = { food: '餐飲', sightseeing: '景點', transport: '交通', hotel: '住宿', info: '資訊' };

  return (
    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${styles[type] || "bg-gray-50 text-gray-600"}`}>
      {labelMap[type] || '其他'}
    </span>
  );
};

// 2.2 記帳邏輯
const calculateDebts = (expenses, participants) => {
  const balances = {};
  participants.forEach(p => balances[p.id] = 0);

  expenses.forEach(exp => {
    const payerId = exp.payerId;
    const amount = parseFloat(exp.amount);
    
    // 找出分攤對象
    const beneficiaryIds = exp.beneficiaryIds && exp.beneficiaryIds.length > 0 
      ? exp.beneficiaryIds 
      : participants.map(p => p.id);
    
    // 取得權重設定 (若無則預設為 1)
    const weights = exp.splitWeights || {};
    const totalWeight = beneficiaryIds.reduce((sum, id) => sum + (parseFloat(weights[id]) || 1), 0);
    
    if (totalWeight > 0) {
      // 付款人先 + 總金額
      balances[payerId] += amount;

      // 每個受益人 (包含付款人自己) 扣掉應付的份額 (按權重)
      beneficiaryIds.forEach(pId => {
        if (balances[pId] !== undefined) {
          const weight = parseFloat(weights[pId]) || 1;
          const userShare = (amount * weight) / totalWeight;
          balances[pId] -= userShare;
        }
      });
    }
  });

  let debtors = [], creditors = [];
  
  Object.keys(balances).forEach(id => {
    const amount = balances[id];
    // 避免浮點數誤差
    if (amount < -1) debtors.push({ id: parseInt(id), amount });
    if (amount > 1) creditors.push({ id: parseInt(id), amount });
  });

  const transactions = [];
  debtors.sort((a, b) => a.amount - b.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    
    const amount = Math.min(Math.abs(debtor.amount), creditor.amount);
    
    transactions.push({
      from: participants.find(p => p.id === debtor.id),
      to: participants.find(p => p.id === creditor.id),
      amount: Math.round(amount)
    });

    debtor.amount += amount;
    creditor.amount -= amount;

    if (Math.abs(debtor.amount) < 1) i++;
    if (creditor.amount < 1) j++;
  }

  return transactions;
};

// 2.3 登入鎖定畫面
const TripLoginModal = ({ trip, onUnlock }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === trip.password) onUnlock();
    else { setError(true); setTimeout(() => setError(false), 2000); }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-300 relative text-center border border-white/20">
        <div className="flex justify-center mb-6">
          <div className="bg-stone-100 p-4 rounded-2xl text-stone-700 shadow-inner"><Lock size={32} /></div>
        </div>
        <h3 className="text-xl font-bold text-stone-800 mb-2">行程已鎖定</h3>
        <p className="text-sm text-stone-500 mb-6">請輸入「{trip.title}」的通關密語</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" inputMode="numeric" pattern="[0-9]*" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Passcode" className="w-full bg-stone-50 border-2 border-stone-100 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest text-stone-800 focus:outline-none focus:border-stone-800 focus:bg-white transition-all" autoFocus />
          <button type="submit" className="w-full bg-stone-900 text-white rounded-xl py-3 font-bold text-lg hover:bg-stone-800 transition-all shadow-lg active:scale-95">解鎖</button>
        </form>
        {error && <p className="mt-4 text-red-500 text-sm font-bold animate-pulse flex justify-center gap-1"><X size={16} /> 密碼錯誤</p>}
      </div>
    </div>
  );
};

// 2.4 新增：通用詳情頁 (Item Detail Modal)
const ItemDetailModal = ({ item, onClose }) => {
  if (!item) return null;

  const getGeminiQuery = () => {
    if (item.type === 'food') {
      return `幫我分析這家店：${item.title} (${item.location || '首爾'})。請提供：1. 必點推薦菜色 2. 網友評價/避雷指南 3. 人均消費預算 4. 是否適合家庭用餐？`;
    } else if (item.type === 'sightseeing') {
      return `請介紹首爾景點：${item.title}。請提供：1. 景點特色與必看亮點 2. 建議停留時間 3. 交通方式與附近順遊景點 4. 適合家庭/親子的程度？`;
    } else if (item.type === 'hotel') {
      return `請分析首爾住宿：${item.title}。請提供：1. 網友綜合評價 (優缺點) 2. 距離地鐵站/機場巴士的便利性 3. 附近便利商店與美食 4. 是否適合家庭入住？`;
    } else if (item.type === 'transport') {
      return `請問在首爾如何搭乘：${item.title} (${item.note})？請提供：1. 搭乘位置與路線 2. 時刻表或班次頻率 3. 票價與支付方式 (T-money?)`;
    } else {
      return `請介紹：${item.title} (${item.location || '首爾'})。請提供詳細的旅遊資訊、評價以及注意事項。`;
    }
  };

  const handleAskGemini = () => {
    const query = getGeminiQuery();
    const url = `https://gemini.google.com/app?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const handleGoogleSearch = () => {
    const query = `${item.title} ${item.location || '首爾'} 評價`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  const handleGoogleMap = () => {
    // 優先使用精確地址，若無則使用名稱
    const query = item.address || (item.location ? `${item.title} ${item.location}` : item.title);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };

  const getAiConfig = (type) => {
     switch (type) {
        case 'food':
           return {
             title: "AI 探店助手",
             prompts: ["必吃推薦", "人均預算", "避雷 / 貼心提醒"],
             icons: [<ThumbsUp size={14}/>, <Wallet size={14}/>, <AlertTriangle size={14}/>]
           };
        case 'sightseeing':
           return {
             title: "AI 景點導覽",
             prompts: ["特色亮點", "建議停留", "參觀貼士"],
             icons: [<Star size={14}/>, <Clock size={14}/>, <AlertCircle size={14}/>]
           };
        case 'hotel':
           return {
             title: "AI 住宿分析",
             prompts: ["住宿評價", "周邊機能", "入住須知"],
             icons: [<Star size={14}/>, <MapPin size={14}/>, <AlertCircle size={14}/>]
           };
        default:
           return {
             title: "AI 旅遊助手",
             prompts: ["相關資訊", "網友評價", "注意事項"],
             icons: [<Search size={14}/>, <MessageCircle size={14}/>, <AlertCircle size={14}/>]
           };
     }
  }

  const aiConfig = getAiConfig(item.type);

  return (
    <div className="fixed inset-0 z-[70] bg-stone-900/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl relative h-[85vh] md:h-auto md:max-h-[85vh] flex flex-col">
        {/* Header Image Area */}
        <div className="h-56 bg-stone-200 relative shrink-0">
          <img 
            src={`https://source.unsplash.com/800x600/?korean,${item.type},${item.title}`} 
            onError={(e) => e.target.src = "https://images.unsplash.com/photo-1580651315530-69c8e0026377?q=80&w=2070&auto=format&fit=crop"}
            alt={item.title} 
            className="w-full h-full object-cover"
          />
          
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors border border-white/20">
            <X size={20} />
          </button>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20">
             <div className="flex gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-md text-white text-[10px] font-bold uppercase tracking-wider ${item.type === 'food' ? 'bg-orange-500' : item.type === 'sightseeing' ? 'bg-emerald-500' : 'bg-blue-500'}`}>{item.type}</span>
                {item.rating && (
                  <span className="px-2 py-0.5 rounded-md bg-white/20 text-white border border-white/20 text-[10px] backdrop-blur-md flex items-center gap-1">
                     <Star size={10} className="fill-current text-yellow-400"/> {item.rating}
                  </span>
                )}
             </div>
            <h2 className="text-3xl font-bold text-white mb-1 shadow-sm">{item.title}</h2>
            <p className="text-white/80 text-sm flex items-center gap-1 font-medium truncate max-w-full"><MapPin size={14} className="shrink-0"/> {item.address || item.location || '首爾'}</p>
          </div>
        </div>

        {/* Content Scroll Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-stone-50">
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
             <button onClick={handleGoogleSearch} className="p-3 rounded-2xl bg-white border border-stone-100 text-stone-700 hover:bg-stone-50 hover:border-purple-200 hover:text-purple-600 flex items-center justify-center gap-2 font-bold shadow-sm transition-all text-sm md:text-base">
              <Search size={18} className="text-purple-500"/> Google 搜尋
            </button>
            <button onClick={handleGoogleMap} className="p-3 rounded-2xl bg-white border border-stone-100 text-stone-700 hover:bg-stone-50 hover:border-blue-200 hover:text-blue-600 flex items-center justify-center gap-2 font-bold shadow-sm transition-all text-sm md:text-base">
              <MapPin size={18} className="text-blue-500"/> Google 導航
            </button>
            {/* Conditional Instagram button for visual items */}
            {['food', 'sightseeing'].includes(item.type) && (
                 <button onClick={() => window.open(`https://www.instagram.com/explore/tags/${item.title}/`, '_blank')} className="col-span-2 p-3 rounded-2xl bg-white border border-stone-100 text-stone-700 hover:bg-stone-50 hover:border-pink-200 hover:text-pink-600 flex items-center justify-center gap-2 font-bold shadow-sm transition-all text-sm md:text-base">
                 <Camera size={18} className="text-pink-500"/> Instagram 美照
                </button>
            )}
            {item.link && (
               <button onClick={() => window.open(item.link, '_blank')} className="col-span-2 p-3 rounded-2xl bg-stone-800 text-white hover:bg-stone-700 flex items-center justify-center gap-2 font-bold shadow-sm transition-all text-sm md:text-base">
                 <Globe size={18}/> 查看相關連結
               </button>
            )}
          </div>

          {/* AI Info Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-100 relative overflow-hidden mb-6 group">
            <div className="absolute top-0 right-0 p-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles size={120} className="text-indigo-600 -mr-4 -mt-4"/>
            </div>
            
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-indigo-700 font-bold">
                    <div className="p-1.5 bg-indigo-100 rounded-lg"><Sparkles size={16} /></div>
                    <span>{aiConfig.title}</span>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-400 px-2 py-1 rounded-full">Gemini Powered</span>
            </div>
            
            <div className="space-y-4">
               <div className="flex gap-3 items-start">
                   <div className="mt-0.5 p-1 bg-orange-100 rounded text-orange-600 shrink-0">{aiConfig.icons[0]}</div>
                   <div>
                       <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-0.5">{aiConfig.prompts[0]}</span>
                       <p className="text-sm text-stone-700 font-medium leading-relaxed">{item.desc || '尚未載入資訊，請點擊下方按鈕詢問 AI。'}</p>
                   </div>
               </div>

               <div className="flex gap-3 items-start">
                   <div className="mt-0.5 p-1 bg-green-100 rounded text-green-600 shrink-0">{aiConfig.icons[1]}</div>
                   <div>
                       <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-0.5">{aiConfig.prompts[1]}</span>
                       <p className="text-sm text-stone-700 font-medium">{item.price || item.note || "暫無資料"}</p>
                   </div>
               </div>

               <div className="flex gap-3 items-start">
                   <div className="mt-0.5 p-1 bg-red-100 rounded text-red-600 shrink-0">{aiConfig.icons[2]}</div>
                   <div>
                       <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-0.5">{aiConfig.prompts[2]}</span>
                       <p className="text-sm text-stone-700 font-medium">建議事先確認營業時間與人潮狀況。</p>
                   </div>
               </div>
            </div>

            <div className="mt-6 pt-4 border-t border-indigo-50">
                <button 
                onClick={handleAskGemini}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                <MessageCircle size={16} /> 詢問 Gemini 詳細資訊
                </button>
                <p className="text-[10px] text-center text-stone-300 mt-2">點擊將開啟 Google Gemini 進行即時分析</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2.5 主行程頁面 (TripDashboard) - Modified to accept tripId
const TripDashboard = ({ tripId, tripInfo, onBack }) => {
  const [activeTab, setActiveTab] = useState('schedule'); 
  const [activeDay, setActiveDay] = useState(1);
  const [likedItems, setLikedItems] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  
  // Data
  const tripData = tripId === 'seoul_2025' ? SEOUL_DATA : CRUISE_DATA;

  // State
  const [participants, setParticipants] = useState([]);
  const [packingList, setPackingList] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(tripData.budget || 50000);
  const [selectedItem, setSelectedItem] = useState(null); // Changed to generic item
  const [isToolsOpen, setIsToolsOpen] = useState(false); // Tool modal state

  // UI State
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetInput, setNewBudgetInput] = useState(budget);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', payerId: 1, beneficiaryIds: [], splitWeights: {} });
  const [showShareModal, setShowShareModal] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newItemName, setNewItemName] = useState('');

  const currentDayData = tripData.days?.find(d => d.day === activeDay) || tripData.days?.[0] || { items: [] };

  // --- Firebase Listeners ---
  useEffect(() => {
     if (!tripId) return;

     // 1. Listen for packing list
     const packingRef = collection(db, 'artifacts', tripId, 'public', 'data', 'packing-list');
     const unsubPacking = onSnapshot(query(packingRef, orderBy('createdAt')), (snapshot) => {
         if (snapshot.empty) {
            // Init default packing list if empty
            if (tripId === 'seoul_2025' && tripData.defaultPackingList) {
                const batch = writeBatch(db);
                tripData.defaultPackingList.forEach(item => {
                   const docRef = doc(packingRef);
                   batch.set(docRef, { ...item, checked: false, createdAt: serverTimestamp() });
                });
                batch.commit().catch(console.error);
            }
         } else {
             const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
             const grouped = Object.values(items.reduce((acc, item) => {
                 if (!acc[item.category]) acc[item.category] = { category: item.category, items: [] };
                 acc[item.category].items.push(item);
                 return acc;
             }, {}));
             setPackingList(grouped);
         }
     });

     // 2. Listen for expenses
     const expRef = collection(db, 'artifacts', tripId, 'public', 'data', 'expenses');
     const unsubExp = onSnapshot(query(expRef, orderBy('createdAt', 'desc')), (snapshot) => {
         setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
     });

     // 3. Listen for participants
     const partRef = collection(db, 'artifacts', tripId, 'public', 'data', 'participants');
     const unsubPart = onSnapshot(query(partRef, orderBy('id')), (snapshot) => {
        if (!snapshot.empty) {
           setParticipants(snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id })));
        } else {
           // Init default participants if empty
           if (tripId === 'seoul_2025' && tripData.participants) {
               const batch = writeBatch(db);
               tripData.participants.forEach((p, index) => {
                   const docRef = doc(partRef);
                   batch.set(docRef, { ...p, id: index + 1, createdAt: serverTimestamp() });
               });
               batch.commit().catch(console.error);
           }
        }
     });

     // Init auth
     signInAnonymously(auth).catch(console.error);

     return () => { unsubPacking(); unsubExp(); unsubPart(); };
  }, [tripData.id]);

  useEffect(() => {
    if (isAddExpenseOpen && participants.length > 0) {
        setNewExpense(prev => ({ 
            ...prev, 
            beneficiaryIds: participants.map(p => p.id),
            splitWeights: participants.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {})
        }));
    }
  }, [isAddExpenseOpen, participants]);

  // Handlers
  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount) return;
    const finalBeneficiaries = newExpense.beneficiaryIds.length > 0 ? newExpense.beneficiaryIds : participants.map(p => p.id);
    await addDoc(collection(db, 'artifacts', tripData.id, 'public', 'data', 'expenses'), {
      title: newExpense.title,
      amount: parseInt(newExpense.amount),
      payerId: parseInt(newExpense.payerId),
      beneficiaryIds: finalBeneficiaries,
      splitWeights: newExpense.splitWeights,
      date: currentDayData.date?.split(' ')[0] || 'Today',
      createdAt: serverTimestamp()
    });
    setNewExpense({ title: '', amount: '', payerId: 1, beneficiaryIds: [], splitWeights: {} });
    setIsAddExpenseOpen(false);
  };

  const handleDeleteExpense = async (id) => {
    await deleteDoc(doc(db, 'artifacts', tripData.id, 'public', 'data', 'expenses', id));
  };

  const handleAddPerson = async () => {
    if (!newPersonName.trim()) return;
    const newId = participants.length > 0 ? Math.max(...participants.map(p => p.id)) + 1 : 1;
    await addDoc(collection(db, 'artifacts', tripData.id, 'public', 'data', 'participants'), {
      id: newId,
      name: newPersonName,
      avatar: `https://i.pravatar.cc/150?u=${newId + 10}`,
      createdAt: serverTimestamp()
    });
    setNewPersonName('');
    setIsAddPersonOpen(false);
  };

  const handleRemovePerson = async (docId) => {
    if (docId) await deleteDoc(doc(db, 'artifacts', tripData.id, 'public', 'data', 'participants', docId));
  };
  
  const togglePackingItem = async (cat, itemId) => {
     const itemRef = doc(db, 'artifacts', tripData.id, 'public', 'data', 'packing-list', itemId);
     let currentChecked = false;
     // Find current checked status from local state (which is synced)
     outerLoop: for(let c of packingList) {
        for(let i of c.items) {
            if(i.id === itemId) { currentChecked = i.checked; break outerLoop; }
        }
     }
     await updateDoc(itemRef, { checked: !currentChecked });
  };

  const handleAddPackingItem = async (categoryName) => {
    if (!newItemName.trim()) return;
    await addDoc(collection(db, 'artifacts', tripData.id, 'public', 'data', 'packing-list'), {
       category: categoryName,
       name: newItemName,
       checked: false,
       createdAt: serverTimestamp()
    });
    setNewItemName('');
  };
  
  const handleShare = () => {
    const url = window.location.href;
    const text = `✈️ ${tripData.title}\n📅 ${tripData.dates}\n密碼: ${tripData.password}\n連結: ${url}`;
    navigator.clipboard.writeText(text);
    setShowShareModal(true);
    setTimeout(() => setShowShareModal(false), 3000);
  };
  const copyAddress = (text, id) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };
  const handleNavigation = (location, title) => { const query = location || title; const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`; window.open(url, '_blank'); };
  const handleItemClick = (item) => setSelectedItem(item);
  const handleUpdateBudget = () => { setBudget(parseInt(newBudgetInput)); setIsEditingBudget(false); };
  const toggleBeneficiary = (id) => { setNewExpense(prev => { const current = prev.beneficiaryIds; return current.includes(id) ? { ...prev, beneficiaryIds: current.filter(i => i !== id) } : { ...prev, beneficiaryIds: [...current, id] }; }); };
  const handleWeightChange = (id, val) => { setNewExpense(prev => ({ ...prev, splitWeights: { ...prev.splitWeights, [id]: val } })); };

  const debts = useMemo(() => calculateDebts(expenses, participants), [expenses, participants]);
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const budgetPercentage = Math.min((totalSpent / budget) * 100, 100);

  const isEqualSplit = (exp) => {
    const beneficiaries = exp.beneficiaryIds || [];
    if (beneficiaries.length === 0) return true;
    const weights = exp.splitWeights || {};
    const firstWeight = parseFloat(weights[beneficiaries[0]]) || 1;
    return beneficiaries.every(id => (parseFloat(weights[id]) || 1) === firstWeight);
  };

  const getRatioString = (exp) => {
      const beneficiaries = exp.beneficiaryIds || [];
      const weights = exp.splitWeights || {};
      return beneficiaries.map(id => parseFloat(weights[id]) || 1).join(':');
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] pb-24 md:pb-0">
      {/* Hero Header */}
      <div className="relative w-full h-[40vh] md:h-[50vh]">
        <img src={tripInfo.coverImage} alt={tripInfo.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-stone-900/40"></div>
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-10 max-w-7xl mx-auto w-full">
           <div className="relative">
             <button onClick={() => setIsToolsOpen(!isToolsOpen)} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10 text-sm font-medium"><LayoutGrid size={18} /> <span className="hidden md:inline">工具</span></button>
             {isToolsOpen && (
               <div className="absolute top-12 left-0 w-48 bg-white rounded-2xl shadow-xl border border-stone-100 p-2 animate-in fade-in zoom-in duration-200 origin-top-left z-50">
                 <button onClick={() => window.open('https://translate.google.com/?sl=auto&tl=ko', '_blank')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-left text-sm text-stone-700 transition-colors"><div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><Languages size={16}/></div> Google 翻譯</button>
                 <button onClick={() => window.open('https://papago.naver.com/', '_blank')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-left text-sm text-stone-700 transition-colors"><div className="p-1.5 bg-green-50 text-green-500 rounded-lg"><MessageCircle size={16}/></div> Papago 翻譯</button>
                 <button onClick={() => window.open('https://map.naver.com/v5/', '_blank')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-left text-sm text-stone-700 transition-colors"><div className="p-1.5 bg-green-50 text-green-600 rounded-lg"><Map size={16}/></div> Naver 地圖</button>
                 <button onClick={() => window.open('https://www.google.com/search?q=TWD+to+KRW', '_blank')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-left text-sm text-stone-700 transition-colors"><div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg"><Calculator size={16}/></div> 匯率試算</button>
                 <button onClick={() => window.open('https://www.seoulmetro.co.kr/en/cyberStation.do', '_blank')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-left text-sm text-stone-700 transition-colors"><div className="p-1.5 bg-orange-50 text-orange-500 rounded-lg"><Train size={16}/></div> 地鐵圖</button>
               </div>
             )}
           </div>
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10 text-sm font-medium">{copiedId === 'share-btn' ? <CheckCircle2 size={18} className="text-green-400"/> : <Share2 size={18} />} <span className="hidden md:inline">分享行程</span></button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto w-full text-white">
          <div className="flex items-center gap-2 mb-2 opacity-90 text-sm tracking-widest uppercase font-medium"><span className="bg-white/20 px-2 py-0.5 rounded text-xs backdrop-blur-sm border border-white/10">{tripData.dates.split('-')[0]}</span><span className="hidden md:inline">| {tripData.subtitle}</span></div>
          <h1 className="text-3xl md:text-6xl font-bold leading-tight drop-shadow-sm mb-4">{tripData.title}</h1>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">{participants.map(p => (<img key={p.id} src={p.avatar} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white/20" alt={p.name} title={p.name} />))}</div>
            <button onClick={() => setIsAddPersonOpen(true)} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors border border-white/10 text-white"><UserPlus size={16} /></button>
          </div>
        </div>
      </div>

      {showShareModal && <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-stone-900 text-white px-6 py-3 rounded-full text-sm shadow-xl z-50 animate-in fade-in zoom-in duration-300 flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400"/> 已複製連結！</div>}

      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden min-h-[60vh]">
          {/* Tabs */}
          <div className="hidden md:flex border-b border-stone-100 sticky top-0 bg-white z-30">
            <button onClick={() => setActiveTab('schedule')} className={`flex-1 py-5 font-bold text-lg flex justify-center items-center gap-2 transition-colors ${activeTab === 'schedule' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}><Calendar size={20}/> 行程規劃</button>
            <div className="w-px bg-stone-100 my-4"></div>
            <button onClick={() => setActiveTab('expenses')} className={`flex-1 py-5 font-bold text-lg flex justify-center items-center gap-2 transition-colors ${activeTab === 'expenses' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}><Wallet size={20}/> 預算記帳</button>
            <div className="w-px bg-stone-100 my-4"></div>
            <button onClick={() => setActiveTab('checklist')} className={`flex-1 py-5 font-bold text-lg flex justify-center items-center gap-2 transition-colors ${activeTab === 'checklist' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}><CheckSquare size={20}/> 行前清單</button>
          </div>
          <div className="md:hidden flex p-2 bg-stone-100/50 rounded-t-3xl border-b border-stone-200">
             <button onClick={() => setActiveTab('schedule')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'schedule' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}>行程</button>
             <button onClick={() => setActiveTab('expenses')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'expenses' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}>記帳</button>
             <button onClick={() => setActiveTab('checklist')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'checklist' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}>清單</button>
          </div>

          {/* Schedule */}
          {activeTab === 'schedule' && (
            <div className="pb-12">
              <div className="sticky top-0 md:top-[74px] z-20 bg-white/95 backdrop-blur-md border-b border-stone-100 pt-4 pb-2 px-4 md:px-8">
                <div className="flex justify-between items-end mb-3">
                  <div><h2 className="text-2xl font-bold text-stone-800">Day {currentDayData.day}</h2><p className="text-stone-400 text-sm">{currentDayData.date}</p></div>
                  <div className="px-3 py-1 bg-stone-50 rounded-full border border-stone-100 flex items-center gap-1.5 text-xs font-medium text-stone-600">{currentDayData.weather === 'snow' ? <span className="text-blue-400">❄️ 下雪</span> : <><Sun size={14} className="text-amber-400"/> 晴朗</>}</div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">{tripData.days.map((d) => (<button key={d.day} onClick={() => setActiveDay(d.day)} className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeDay === d.day ? "bg-stone-900 text-white shadow-md scale-105" : "bg-stone-100 text-stone-400 hover:bg-stone-200"}`}>Day {d.day}</button>))}</div>
              </div>
              <div className="px-4 md:px-8 py-8">
                <div className="relative border-l-2 border-stone-200 ml-3 md:ml-4 space-y-10 pl-8 md:pl-10 py-2">
                  {currentDayData.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id} className="relative group">
                        <div className={`absolute -left-[41px] md:-left-[49px] top-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${item.type === 'transport' ? 'bg-blue-500 text-white' : item.type === 'food' ? 'bg-orange-500 text-white' : item.type === 'sightseeing' ? 'bg-emerald-500 text-white' : item.type === 'info' ? 'bg-red-500 text-white' : 'bg-stone-400 text-white'}`}><Icon size={14} strokeWidth={3} /></div>
                        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow p-5 relative overflow-hidden">
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.type === 'transport' ? 'bg-blue-500' : item.type === 'food' ? 'bg-orange-500' : item.type === 'sightseeing' ? 'bg-emerald-500' : item.type === 'info' ? 'bg-red-500' : 'bg-stone-400'}`}></div>
                          <div className="flex justify-between items-start mb-2 pl-2">
                            <span className="text-xs font-bold text-stone-400 flex items-center gap-1 bg-stone-50 px-2 py-1 rounded"><Clock size={12}/> {item.time}</span>
                            <Tag type={item.type} />
                          </div>
                          <div className="pl-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleItemClick(item)}>
                            <h3 className="text-lg font-bold text-stone-800 mb-1 flex items-center gap-2">{item.title}{item.location && item.type !== 'food' && <Navigation size={14} className="text-blue-500" />}{item.type === 'food' && <Sparkles size={14} className="text-orange-500" />}</h3>
                            <p className="text-sm text-stone-600 mb-3 flex items-start gap-1.5"><MapPin size={14} className="mt-0.5 shrink-0 text-stone-400"/> {item.note}</p>
                            {item.desc && <div className="text-xs text-stone-500 bg-stone-50 p-3 rounded-xl leading-relaxed mb-4 whitespace-pre-line">{item.desc}</div>}
                          </div>
                          <div className="flex gap-2">
                            {item.location && (<button onClick={() => copyAddress(item.location, item.id)} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${copiedId === item.id ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>{copiedId === item.id ? <CheckCircle2 size={14}/> : <Copy size={14}/>} 複製地址</button>)}
                            {item.link && (<a href={item.link} target="_blank" rel="noreferrer" className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 bg-stone-900 text-white hover:bg-stone-700 transition-colors"><ExternalLink size={14}/> 查看詳情</a>)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="relative pl-2"><div className="absolute -left-[35px] md:-left-[43px] top-1.5 w-4 h-4 bg-stone-300 rounded-full border-2 border-white"></div><p className="text-xs text-stone-400 italic">行程結束，晚安！</p></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Expenses */}
          {activeTab === 'expenses' && (
            <div className="p-6 md:p-10 space-y-8">
              <div className="bg-stone-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <Wallet size={160} className="absolute -right-8 -bottom-8 text-white/5" /><p className="text-xs font-bold text-stone-400 tracking-widest uppercase mb-1">Total Budget</p>
                <div className="flex items-center gap-2 mb-6"><span className="text-4xl font-bold">${totalSpent.toLocaleString()}</span><span className="text-stone-500 text-lg">/ {budget.toLocaleString()}</span><button onClick={() => setIsEditingBudget(!isEditingBudget)} className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Edit3 size={14}/></button></div>
                {isEditingBudget && (<div className="mb-4 flex gap-2 animate-in fade-in slide-in-from-top-2"><input type="number" value={newBudgetInput} onChange={(e) => setNewBudgetInput(e.target.value)} className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-white focus:outline-none w-32" /><button onClick={() => { setBudget(parseInt(newBudgetInput)); setIsEditingBudget(false); }} className="bg-green-500 px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-600">儲存</button></div>)}
                <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden mb-2"><div className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ${budgetPercentage > 90 ? 'bg-red-500' : 'bg-emerald-400'}`} style={{ width: `${budgetPercentage}%` }}></div></div>
                <div className="flex justify-between text-xs text-stone-400"><span>已使用 {Math.round(budgetPercentage)}%</span><span>剩餘 ${ (budget - totalSpent).toLocaleString() }</span></div>
              </div>
              <button onClick={() => setIsAddExpenseOpen(true)} className="w-full py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-colors flex items-center justify-center gap-2 border border-stone-200 border-dashed"><PlusCircle size={20}/> 新增一筆消費</button>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><ArrowRightLeft size={18} /> 智慧結算</h3>
                {debts.length === 0 ? <p className="text-stone-400 text-sm text-center py-4">目前沒有款項需結算</p> : (<div className="space-y-3">{debts.map((debt, idx) => (<div key={idx} className="flex items-center justify-between text-sm p-3 bg-stone-50 rounded-xl"><div className="flex items-center gap-2"><img src={debt.from.avatar} className="w-6 h-6 rounded-full" alt={debt.from.name} /><span className="font-bold text-stone-700">{debt.from.name}</span></div><span className="text-xs text-stone-400">給</span><div className="flex items-center gap-2"><img src={debt.to.avatar} className="w-6 h-6 rounded-full" alt={debt.to.name} /><span className="font-bold text-stone-700">{debt.to.name}</span></div><span className="font-bold text-stone-800">${debt.amount.toLocaleString()}</span></div>))}</div>)}
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-stone-800 text-lg">消費紀錄</h3>
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex justify-between items-center p-4 bg-white border border-stone-100 rounded-2xl hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-500"><Wallet size={18}/></div><div><p className="font-bold text-stone-800">{exp.title}</p><div className="flex items-center gap-1 text-xs text-stone-400"><span>{exp.date}</span><span className="text-stone-300 mx-1">•</span><span>{participants.find(p => p.id === exp.payerId)?.name} 付款</span><span className="text-stone-300 mx-1">•</span><span>{exp.beneficiaryIds && exp.beneficiaryIds.length === participants.length ? (isEqualSplit(exp) ? "全員分攤" : `全員分攤 (比例 ${getRatioString(exp)})`) : `由 ${exp.beneficiaryIds ? exp.beneficiaryIds.length : participants.length} 人分攤 ${!isEqualSplit(exp) ? `(比例 ${getRatioString(exp)})` : ''}`}</span></div></div></div>
                    <div className="flex items-center gap-3"><span className="font-bold text-stone-900">${exp.amount.toLocaleString()}</span><button onClick={() => handleDeleteExpense(exp.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18} /></button></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Checklist */}
          {activeTab === 'checklist' && (
             <div className="p-6 md:p-10 space-y-8 min-h-[60vh]">
               <div className="flex justify-between items-end mb-4"><div><h2 className="text-2xl font-bold text-stone-800">行李清單</h2><p className="text-stone-400 text-sm mt-1">Checklist before you go</p></div></div>
               {packingList.map((category, catIdx) => (
                 <div key={catIdx} className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
                   <h3 className="font-bold text-stone-700 mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-stone-400 rounded-full"></div> {category.category}</h3>
                   <div className="space-y-3">
                     {category.items.map((item) => (
                       <div key={item.id} className="flex items-center justify-between group">
                         <div className="flex items-center gap-3 cursor-pointer" onClick={() => togglePackingItem(category.category, item.id)}>
                           <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-stone-800 border-stone-800' : 'border-stone-300 bg-white'}`}>{item.checked && <CheckCircle2 size={14} className="text-white" />}</div>
                           <span className={`text-sm transition-all ${item.checked ? 'text-stone-400 line-through' : 'text-stone-700'}`}>{item.name}</span>
                         </div>
                         <button onClick={async () => {
                           // Find doc id and delete
                           const itemRef = doc(db, 'artifacts', tripData.id, 'public', 'data', 'packing-list', item.id);
                           await deleteDoc(itemRef);
                         }} className="text-stone-300 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                       </div>
                     ))}
                     <div className="flex gap-2 mt-4 pt-2 border-t border-stone-200/50">
                        <input type="text" placeholder="新增項目..." className="flex-1 bg-transparent text-sm focus:outline-none" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') handleAddPackingItem(category.category); }} />
                        <button onClick={() => handleAddPackingItem(category.category)} className="text-stone-400 hover:text-stone-800"><PlusCircle size={16}/></button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-3 pb-safe z-50 flex justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('schedule')} className={`flex flex-col items-center transition-colors ${activeTab === 'schedule' ? 'text-stone-900' : 'text-stone-400'}`}><Calendar size={24}/><span className="text-[10px] mt-1 font-medium">行程</span></button>
        <button onClick={() => { if(activeTab === 'expenses') setIsAddExpenseOpen(true); else setActiveTab('expenses'); }} className={`flex flex-col items-center transition-colors ${activeTab === 'expenses' ? 'text-stone-900' : 'text-stone-400'}`}>
          {activeTab === 'expenses' ? <PlusCircle size={24}/> : <Wallet size={24}/>}
          <span className="text-[10px] mt-1 font-medium">{activeTab === 'expenses' ? '新增' : '記帳'}</span>
        </button>
        <button onClick={() => setActiveTab('checklist')} className={`flex flex-col items-center transition-colors ${activeTab === 'checklist' ? 'text-stone-900' : 'text-stone-400'}`}><CheckSquare size={24}/><span className="text-[10px] mt-1 font-medium">清單</span></button>
      </div>

      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-[70] bg-stone-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom-20 relative">
            <button onClick={() => setIsAddExpenseOpen(false)} className="absolute top-4 right-4 p-2 bg-stone-100 rounded-full text-stone-500"><X size={20}/></button>
            <h3 className="text-xl font-bold mb-6">新增消費</h3>
            <div className="space-y-4">
              <input type="text" placeholder="項目名稱 (如: 晚餐)" className="w-full p-4 bg-stone-50 rounded-xl border border-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900" value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} autoFocus />
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">$</span><input type="number" placeholder="0" className="w-full p-4 pl-8 bg-stone-50 rounded-xl border border-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900 font-bold text-lg" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} /></div>
              
              {/* 付款人選擇 */}
              <div>
                <p className="text-xs text-stone-400 mb-2 font-bold uppercase">誰先付錢?</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">{participants.map(p => (<button key={p.id} onClick={() => setNewExpense({...newExpense, payerId: p.id})} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${newExpense.payerId === p.id ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-200'}`}><img src={p.avatar} className="w-5 h-5 rounded-full" alt=""/> <span className="text-xs font-bold">{p.name}</span></button>))}</div>
              </div>

              {/* 分攤對象選擇 */}
              <div>
                <p className="text-xs text-stone-400 mb-2 font-bold uppercase">分攤給誰?</p>
                <div className="flex flex-col gap-2">
                    {participants.map(p => {
                        const isSelected = newExpense.beneficiaryIds.includes(p.id);
                        return (
                            <div key={p.id} className="flex items-center justify-between p-2 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors">
                                <button onClick={() => toggleBeneficiary(p.id)} className={`flex items-center gap-3 flex-1 ${isSelected ? 'opacity-100' : 'opacity-50'}`}><img src={p.avatar} className="w-8 h-8 rounded-full" alt=""/> <span className="text-sm font-bold">{p.name}</span></button>
                                {isSelected && (<div className="flex items-center gap-2"><span className="text-xs text-stone-400 font-bold">權重</span><input type="number" className="w-12 p-1 text-center bg-white border border-stone-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-stone-900" value={newExpense.splitWeights?.[p.id] || 1} onChange={(e) => handleWeightChange(p.id, e.target.value)} step="0.5" min="0" /></div>)}
                            </div>
                        );
                    })}
                </div>
              </div>

              <button onClick={handleAddExpense} className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold text-lg hover:bg-stone-800 transition-colors shadow-lg">確認新增</button>
            </div>
          </div>
        </div>
      )}

      {isAddPersonOpen && (
        <div className="fixed inset-0 z-[80] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-center">
             <button onClick={() => setIsAddPersonOpen(false)} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600"><X size={20}/></button>
             <div className="mb-6 text-left">
                <h4 className="text-sm font-bold text-stone-500 mb-3 uppercase tracking-wider">目前成員</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {participants.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 bg-stone-50 rounded-xl">
                      <div className="flex items-center gap-3"><img src={p.avatar} className="w-8 h-8 rounded-full" alt={p.name} /><span className="font-medium text-stone-700">{p.name}</span></div>
                      <button onClick={() => handleRemovePerson(p.docId)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="移除"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
             </div>
             <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400"><UserPlus size={32}/></div>
             <h3 className="text-lg font-bold mb-4">新增旅伴</h3>
             <input type="text" placeholder="輸入名字..." className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl mb-4 text-center focus:outline-none focus:ring-2 focus:ring-stone-900" value={newPersonName} onChange={e => setNewPersonName(e.target.value)} />
             <button onClick={handleAddPerson} className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold">加入行程</button>
          </div>
        </div>
      )}

      {selectedItem && (
        <ItemDetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
};

// --- 3. 主程式入口 (App) ---

export default function App() {
  const [screen, setScreen] = useState('list'); // list, login, dashboard
  const [selectedTripId, setSelectedTripId] = useState(null);

  // Load auth state from local storage on mount
  useEffect(() => {
    // Optional: Auto-login logic
  }, []);

  const handleSelectTrip = (id) => {
    setSelectedTripId(id);
    // Check if already authenticated for this trip in session?
    setScreen('login');
  };

  const handleUnlock = () => {
    setScreen('dashboard');
  };

  const handleBack = () => {
    setSelectedTripId(null);
    setScreen('list');
  };

  const getTripInfo = (id) => TRIP_REGISTRY.find(t => t.id === id);

  return (
    <div className="font-sans text-stone-700 antialiased selection:bg-stone-200">
      {screen === 'list' && <TripListScreen onSelectTrip={handleSelectTrip} />}
      
      {screen === 'login' && selectedTripId && (
        <TripLoginScreen 
          tripInfo={getTripInfo(selectedTripId)} 
          onUnlock={handleUnlock} 
          onBack={handleBack}
        />
      )}

      {screen === 'dashboard' && selectedTripId && (
        <TripDashboard 
          tripId={selectedTripId} 
          tripInfo={getTripInfo(selectedTripId)}
          onBack={handleBack} 
        />
      )}
    </div>
  );
}