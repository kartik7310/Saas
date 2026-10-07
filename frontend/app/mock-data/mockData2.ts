// ============================================================
// MOCK DATA — Replace with API calls when backend is ready
// ============================================================

export const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Ahmedabad",
    "Jaipur",
    "Goa",
];

export const propertyTypes = [
    "Apartment", "Villa", "Service Appt", "Plot", "Builder Floor", "Shop/Retails", "Office Space", "Studio / 1 RK", "Penthouse"
];

export const budgetsBuy = [
    "Under 50 Lakhs",
    "50 Lakhs to 1 Cr",
    "1 Cr to 1.5 Cr",
    "1.5 Cr to 2 Cr",
    "2 Cr to 3 Cr",
    "3 Cr to 4 Cr",
    "4 - 10 Cr",
    "10 - 50 Cr",
    "50 - 100 Cr",
    "100 Cr Above"
];

export const budgetsRent = [
    "Under 10 Thousand",
    "10k - 20k",
    "20k - 30k",
    "30k - 40k",
    "40k - 50k",
    "50k - 60k",
    "60k - 1 Lakh",
    "1 Lakh - 3 Lakhs",
    "3 Lakhs - 5 Lakhs",
    "5 Lakhs - 10 Lakhs",
    "10 Lakhs - 20 Lakhs",
    "Above 20 Lakhs"
];

export const bedrooms = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK", "NA", "Applicable"];
export const constructionStatusBuy = ["Ready to move", "New launch", "Underconstruction"];
export const constructionStatusRent = ["Semi furnish", "Unfurnished", "Furnished"];
export const posterByBuy = ["Seller", "Builder", "Partner"];
export const posterByRent = ["Owner", "Builder", "Partner"];

// Legacy export to prevent breaking other files immediately, but they should use budgetsBuy or budgetsRent
export const budgets = budgetsBuy;

export const featuredProjects = [
    {
        id: 1,
        name: "Project 1",
        image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
    },
    {
        id: 2,
        name: "Project 2",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
    },
    {
        id: 3,
        name: "Project 3",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
    },
];

export const builders = [
    {
        id: 1,
        name: "Builder Logo",
        logo: null,
        info: "Builder info",
        avatar: null,
    },
];

// ============================================================
// ALL PROPERTIES — used on /properties listing page
// 9 cards per page (3x3 grid)
// ============================================================
export const allProperties = [
    {
        id: 1,
        title: "Property Listing Title",
        bhk: "2 – 4 BHK",
        area: "1,000 - 2,000 sq.ft.",
        amenities: "50+ Amenities",
        price: "Price Lakh",
        image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
    },
    {
        id: 2,
        title: "Property Listing Title",
        bhk: "2 – 4 BHK",
        area: "1,000 - 2,000 sq.ft.",
        amenities: "50+ Amenities",
        price: "Price Lakh",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
    },
    {
        id: 3,
        title: "Property Listing Title",
        bhk: "2 – 4 BHK",
        area: "1,000 - 2,000 sq.ft.",
        amenities: "50+ Amenities",
        price: "Price Lakh",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
    },
    {
        id: 4,
        title: "Property Listing Title",
        bhk: "2 – 4 BHK",
        area: "1,000 - 2,000 sq.ft.",
        amenities: "50+ Amenities",
        price: "Price Lakh",
        image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&q=80",
    },
    {
        id: 5,
        title: "Property Listing Title",
        bhk: "2 – 4 BHK",
        area: "1,000 - 2,000 sq.ft.",
        amenities: "50+ Amenities",
        price: "Price Lakh",
        image: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=600&q=80",
    },
    {
        id: 6,
        title: "Property Listing Title",
        bhk: "2 – 4 BHK",
        area: "1,000 - 2,000 sq.ft.",
        amenities: "50+ Amenities",
        price: "Price Lakh",
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    },
    {
        id: 7,
        title: "Property Listing Title",
        bhk: "2 – 4 BHK",
        area: "1,000 - 2,000 sq.ft.",
        amenities: "50+ Amenities",
        price: "Price Lakh",
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
    },
    {
        id: 8,
        title: "Property Listing Title",
        bhk: "2 – 4 BHK",
        area: "1,000 - 2,000 sq.ft.",
        amenities: "50+ Amenities",
        price: "Price Lakh",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
    },
    {
        id: 9,
        title: "Property Listing Title",
        bhk: "2 – 4 BHK",
        area: "1,000 - 2,000 sq.ft.",
        amenities: "50+ Amenities",
        price: "Price Lakh",
        image: "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=600&q=80",
    },
];

export const TOTAL_PAGES = 4;

// ============================================================
// PROPERTY DETAIL — used on /properties/[id] page
// ============================================================
export const propertyDetail = {
    id: 1,
    title: "Property Listing Title",
    badge: "NEW",
    reraApproved: true,
    price: "Price Lakh",
    bhk: "2 – 4 BHK",
    area: "1,000 - 2,000 sq.ft.",
    amenitiesCount: "50+ Amenities",
    images: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80",
        "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80",
    ],
    overview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit... sed diam nonummy vivnh bempus nenmata see aptatenendum culismed compor alichum cultaemeopat maoeormit.",
    propertyDetails: {
        propertyType: "XYZ Type",
        bhkOptions: "2, 3, 4 BHK",
        startingPrice: "₹Price Lakh",
        status: "Ready to Move ✓",
        areaRange: "1,000 - 2,000 sq.ft.",
        locationCity: "City Name",
        numberOfTowers: "Number of towers. / tera/eter://EERA/Aproved",
    },
    disclaimer: "Disclaimer: Rates and availability are subject to change without notice. Please contact the builder directly for the latest and most accurate information.",
    amenities: [
        { label: "Swimming Pool", icon: "🏊", image: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=300&q=70" },
        { label: "Gymnasium", icon: "🏋️", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=70" },
        { label: "Clubhouse", icon: "🏛️", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&q=70" },
        { label: "Kids Play Area", icon: "🛝", image: "https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=300&q=70" },
        { label: "Landscaped Gardens", icon: "🌳", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4edd0?w=300&q=70" },
        { label: "Sports Facilities", icon: "🏸", image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&q=70" },
        { label: "Jogging Track", icon: "🏃", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=70" },
        { label: "24/7 Security", icon: "🛡️", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70" },
    ],
    whatsapp: "+91 98765 43210",
};