// Shared geography for LeadOS — the countries LeadOS targets and the states /
// regions within each. Used by both the lead filter (narrow the table to a
// state) and the scraper search (target a state that has no leads yet), so the
// two always offer the same, per-country list.
//
// State names match what the Google Places scraper stores (full names, e.g.
// "Karnataka", "California", "District of Columbia"), so filtering by a value
// picked here matches real lead data.

export const COUNTRIES: string[] = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "New Zealand",
  "Singapore",
  "United Arab Emirates",
  "India",
];

export const STATES_BY_COUNTRY: Record<string, string[]> = {
  "United States": [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia",
    "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
    "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
    "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
    "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
    "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
  ],
  Canada: [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick",
    "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
    "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan",
    "Yukon",
  ],
  "United Kingdom": [
    "England", "Scotland", "Wales", "Northern Ireland", "Greater London",
    "Greater Manchester", "West Midlands", "West Yorkshire", "Merseyside",
    "South Yorkshire", "Tyne and Wear", "Kent", "Essex", "Surrey", "Hampshire",
  ],
  Australia: [
    "Australian Capital Territory", "New South Wales", "Northern Territory",
    "Queensland", "South Australia", "Tasmania", "Victoria",
    "Western Australia",
  ],
  "New Zealand": [
    "Auckland", "Bay of Plenty", "Canterbury", "Gisborne", "Hawke's Bay",
    "Manawatū-Whanganui", "Marlborough", "Nelson", "Northland", "Otago",
    "Southland", "Taranaki", "Tasman", "Waikato", "Wellington", "West Coast",
  ],
  Singapore: [
    "Central Region", "East Region", "North Region", "North-East Region",
    "West Region",
  ],
  "United Arab Emirates": [
    "Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain",
    "Ras Al Khaimah", "Fujairah",
  ],
  India: [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry",
  ],
};

/**
 * States for a country. With no country (or an unknown one) returns the union
 * of every country's states, de-duplicated and sorted — so a state filter still
 * works when no country is selected.
 */
export function statesFor(country?: string): string[] {
  if (country && STATES_BY_COUNTRY[country]) return STATES_BY_COUNTRY[country];
  const all = new Set<string>();
  for (const list of Object.values(STATES_BY_COUNTRY)) list.forEach((s) => all.add(s));
  return [...all].sort((a, b) => a.localeCompare(b));
}
