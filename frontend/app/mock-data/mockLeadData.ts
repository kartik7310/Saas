
export type LeadStatus = "New" | "Contacted" | "Interested" | "Not Interested";
export type LeadSource = "Portal" | "Facebook" | "Walk-in" | string;

export type TabFilter = "All" | LeadStatus;

export interface Lead {
    id: number;
    date: string; // e.g. "23 Apr 2024"
    name: string;
    phone: string;
    property: string;
    status: LeadStatus;
    source: LeadSource;
}
// TODO: Replace with API call
// e.g. const leads = await fetch('/api/leads').then(r => r.json())
export const MOCK_LEADS: Lead[] = [
    { id: 1, date: "23 Apr 2024", name: "Ankit Sharma", phone: "8798 3404 52", property: "Oceanville Apartments", status: "New", source: "Portal" },
    { id: 2, date: "23 Apr 2024", name: "Vedika Kappor", phone: "9796 340100", property: "Prestige Tower", status: "New", source: "Facebook" },
    { id: 3, date: "23 Apr 2024", name: "Amit Kumar", phone: "8787 240200", property: "Greenfield Estate", status: "Contacted", source: "Portal" },
    { id: 4, date: "23 Apr 2024", name: "Priya Menon", phone: "8787 240000", property: "Las Colinas Villas", status: "Interested", source: "Portal" },
    { id: 5, date: "21 Apr 2024", name: "Saurabh Malhotra", phone: "9798 2404 52", property: "Sunrise Residency", status: "Interested", source: "Walk-in" },
    { id: 6, date: "24 Apr 2024", name: "Anjali Shah", phone: "76367 020452", property: "Harmony Heights", status: "Interested", source: "Portal" },
    { id: 7, date: "20 Apr 2024", name: "Rohit Bhatia", phone: "8798 2404 52", property: "Greenfield Estate", status: "New", source: "Portal" },
    { id: 8, date: "19 Apr 2024", name: "Ashish Mehta", phone: "8798 340800", property: "Prestige Tower", status: "Contacted", source: "Facebook" },
    { id: 9, date: "12 Apr 2024", name: "Swati Arora", phone: "8787-245210", property: "Las Colinas Villas", status: "Interested", source: "Portal" },
    { id: 10, date: "19 Apr 2024", name: "Neha Jain", phone: "8888 7404 52", property: "Harmony Heights", status: "Interested", source: "Portal" },
    { id: 4, date: "23 Apr 2024", name: "Priya Menon", phone: "8787 240000", property: "Las Colinas Villas", status: "Interested", source: "Portal" },
    { id: 5, date: "21 Apr 2024", name: "Saurabh Malhotra", phone: "9798 2404 52", property: "Sunrise Residency", status: "Interested", source: "Walk-in" },
    { id: 6, date: "24 Apr 2024", name: "Anjali Shah", phone: "76367 020452", property: "Harmony Heights", status: "Interested", source: "Portal" },
    { id: 7, date: "20 Apr 2024", name: "Rohit Bhatia", phone: "8798 2404 52", property: "Greenfield Estate", status: "New", source: "Portal" },
    { id: 8, date: "19 Apr 2024", name: "Ashish Mehta", phone: "8798 340800", property: "Prestige Tower", status: "Contacted", source: "Facebook" },
    { id: 9, date: "12 Apr 2024", name: "Swati Arora", phone: "8787-245210", property: "Las Colinas Villas", status: "Interested", source: "Portal" },
    { id: 10, date: "19 Apr 2024", name: "Neha Jain", phone: "8888 7404 52", property: "Harmony Heights", status: "Interested", source: "Portal" },
    { id: 11, date: "23 Apr 2024", name: "Priya Menon", phone: "8787 240000", property: "Las Colinas Villas", status: "Interested", source: "Portal" },
    { id: 12, date: "21 Apr 2024", name: "Saurabh Malhotra", phone: "9798 2404 52", property: "Sunrise Residency", status: "Interested", source: "Walk-in" },
    { id: 13, date: "24 Apr 2024", name: "Anjali Shah", phone: "76367 020452", property: "Harmony Heights", status: "Interested", source: "Portal" },
    { id: 14, date: "20 Apr 2024", name: "Rohit Bhatia", phone: "8798 2404 52", property: "Greenfield Estate", status: "New", source: "Portal" },
    { id: 15, date: "19 Apr 2024", name: "Ashish Mehta", phone: "8798 340800", property: "Prestige Tower", status: "Contacted", source: "Facebook" },
    { id: 16, date: "12 Apr 2024", name: "Swati Arora", phone: "8787-245210", property: "Las Colinas Villas", status: "Interested", source: "Portal" },
    { id: 17, date: "19 Apr 2024", name: "Neha Jain", phone: "8888 7404 52", property: "Harmony Heights", status: "Interested", source: "Portal" },
];