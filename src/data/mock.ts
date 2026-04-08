// ===== MARKETPLACE CATEGORIES =====
export const marketplaceCategories = [
  "Crops", "Livestock", "Inputs", "Equipment",
  "Grains", "Vegetables", "Fruits", "Cash Crops", "Tubers",
  "Cattle", "Goats", "Poultry",
  "Seeds", "Fertilizers", "Pesticides",
  "Tractors", "Sprayers", "Storage"
] as const;

// ===== COUNTRIES & COUNTIES =====
export const countries = [
  { name: "Kenya", flag: "🇰🇪", counties: ["Nairobi", "Machakos", "Kiambu", "Nakuru", "Mombasa", "Kisumu", "Nyeri", "Kajiado", "Trans Nzoia", "Garissa", "Murang'a", "Uasin Gishu", "Laikipia", "Nyandarua", "Meru", "Embu", "Tharaka-Nithi", "Kirinyaga", "Bungoma", "Kakamega", "Vihiga", "Siaya", "Homa Bay", "Migori", "Bomet", "Kericho", "Nandi", "Baringo", "Elgeyo-Marakwet", "West Pokot", "Turkana", "Samburu", "Isiolo", "Marsabit", "Mandera", "Wajir", "Tana River", "Lamu", "Kilifi", "Kwale", "Taita-Taveta", "Makueni", "Kitui", "Narok", "Nyamira", "Kisii", "Busia"] },
  { name: "Uganda", flag: "🇺🇬", counties: ["Kampala", "Wakiso", "Jinja", "Mbale", "Gulu", "Mbarara", "Fort Portal", "Soroti", "Lira", "Arua", "Masaka", "Entebbe"] },
  { name: "Tanzania", flag: "🇹🇿", counties: ["Dar es Salaam", "Arusha", "Dodoma", "Mwanza", "Mbeya", "Morogoro", "Tanga", "Zanzibar", "Kilimanjaro", "Iringa", "Mtwara", "Tabora"] },
  { name: "Nigeria", flag: "🇳🇬", counties: ["Lagos", "Abuja", "Kano", "Kaduna", "Ibadan", "Port Harcourt", "Enugu", "Benin City", "Jos", "Ilorin", "Abeokuta", "Owerri", "Sokoto", "Maiduguri", "Calabar"] },
  { name: "Ghana", flag: "🇬🇭", counties: ["Accra", "Kumasi", "Tamale", "Cape Coast", "Takoradi", "Sunyani", "Ho", "Koforidua", "Bolgatanga", "Wa"] },
  { name: "Ethiopia", flag: "🇪🇹", counties: ["Addis Ababa", "Dire Dawa", "Bahir Dar", "Hawassa", "Mekelle", "Jimma", "Adama", "Gondar"] },
  { name: "Rwanda", flag: "🇷🇼", counties: ["Kigali", "Butare", "Gisenyi", "Ruhengeri", "Gitarama"] },
  { name: "South Africa", flag: "🇿🇦", counties: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "Polokwane", "Nelspruit"] },
  { name: "Senegal", flag: "🇸🇳", counties: ["Dakar", "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor"] },
  { name: "Cameroon", flag: "🇨🇲", counties: ["Yaoundé", "Douala", "Bamenda", "Bafoussam", "Garoua", "Maroua"] },
  { name: "Côte d'Ivoire", flag: "🇨🇮", counties: ["Abidjan", "Yamoussoukro", "Bouaké", "San-Pédro", "Daloa"] },
  { name: "Mozambique", flag: "🇲🇿", counties: ["Maputo", "Beira", "Nampula", "Quelimane", "Chimoio"] },
  { name: "Zambia", flag: "🇿🇲", counties: ["Lusaka", "Kitwe", "Ndola", "Livingstone", "Kabwe"] },
  { name: "Zimbabwe", flag: "🇿🇼", counties: ["Harare", "Bulawayo", "Mutare", "Gweru", "Masvingo"] },
  { name: "Malawi", flag: "🇲🇼", counties: ["Lilongwe", "Blantyre", "Mzuzu", "Zomba"] },
  { name: "Mali", flag: "🇲🇱", counties: ["Bamako", "Sikasso", "Mopti", "Ségou"] },
  { name: "Burkina Faso", flag: "🇧🇫", counties: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou"] },
  { name: "Niger", flag: "🇳🇪", counties: ["Niamey", "Zinder", "Maradi", "Agadez"] },
  { name: "DR Congo", flag: "🇨🇩", counties: ["Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kisangani", "Goma"] },
  { name: "Madagascar", flag: "🇲🇬", counties: ["Antananarivo", "Toamasina", "Antsirabe", "Fianarantsoa"] },
  { name: "Angola", flag: "🇦🇴", counties: ["Luanda", "Huambo", "Lobito", "Benguela"] },
  { name: "Sudan", flag: "🇸🇩", counties: ["Khartoum", "Omdurman", "Port Sudan", "Kassala"] },
  { name: "Somalia", flag: "🇸🇴", counties: ["Mogadishu", "Hargeisa", "Kismayo", "Garowe"] },
  { name: "Burundi", flag: "🇧🇮", counties: ["Bujumbura", "Gitega", "Ngozi"] },
  { name: "Benin", flag: "🇧🇯", counties: ["Porto-Novo", "Cotonou", "Parakou"] },
  { name: "Togo", flag: "🇹🇬", counties: ["Lomé", "Sokodé", "Kara"] },
  { name: "Sierra Leone", flag: "🇸🇱", counties: ["Freetown", "Bo", "Kenema"] },
  { name: "Liberia", flag: "🇱🇷", counties: ["Monrovia", "Gbarnga", "Buchanan"] },
  { name: "Eritrea", flag: "🇪🇷", counties: ["Asmara", "Keren", "Massawa"] },
  { name: "Djibouti", flag: "🇩🇯", counties: ["Djibouti City"] },
  { name: "United States", flag: "🇺🇸", counties: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"] },
  { name: "United Kingdom", flag: "🇬🇧", counties: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow"] },
  { name: "India", flag: "🇮🇳", counties: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"] },
  { name: "China", flag: "🇨🇳", counties: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen"] },
  { name: "Brazil", flag: "🇧🇷", counties: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"] },
  { name: "Australia", flag: "🇦🇺", counties: ["Sydney", "Melbourne", "Brisbane", "Perth"] },
  { name: "Germany", flag: "🇩🇪", counties: ["Berlin", "Munich", "Hamburg", "Frankfurt"] },
  { name: "France", flag: "🇫🇷", counties: ["Paris", "Lyon", "Marseille", "Toulouse"] },
  { name: "Canada", flag: "🇨🇦", counties: ["Toronto", "Vancouver", "Montreal", "Calgary"] },
  { name: "Netherlands", flag: "🇳🇱", counties: ["Amsterdam", "Rotterdam", "The Hague"] },
];

export const roles = ["Farmer", "Buyer", "Trader", "Supplier", "Service Provider", "Expert / Advisor"] as const;

export const currencies = [
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh", flag: "🇺🇬" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", flag: "🇹🇿" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵", flag: "🇬🇭" },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br", flag: "🇪🇹" },
  { code: "RWF", name: "Rwandan Franc", symbol: "FRw", flag: "🇷🇼" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
  { code: "XOF", name: "West African CFA", symbol: "CFA", flag: "🇸🇳" },
  { code: "XAF", name: "Central African CFA", symbol: "FCFA", flag: "🇨🇲" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£", flag: "🇪🇬" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "MAD", flag: "🇲🇦" },
  { code: "MZN", name: "Mozambican Metical", symbol: "MT", flag: "🇲🇿" },
  { code: "ZMW", name: "Zambian Kwacha", symbol: "ZK", flag: "🇿🇲" },
  { code: "MWK", name: "Malawian Kwacha", symbol: "MK", flag: "🇲🇼" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
];

export const paymentMethods = [
  { id: "mpesa", name: "M-Pesa", icon: "M" },
  { id: "visa", name: "Visa", icon: "V" },
  { id: "mastercard", name: "Mastercard", icon: "MC" },
  { id: "paypal", name: "PayPal", icon: "PP" },
  { id: "unionpay", name: "UnionPay", icon: "UP" },
  { id: "airtel", name: "Airtel Money", icon: "AM" },
  { id: "mtn", name: "MTN Mobile Money", icon: "MTN" },
  { id: "bank", name: "Bank Transfer", icon: "BT" },
];

export const trendingTopics = ["#Maize", "#Dairy", "#WeatherAlert", "#OrganicFarming", "#Harvest2026", "#PestControl", "#CoffeeExport", "#Aquaponics"];

// ===== DAILY BRIEF DATA =====
export const dailyBriefData = {
  weather: { summary: "Light rain expected tomorrow in Machakos County. Temperatures 20-26°C. Humidity at 72%.", advisory: "Delay fertilizer application. Cover any freshly planted seeds." },
  marketPrices: [
    { crop: "Maize", price: "KES 3,500/50kg", change: "+5%", direction: "up" as const },
    { crop: "Tomatoes", price: "KES 75/kg", change: "-3%", direction: "down" as const },
    { crop: "Avocados", price: "KES 220/kg", change: "+12%", direction: "up" as const },
    { crop: "Coffee (Robusta)", price: "UGX 9,200/kg", change: "+8%", direction: "up" as const },
    { crop: "Cocoa", price: "GHS 17/kg", change: "+2%", direction: "up" as const },
    { crop: "Wheat", price: "KES 5,800/90kg", change: "0%", direction: "up" as const },
  ],
  tips: [
    { title: "Optimize Irrigation", content: "With rain expected, reduce irrigation by 50% this week. Save water and costs." },
    { title: "Pest Watch", content: "Fall armyworm season — scout fields early morning. Apply neem oil spray preventatively." },
    { title: "Market Timing", content: "Maize prices peaking — consider selling stored grain this week for best returns." },
  ],
  alerts: [
    { type: "pest", title: "Fall Armyworm Outbreak", description: "Reported in Kisumu, Siaya, and Homa Bay counties. Inspect maize fields immediately.", severity: "high" as const },
    { type: "disease", title: "Coffee Berry Disease", description: "Cases rising in central highlands. Apply copper-based fungicide.", severity: "medium" as const },
    { type: "weather", title: "Heavy Rains Forecast", description: "Above-normal rainfall expected in western Kenya next week.", severity: "low" as const },
  ],
  communityHighlights: [],
};

// ===== HEMISPHERE DATA =====
export const southernHemisphereCountries = [
  "South Africa", "Mozambique", "Zimbabwe", "Zambia", "Malawi", "Madagascar",
  "Angola", "Burundi", "Australia", "Brazil",
];
