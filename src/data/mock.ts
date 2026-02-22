// ===== DEMO USERS =====
export interface DemoUser {
  id: string;
  name: string;
  initial: string;
  role: string;
  county: string;
  country: string;
  isDemo: boolean;
}

export const demoUsers: DemoUser[] = [
  { id: "u1", name: "James Kamau", initial: "J", role: "Farmer", county: "Machakos", country: "Kenya", isDemo: true },
  { id: "u2", name: "Mary Wanjiku", initial: "M", role: "Buyer", county: "Kiambu", country: "Kenya", isDemo: true },
  { id: "u3", name: "Peter Ochieng", initial: "P", role: "Trader", county: "Kisumu", country: "Kenya", isDemo: true },
  { id: "u4", name: "Grace Muthoni", initial: "G", role: "Farmer", county: "Kajiado", country: "Kenya", isDemo: true },
  { id: "u5", name: "Hassan Ali", initial: "H", role: "Supplier", county: "Garissa", country: "Kenya", isDemo: true },
  { id: "u6", name: "Sarah Njeri", initial: "S", role: "Farmer", county: "Nyeri", country: "Kenya", isDemo: true },
  { id: "u7", name: "Agnes Wambui", initial: "A", role: "Buyer", county: "Murang'a", country: "Kenya", isDemo: true },
  { id: "u8", name: "David Kipchoge", initial: "D", role: "Trader", county: "Uasin Gishu", country: "Kenya", isDemo: true },
  { id: "u9", name: "Blessing Achieng", initial: "B", role: "Expert / Advisor", county: "Nairobi", country: "Kenya", isDemo: true },
  { id: "u10", name: "John Mutua", initial: "J", role: "Farmer", county: "Machakos", country: "Kenya", isDemo: true },
  { id: "u11", name: "Nakato Florence", initial: "N", role: "Farmer", county: "Wakiso", country: "Uganda", isDemo: true },
  { id: "u12", name: "Okello Samuel", initial: "O", role: "Trader", county: "Kampala", country: "Uganda", isDemo: true },
  { id: "u13", name: "Namugga Irene", initial: "N", role: "Buyer", county: "Jinja", country: "Uganda", isDemo: true },
  { id: "u14", name: "Ssempala Moses", initial: "S", role: "Supplier", county: "Mbale", country: "Uganda", isDemo: true },
  { id: "u15", name: "Apio Judith", initial: "A", role: "Service Provider", county: "Gulu", country: "Uganda", isDemo: true },
  { id: "u16", name: "Baraka Mwamba", initial: "B", role: "Farmer", county: "Arusha", country: "Tanzania", isDemo: true },
  { id: "u17", name: "Rehema Salim", initial: "R", role: "Trader", county: "Dar es Salaam", country: "Tanzania", isDemo: true },
  { id: "u18", name: "Juma Hamisi", initial: "J", role: "Farmer", county: "Mwanza", country: "Tanzania", isDemo: true },
  { id: "u19", name: "Neema Chacha", initial: "N", role: "Buyer", county: "Dodoma", country: "Tanzania", isDemo: true },
  { id: "u20", name: "Zawadi Kimaro", initial: "Z", role: "Expert / Advisor", county: "Mbeya", country: "Tanzania", isDemo: true },
  { id: "u21", name: "Chinedu Okafor", initial: "C", role: "Farmer", county: "Lagos", country: "Nigeria", isDemo: true },
  { id: "u22", name: "Amina Bello", initial: "A", role: "Trader", county: "Kano", country: "Nigeria", isDemo: true },
  { id: "u23", name: "Emeka Nwosu", initial: "E", role: "Supplier", county: "Abuja", country: "Nigeria", isDemo: true },
  { id: "u24", name: "Funke Adeyemi", initial: "F", role: "Buyer", county: "Ibadan", country: "Nigeria", isDemo: true },
  { id: "u25", name: "Yusuf Abubakar", initial: "Y", role: "Farmer", county: "Kaduna", country: "Nigeria", isDemo: true },
  { id: "u26", name: "Kwame Mensah", initial: "K", role: "Farmer", county: "Kumasi", country: "Ghana", isDemo: true },
  { id: "u27", name: "Ama Darko", initial: "A", role: "Trader", county: "Accra", country: "Ghana", isDemo: true },
  { id: "u28", name: "Kofi Asante", initial: "K", role: "Supplier", county: "Tamale", country: "Ghana", isDemo: true },
  { id: "u29", name: "Abena Osei", initial: "A", role: "Buyer", county: "Cape Coast", country: "Ghana", isDemo: true },
  { id: "u30", name: "Fatuma Hassan", initial: "F", role: "Service Provider", county: "Mombasa", country: "Kenya", isDemo: true },
];

// ===== MARKETPLACE MOCK DATA =====
export const marketplaceCategories = [
  "Crops", "Livestock", "Inputs", "Equipment",
  "Grains", "Vegetables", "Fruits", "Cash Crops", "Tubers",
  "Cattle", "Goats", "Poultry",
  "Seeds", "Fertilizers", "Pesticides",
  "Tractors", "Sprayers", "Storage"
] as const;

export const products = [
  { id: "1", title: "Fresh Maize (50kg)", price: 3500, currency: "KES", image: "/placeholder.svg", seller: "James Kamau", country: "Kenya", county: "Machakos", category: "Crops" },
  { id: "2", title: "Dairy Cow – Holstein Friesian", price: 120000, currency: "KES", image: "/placeholder.svg", seller: "Mary Wanjiku", country: "Kenya", county: "Kiambu", category: "Livestock" },
  { id: "3", title: "NPK Fertilizer (25kg)", price: 4200, currency: "KES", image: "/placeholder.svg", seller: "AgroInputs Ltd", country: "Kenya", county: "Nairobi", category: "Inputs" },
  { id: "4", title: "Hand Sprayer – 16L", price: 2800, currency: "KES", image: "/placeholder.svg", seller: "FarmTools Kenya", country: "Kenya", county: "Nakuru", category: "Equipment" },
  { id: "5", title: "Tomatoes (20kg crate)", price: 1500, currency: "KES", image: "/placeholder.svg", seller: "Grace Muthoni", country: "Kenya", county: "Kajiado", category: "Crops" },
  { id: "6", title: "Galla Goat – Female", price: 15000, currency: "KES", image: "/placeholder.svg", seller: "Hassan Ali", country: "Kenya", county: "Garissa", category: "Livestock" },
  { id: "7", title: "Drip Irrigation Kit", price: 8500, currency: "KES", image: "/placeholder.svg", seller: "IrriTech Solutions", country: "Kenya", county: "Nairobi", category: "Equipment" },
  { id: "8", title: "Hybrid Maize Seeds (2kg)", price: 650, currency: "KES", image: "/placeholder.svg", seller: "SeedCo Kenya", country: "Kenya", county: "Trans Nzoia", category: "Inputs" },
  { id: "9", title: "Organic Avocados (10kg)", price: 2200, currency: "KES", image: "/placeholder.svg", seller: "Sarah Njeri", country: "Kenya", county: "Nyeri", category: "Crops" },
  { id: "10", title: "Kienyeji Chicken (Batch of 10)", price: 8000, currency: "KES", image: "/placeholder.svg", seller: "Agnes Wambui", country: "Kenya", county: "Murang'a", category: "Livestock" },
  { id: "11", title: "Wheat Flour (90kg)", price: 5800, currency: "KES", image: "/placeholder.svg", seller: "David Kipchoge", country: "Kenya", county: "Uasin Gishu", category: "Grains" },
  { id: "12", title: "Sweet Potatoes (50kg)", price: 2500, currency: "KES", image: "/placeholder.svg", seller: "John Mutua", country: "Kenya", county: "Machakos", category: "Tubers" },
  { id: "13", title: "Robusta Coffee (25kg)", price: 45000, currency: "UGX", image: "/placeholder.svg", seller: "Nakato Florence", country: "Uganda", county: "Wakiso", category: "Cash Crops" },
  { id: "14", title: "Matoke Bananas (Bunch)", price: 15000, currency: "UGX", image: "/placeholder.svg", seller: "Okello Samuel", country: "Uganda", county: "Kampala", category: "Fruits" },
  { id: "15", title: "Fresh Cassava (100kg)", price: 80000, currency: "UGX", image: "/placeholder.svg", seller: "Namugga Irene", country: "Uganda", county: "Jinja", category: "Tubers" },
  { id: "16", title: "Hass Avocado Seedlings (50)", price: 75000, currency: "TZS", image: "/placeholder.svg", seller: "Baraka Mwamba", country: "Tanzania", county: "Arusha", category: "Seeds" },
  { id: "17", title: "Sisal Fibre (Bale)", price: 120000, currency: "TZS", image: "/placeholder.svg", seller: "Rehema Salim", country: "Tanzania", county: "Dar es Salaam", category: "Cash Crops" },
  { id: "18", title: "Nile Tilapia Fingerlings (500)", price: 250000, currency: "TZS", image: "/placeholder.svg", seller: "Juma Hamisi", country: "Tanzania", county: "Mwanza", category: "Livestock" },
  { id: "19", title: "Yam Tubers (100kg)", price: 45000, currency: "NGN", image: "/placeholder.svg", seller: "Chinedu Okafor", country: "Nigeria", county: "Lagos", category: "Tubers" },
  { id: "20", title: "Palm Oil (25 litres)", price: 35000, currency: "NGN", image: "/placeholder.svg", seller: "Emeka Nwosu", country: "Nigeria", county: "Abuja", category: "Cash Crops" },
  { id: "21", title: "Sorghum Grain (50kg)", price: 28000, currency: "NGN", image: "/placeholder.svg", seller: "Amina Bello", country: "Nigeria", county: "Kano", category: "Grains" },
  { id: "22", title: "Cocoa Beans (50kg)", price: 850, currency: "GHS", image: "/placeholder.svg", seller: "Kwame Mensah", country: "Ghana", county: "Kumasi", category: "Cash Crops" },
  { id: "23", title: "Shea Butter (20kg)", price: 400, currency: "GHS", image: "/placeholder.svg", seller: "Kofi Asante", country: "Ghana", county: "Tamale", category: "Cash Crops" },
  { id: "24", title: "Pineapples (50 pieces)", price: 300, currency: "GHS", image: "/placeholder.svg", seller: "Ama Darko", country: "Ghana", county: "Accra", category: "Fruits" },
  { id: "25", title: "Knapsack Sprayer – 20L", price: 3200, currency: "KES", image: "/placeholder.svg", seller: "FarmTools Kenya", country: "Kenya", county: "Nakuru", category: "Sprayers" },
  { id: "26", title: "Mini Tractor – 25HP", price: 950000, currency: "KES", image: "/placeholder.svg", seller: "AgriMech Kenya", country: "Kenya", county: "Nairobi", category: "Tractors" },
  { id: "27", title: "Grain Storage Silo (5 ton)", price: 185000, currency: "KES", image: "/placeholder.svg", seller: "CoolStore Kenya", country: "Kenya", county: "Nairobi", category: "Storage" },
  { id: "28", title: "Organic Pesticide (5L)", price: 1800, currency: "KES", image: "/placeholder.svg", seller: "Blessing Achieng", country: "Kenya", county: "Nairobi", category: "Pesticides" },
];

// ===== COMMUNITY MOCK DATA =====
export const communityPosts = [
  { id: "1", author: "James Kamau", avatar: "/placeholder.svg", county: "Machakos", country: "Kenya", content: "My pawpaw tree has been struggling with powdery mildew. Anyone had success treating this organically? 🌱", tags: ["#Pawpaw", "#OrganicFarming"], upvotes: 24, comments: 8, time: "2 hours ago", isDemo: true },
  { id: "2", author: "Sarah Njeri", avatar: "/placeholder.svg", county: "Nyeri", country: "Kenya", content: "Great harvest this season! 🌽 Maize prices are looking good. Who else is seeing better yields with the new hybrid seeds?", tags: ["#Maize", "#Harvest"], upvotes: 45, comments: 12, time: "4 hours ago", isDemo: true },
  { id: "3", author: "Peter Ochieng", avatar: "/placeholder.svg", county: "Kisumu", country: "Kenya", content: "⚠️ Fall armyworm spotted in my area. Please check your fields! Using neem-based spray and it's working well.", tags: ["#PestAlert", "#Maize"], upvotes: 67, comments: 23, time: "6 hours ago", isDemo: true },
  { id: "4", author: "Agnes Wambui", avatar: "/placeholder.svg", county: "Murang'a", country: "Kenya", content: "Just started dairy farming. Any tips on managing Holstein Friesians in highland areas? The cold mornings worry me.", tags: ["#Dairy", "#Livestock"], upvotes: 18, comments: 15, time: "8 hours ago", isDemo: true },
  { id: "5", author: "Nakato Florence", avatar: "/placeholder.svg", county: "Wakiso", country: "Uganda", content: "Coffee prices hit record high this month! If you're growing Robusta, now is the time to sell. 💰", tags: ["#Coffee", "#MarketPrices"], upvotes: 52, comments: 9, time: "10 hours ago", isDemo: true },
  { id: "6", author: "Chinedu Okafor", avatar: "/placeholder.svg", county: "Lagos", country: "Nigeria", content: "Successfully tested aquaponics system on my small farm. Fish + vegetables growing together. Happy to share my setup details!", tags: ["#Aquaponics", "#Innovation"], upvotes: 89, comments: 31, time: "12 hours ago", isDemo: true },
  { id: "7", author: "Kwame Mensah", avatar: "/placeholder.svg", county: "Kumasi", country: "Ghana", content: "Our cocoa cooperative just received Fair Trade certification! This means better prices for all 200+ members. 🎉", tags: ["#Cocoa", "#FairTrade"], upvotes: 112, comments: 18, time: "1 day ago", isDemo: true },
  { id: "8", author: "Baraka Mwamba", avatar: "/placeholder.svg", county: "Arusha", country: "Tanzania", content: "Hass avocado export season starting soon. Looking for reliable transport from Arusha to Dar port. Any recommendations?", tags: ["#Avocado", "#Export", "#Transport"], upvotes: 33, comments: 14, time: "1 day ago", isDemo: true },
  { id: "9", author: "Amina Bello", avatar: "/placeholder.svg", county: "Kano", country: "Nigeria", content: "Sorghum harvest was excellent this year. The drought-resistant variety from IITA performed beyond expectations in our dry conditions.", tags: ["#Sorghum", "#DroughtResistant"], upvotes: 41, comments: 7, time: "2 days ago", isDemo: true },
  { id: "10", author: "Fatuma Hassan", avatar: "/placeholder.svg", county: "Mombasa", country: "Kenya", content: "Started a women's poultry cooperative in Mombasa. 15 members so far. Looking for partners for bulk feed purchase.", tags: ["#Poultry", "#WomenInAg", "#Cooperative"], upvotes: 76, comments: 22, time: "2 days ago", isDemo: true },
];

// ===== ASK AGRI Q&A MOCK DATA =====
export const questions = [
  { id: "1", question: "How do I treat powdery mildew on pawpaw trees?", author: "James Kamau", tags: ["Pawpaw", "Disease"], upvotes: 32, answers: 5, bestAnswer: "Apply a mixture of baking soda (1 tbsp) and water (1 gallon) with a few drops of dish soap. Spray every 7 days. Also improve air circulation around the tree.", time: "1 day ago", followed: true },
  { id: "2", question: "What's the best spacing for maize in Machakos County?", author: "John Mutua", tags: ["Maize", "Planting"], upvotes: 18, answers: 3, bestAnswer: "For Machakos semi-arid conditions: 75cm between rows and 25cm between plants. Use drought-tolerant varieties like KDV1.", time: "2 days ago", followed: false },
  { id: "3", question: "When should I vaccinate my goats against PPR?", author: "Fatuma Hassan", tags: ["Livestock", "Goats"], upvotes: 25, answers: 4, bestAnswer: "Vaccinate kids at 4 months of age. Booster annually. Best done before the rainy season when disease risk increases.", time: "3 days ago", followed: false },
  { id: "4", question: "Best organic fertilizer for tomatoes in highland areas?", author: "Sarah Njeri", tags: ["Tomatoes", "Organic"], upvotes: 29, answers: 6, bestAnswer: "Compost mixed with bone meal works great. Apply 2kg per plant at transplanting. Top dress with liquid manure every 2 weeks.", time: "4 days ago", followed: true },
  { id: "5", question: "How to start a poultry business with limited capital?", author: "Fatuma Hassan", tags: ["Poultry", "Business"], upvotes: 44, answers: 8, bestAnswer: "Start with 50 improved Kienyeji chickens. Build a simple structure from local materials. Focus on egg production first — lower risk than broilers.", time: "5 days ago", followed: false },
  { id: "6", question: "What's the recommended pH for coffee growing in Uganda?", author: "Nakato Florence", tags: ["Coffee", "Soil"], upvotes: 15, answers: 3, bestAnswer: "Robusta coffee thrives in pH 5.0–6.5. Test your soil first and apply agricultural lime if too acidic. Mulching helps maintain pH over time.", time: "1 week ago", followed: false },
  { id: "7", question: "How do I set up a drip irrigation system for a 1-acre farm?", author: "Baraka Mwamba", tags: ["Irrigation", "Equipment"], upvotes: 37, answers: 5, bestAnswer: "You'll need a 5000L tank elevated 2m, main line (32mm), sub-mains (25mm), and drip lines (16mm with 30cm spacing). Budget ~KES 85,000.", time: "1 week ago", followed: true },
  { id: "8", question: "Best practices for storing cocoa beans after harvest?", author: "Kwame Mensah", tags: ["Cocoa", "Post-Harvest"], upvotes: 22, answers: 4, bestAnswer: "Ferment for 5-7 days, then dry to 7% moisture. Store in jute bags on pallets, off the ground. Keep warehouse ventilated below 25°C.", time: "1 week ago", followed: false },
];

// ===== SERVICES MOCK DATA =====
export const serviceCategories = ["Veterinary", "Transport", "Equipment Rental", "Farm Labor", "Storage", "Insurance & Finance"] as const;

export const services = [
  { id: "1", provider: "Dr. Wanjala Vet Services", category: "Veterinary", rating: 4.8, area: "Machakos, Kiambu", description: "Large and small animal care, vaccinations, AI services." },
  { id: "2", provider: "FastTrack Agri Transport", category: "Transport", rating: 4.5, area: "Nairobi, Machakos, Kajiado", description: "Refrigerated and standard farm produce transport." },
  { id: "3", provider: "FarmGear Rentals", category: "Equipment Rental", rating: 4.3, area: "Nakuru, Nairobi", description: "Tractors, ploughs, sprayers available daily/weekly." },
  { id: "4", provider: "GreenHands Labor", category: "Farm Labor", rating: 4.6, area: "Kiambu, Murang'a", description: "Skilled farm workers for planting, weeding, harvesting." },
  { id: "5", provider: "CoolStore Kenya", category: "Storage", rating: 4.7, area: "Nairobi, Mombasa", description: "Cold storage and warehouse facilities for perishables." },
  { id: "6", provider: "AgriFinance Plus", category: "Insurance & Finance", rating: 4.4, area: "Nationwide", description: "Crop insurance, farm loans, and savings products." },
  { id: "7", provider: "Dr. Amina Animal Clinic", category: "Veterinary", rating: 4.9, area: "Garissa, Mombasa", description: "Livestock health, deworming, and emergency services." },
  { id: "8", provider: "SafeHaul Logistics", category: "Transport", rating: 4.6, area: "Kampala, Jinja, Mbale", description: "Cross-border produce transport with GPS tracking." },
  { id: "9", provider: "TractorHub East Africa", category: "Equipment Rental", rating: 4.5, area: "Nairobi, Nakuru, Eldoret", description: "Modern tractors and combine harvesters for hire." },
  { id: "10", provider: "HarvestGuard Insurance", category: "Insurance & Finance", rating: 4.3, area: "Kenya, Uganda, Tanzania", description: "Weather-indexed crop insurance for smallholders." },
];

// ===== NOTIFICATIONS MOCK DATA =====
export const notifications = [
  { id: "1", type: "message", text: "New message from James Kamau about Maize listing", time: "5 min ago", read: false },
  { id: "2", type: "price", text: "Maize prices up 5% this week in Machakos", time: "1 hour ago", read: false },
  { id: "3", type: "weather", text: "Rain expected tomorrow in your county", time: "2 hours ago", read: true },
  { id: "4", type: "community", text: "Peter Ochieng mentioned you in a post", time: "3 hours ago", read: true },
  { id: "5", type: "brief", text: "Your Daily Farm Brief is ready!", time: "6 hours ago", read: true },
];

// ===== WEATHER MOCK DATA =====
export const weatherData = {
  county: "Machakos",
  temperature: 24,
  condition: "Partly Cloudy",
  rainProbability: 35,
  forecast: [
    { day: "Mon", temp: 24, rain: 35, icon: "⛅" },
    { day: "Tue", temp: 22, rain: 60, icon: "🌧️" },
    { day: "Wed", temp: 23, rain: 40, icon: "⛅" },
    { day: "Thu", temp: 25, rain: 10, icon: "☀️" },
    { day: "Fri", temp: 26, rain: 5, icon: "☀️" },
    { day: "Sat", temp: 24, rain: 25, icon: "⛅" },
    { day: "Sun", temp: 23, rain: 45, icon: "🌦️" },
  ],
};

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
  // Global
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

// ===== SEARCH MOCK DATA =====
export const searchSuggestions = [
  "Maize prices", "Fertilizer NPK", "Dairy farming tips", "Tractor rental",
  "Tomato seeds", "Pest control", "Weather forecast", "Veterinary services",
  "Cocoa beans", "Avocado seedlings", "Poultry feed", "Drip irrigation",
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
  communityHighlights: [
    { author: "Peter Ochieng", preview: "Neem-based spray working well against armyworm...", engagement: "67 upvotes" },
    { author: "Kwame Mensah", preview: "Our cocoa cooperative just received Fair Trade cert...", engagement: "112 upvotes" },
  ],
};

// ===== HEMISPHERE DATA =====
export const southernHemisphereCountries = [
  "South Africa", "Mozambique", "Zimbabwe", "Zambia", "Malawi", "Madagascar",
  "Angola", "Burundi", "Australia", "Brazil",
];
