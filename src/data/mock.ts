// ===== MARKETPLACE MOCK DATA =====
export const marketplaceCategories = ["Crops", "Livestock", "Inputs", "Equipment"] as const;

export const products = [
  { id: "1", title: "Fresh Maize (50kg)", price: 3500, currency: "KES", image: "/placeholder.svg", seller: "James Kamau", country: "Kenya", county: "Machakos", category: "Crops" },
  { id: "2", title: "Dairy Cow – Holstein Friesian", price: 120000, currency: "KES", image: "/placeholder.svg", seller: "Mary Wanjiku", country: "Kenya", county: "Kiambu", category: "Livestock" },
  { id: "3", title: "NPK Fertilizer (25kg)", price: 4200, currency: "KES", image: "/placeholder.svg", seller: "AgroInputs Ltd", country: "Kenya", county: "Nairobi", category: "Inputs" },
  { id: "4", title: "Hand Sprayer – 16L", price: 2800, currency: "KES", image: "/placeholder.svg", seller: "FarmTools Kenya", country: "Kenya", county: "Nakuru", category: "Equipment" },
  { id: "5", title: "Tomatoes (20kg crate)", price: 1500, currency: "KES", image: "/placeholder.svg", seller: "Grace Muthoni", country: "Kenya", county: "Kajiado", category: "Crops" },
  { id: "6", title: "Goat – Galla Breed", price: 15000, currency: "KES", image: "/placeholder.svg", seller: "Hassan Ali", country: "Kenya", county: "Garissa", category: "Livestock" },
  { id: "7", title: "Drip Irrigation Kit", price: 8500, currency: "KES", image: "/placeholder.svg", seller: "IrriTech Solutions", country: "Kenya", county: "Nairobi", category: "Equipment" },
  { id: "8", title: "Hybrid Maize Seeds (2kg)", price: 650, currency: "KES", image: "/placeholder.svg", seller: "SeedCo Kenya", country: "Kenya", county: "Trans Nzoia", category: "Inputs" },
];

// ===== COMMUNITY MOCK DATA =====
export const communityPosts = [
  { id: "1", author: "Blessed Muriuki", avatar: "/placeholder.svg", county: "Machakos", country: "Kenya", content: "My pawpaw tree has been struggling with powdery mildew. Anyone had success treating this organically? 🌱", tags: ["#Pawpaw", "#OrganicFarming"], upvotes: 24, comments: 8, time: "2 hours ago" },
  { id: "2", author: "Sarah Njeri", avatar: "/placeholder.svg", county: "Kiambu", country: "Kenya", content: "Great harvest this season! 🌽 Maize prices are looking good. Who else is seeing better yields with the new hybrid seeds?", tags: ["#Maize", "#Harvest"], upvotes: 45, comments: 12, time: "4 hours ago" },
  { id: "3", author: "Peter Ochieng", avatar: "/placeholder.svg", county: "Kisumu", country: "Kenya", content: "⚠️ Fall armyworm spotted in my area. Please check your fields! Using neem-based spray and it's working well.", tags: ["#PestAlert", "#Maize", "#WeatherAlert"], upvotes: 67, comments: 23, time: "6 hours ago" },
  { id: "4", author: "Agnes Wambui", avatar: "/placeholder.svg", county: "Nyeri", country: "Kenya", content: "Just started dairy farming. Any tips on managing Holstein Friesians in highland areas? The cold mornings worry me.", tags: ["#Dairy", "#Livestock"], upvotes: 18, comments: 15, time: "8 hours ago" },
];

// ===== ASK AGRI Q&A MOCK DATA =====
export const questions = [
  { id: "1", question: "How do I treat powdery mildew on pawpaw trees?", author: "Blessed Muriuki", tags: ["Pawpaw", "Disease"], upvotes: 32, answers: 5, bestAnswer: "Apply a mixture of baking soda (1 tbsp) and water (1 gallon) with a few drops of dish soap. Spray every 7 days. Also improve air circulation around the tree.", time: "1 day ago", followed: true },
  { id: "2", question: "What's the best spacing for maize in Machakos County?", author: "John Mutua", tags: ["Maize", "Planting"], upvotes: 18, answers: 3, bestAnswer: "For Machakos semi-arid conditions: 75cm between rows and 25cm between plants. Use drought-tolerant varieties like KDV1.", time: "2 days ago", followed: false },
  { id: "3", question: "When should I vaccinate my goats against PPR?", author: "Fatuma Hassan", tags: ["Livestock", "Goats"], upvotes: 25, answers: 4, bestAnswer: "Vaccinate kids at 4 months of age. Booster annually. Best done before the rainy season when disease risk increases.", time: "3 days ago", followed: false },
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
  { name: "Kenya", counties: ["Nairobi", "Machakos", "Kiambu", "Nakuru", "Mombasa", "Kisumu", "Nyeri", "Kajiado", "Trans Nzoia", "Garissa", "Murang'a", "Uasin Gishu"] },
  { name: "Uganda", counties: ["Kampala", "Wakiso", "Jinja", "Mbale", "Gulu", "Mbarara"] },
  { name: "Tanzania", counties: ["Dar es Salaam", "Arusha", "Dodoma", "Mwanza", "Mbeya"] },
  { name: "Nigeria", counties: ["Lagos", "Abuja", "Kano", "Kaduna", "Ibadan"] },
  { name: "Ghana", counties: ["Accra", "Kumasi", "Tamale", "Cape Coast"] },
];

export const roles = ["Farmer", "Buyer", "Trader", "Supplier", "Service Provider", "Expert / Advisor"] as const;

export const currencies = [
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵" },
];

export const paymentMethods = [
  { id: "mpesa", name: "M-Pesa", icon: "📱" },
  { id: "visa", name: "Visa", icon: "💳" },
  { id: "unionpay", name: "UnionPay", icon: "💳" },
  { id: "paypal", name: "PayPal", icon: "🅿️" },
];

// ===== SEARCH MOCK DATA =====
export const searchSuggestions = [
  "Maize prices", "Fertilizer NPK", "Dairy farming tips", "Tractor rental",
  "Tomato seeds", "Pest control", "Weather forecast", "Veterinary services",
];

export const trendingTopics = ["#Maize", "#Dairy", "#WeatherAlert", "#OrganicFarming", "#Harvest2026", "#PestControl"];
