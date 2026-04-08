import type { University } from "./types";

// Designated Learning Institutions (DLI) — Canadian universities accepting international students
export const UNIVERSITIES: University[] = [
  { id: "uoft", name: "University of Toronto", dli_number: "O19395067212", province: "ON", city: "Toronto" },
  { id: "ubc", name: "University of British Columbia", dli_number: "O19279029902", province: "BC", city: "Vancouver" },
  { id: "mcgill", name: "McGill University", dli_number: "O19359015732", province: "QC", city: "Montreal" },
  { id: "ualberta", name: "University of Alberta", dli_number: "O19258921222", province: "AB", city: "Edmonton" },
  { id: "mcmaster", name: "McMaster University", dli_number: "O19358994122", province: "ON", city: "Hamilton" },
  { id: "uwaterloo", name: "University of Waterloo", dli_number: "O19395085252", province: "ON", city: "Waterloo" },
  { id: "wlu", name: "Wilfrid Laurier University", dli_number: "O19395124392", province: "ON", city: "Waterloo" },
  { id: "western", name: "Western University", dli_number: "O19395118032", province: "ON", city: "London" },
  { id: "queens", name: "Queen's University", dli_number: "O19359195142", province: "ON", city: "Kingston" },
  { id: "uottawa", name: "University of Ottawa", dli_number: "O19395061652", province: "ON", city: "Ottawa" },
  { id: "ucalgary", name: "University of Calgary", dli_number: "O19258922242", province: "AB", city: "Calgary" },
  { id: "dal", name: "Dalhousie University", dli_number: "O19332403702", province: "NS", city: "Halifax" },
  { id: "umanitoba", name: "University of Manitoba", dli_number: "O19350767172", province: "MB", city: "Winnipeg" },
  { id: "usask", name: "University of Saskatchewan", dli_number: "O213817519807", province: "SK", city: "Saskatoon" },
  { id: "yorku", name: "York University", dli_number: "O19395128542", province: "ON", city: "Toronto" },
  { id: "sfu", name: "Simon Fraser University", dli_number: "O19279030972", province: "BC", city: "Burnaby" },
  { id: "uvic", name: "University of Victoria", dli_number: "O19279032352", province: "BC", city: "Victoria" },
  { id: "guelph", name: "University of Guelph", dli_number: "O19395037392", province: "ON", city: "Guelph" },
  { id: "carleton", name: "Carleton University", dli_number: "O19358985802", province: "ON", city: "Ottawa" },
  { id: "ryerson", name: "Toronto Metropolitan University", dli_number: "O19395064802", province: "ON", city: "Toronto" },
  { id: "concordia", name: "Concordia University", dli_number: "O19359005302", province: "QC", city: "Montreal" },
  { id: "uregina", name: "University of Regina", dli_number: "O213817520967", province: "SK", city: "Regina" },
  { id: "mun", name: "Memorial University", dli_number: "O19339834562", province: "NL", city: "St. John's" },
  { id: "unb", name: "University of New Brunswick", dli_number: "O19338254612", province: "NB", city: "Fredericton" },
  { id: "seneca", name: "Seneca College", dli_number: "O19376814302", province: "ON", city: "Toronto" },
  { id: "conestoga", name: "Conestoga College", dli_number: "O110923467577", province: "ON", city: "Kitchener" },
  { id: "humber", name: "Humber College", dli_number: "O19376816362", province: "ON", city: "Toronto" },
  { id: "georgebrown", name: "George Brown College", dli_number: "O19376432342", province: "ON", city: "Toronto" },
  { id: "centennial", name: "Centennial College", dli_number: "O19376374662", province: "ON", city: "Toronto" },
  { id: "bcit", name: "British Columbia Institute of Technology", dli_number: "O19279018232", province: "BC", city: "Burnaby" },
];

// Canadian provinces with lending regulations
export const PROVINCES = [
  { code: "ON", name: "Ontario", maxAPR: 60, coolingOffDays: 2 },
  { code: "BC", name: "British Columbia", maxAPR: 60, coolingOffDays: 2 },
  { code: "AB", name: "Alberta", maxAPR: 60, coolingOffDays: 2 },
  { code: "QC", name: "Quebec", maxAPR: 35, coolingOffDays: 2 },
  { code: "MB", name: "Manitoba", maxAPR: 60, coolingOffDays: 2 },
  { code: "SK", name: "Saskatchewan", maxAPR: 60, coolingOffDays: 2 },
  { code: "NS", name: "Nova Scotia", maxAPR: 60, coolingOffDays: 2 },
  { code: "NB", name: "New Brunswick", maxAPR: 60, coolingOffDays: 2 },
  { code: "NL", name: "Newfoundland and Labrador", maxAPR: 60, coolingOffDays: 2 },
  { code: "PE", name: "Prince Edward Island", maxAPR: 60, coolingOffDays: 2 },
];
