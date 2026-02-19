

# AgriHubX – Global Agriculture Connection Platform

## Overview
A privacy-first agricultural platform connecting farmers, buyers, traders, suppliers, and service providers. Built with a clean, mobile-first design using Forest Green (#2E7D32), Agriculture Green (#388E3C), and Harvest Orange (#FF9800). Frontend prototype with mock data — no real backend initially.

---

## Phase 1: Foundation & Layout

### Navigation & Routing
- **Desktop top nav**: Logo, global search bar, links to Marketplace, Community, Ask Agri, Services, Notifications, Profile
- **Mobile bottom nav**: Home, Search, Marketplace, Community, Profile
- Responsive layout that adapts seamlessly between desktop and mobile
- Custom color theme (Forest Green, Agriculture Green, Harvest Orange)

### Authentication Flow (UI with mock logic)
- Signup page: Email, password, OTP verification UI
- Login page
- Onboarding wizard: Select country → Select county → Choose role(s) → Pick currency → Optional profile setup
- Currency options: KES, USD, EUR, GBP, etc.

---

## Phase 2: Core Pages

### 🏠 Dashboard (Home Page)
- **Hero section**: "Connect. Trade. Grow. Smarter." with Join Free & Explore Marketplace buttons
- **Daily Farm Brief card**: Weather icon, rain forecast, farming tip, market price highlight, community alert (mock data)
- **Weather widget**: Temperature, rain probability, 7-day forecast (based on profile county, not GPS)
- **4 Quick Action cards**: Marketplace, Agri Community, Ask Agri, Agri Services
- **Privacy footer note**: "Your privacy matters. AgriHubX does not track your GPS location."

### 🔍 Global Search
- Persistent search bar with autocomplete suggestions
- Grouped results: Products, Community posts, Questions, Services, People
- Recent searches and no-result suggestions (all mock data)

### 🛒 Marketplace
- Categories: Crops, Livestock, Inputs, Equipment
- Product cards with image, title, price, seller name, location (country + county), Message & Save buttons
- Payment method selection UI: M-Pesa, Visa, UnionPay, PayPal (UI only, no real transactions)

### 🌍 Agri Community
- Posts feed grouped by country/county
- Create post (text/image/poll), comments, upvotes, topic tags (#Maize, #Dairy, etc.)
- Sidebar: Trending topics, weather alerts, pest alerts

### ❓ Ask Agri (Q&A)
- Ask questions with crop/livestock tags
- Upvote answers, highlight best answer, follow questions
- Mock sample Q&A data

### 🛠️ Services Directory
- Categories: Veterinary, Transport, Equipment rental, Farm labor, Storage, Insurance & finance
- Service cards: Provider name, rating, service area, contact button

### 👤 User Profile
- Profile photo, name, role badges, country & county, listings, community posts, reviews

### 🔔 Notifications Panel
- New messages, price alerts, weather alerts, community mentions, Daily Farm Brief reminder

---

## Phase 3: Company & Information Pages

### About Us
- Hero: "Born from a Dying Pawpaw Tree" — Blessed Muriuki's origin story
- Founders section: Nixon Magenda (Developer) & Blessed Muriuki (Concept & Research Lead)
- Vision, mission, core differentiators, values
- Supporter: St. John Tala High School

### Careers
- "Grow With Us" page with student intern roles, school ambassador program
- Application form placeholder

### Blog
- Sample posts: "The Pawpaw Tree That Started It All", "25 Farmers, 25 Stories", "Building an App from Scratch"
- Categories, search, subscribe form

### Press
- Press kit section, sample press releases, media contact info

### Support & Help Center
- Searchable FAQ and help articles organized by category
- Contact options

### Contact Us
- Contact form, office info (St. John Tala High School), social media links

### Privacy Policy
- Emphasizes no GPS tracking, aligned with Kenya Data Protection Act 2019
- User rights, data security commitments

### Terms of Service
- Community guidelines, marketplace terms, intellectual property notice
- Copyright: Nixon Magenda & Blessed Muriuki, St. John Tala High School, 2026

---

## Design Principles Throughout
- Large, readable text for non-technical users
- Rounded cards with soft shadows
- Mobile-first, low-bandwidth optimized
- All location based on user selection only — no GPS
- Mock data for all listings, posts, weather, and search results

