"use client";

import { useEffect, useMemo, useState } from "react";

const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? "";

type Place = {
  id: number;
  name: string;
  category: string;
  distance: string;
  hours: string;
  icon: string;
  color: string;
  lat: number;
  lon: number;
  accessible?: boolean;
};

type Account = {
  identity: { displayName: string; email: string; fullName: string | null; emailVerified: boolean } | null;
  profile: { id: string; email: string; fullName: string; studentId: string; programme: string; level: string; createdAt: string } | null;
};

type CampusWeather = {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
};

type ChatMessage = {
  id?: string;
  from: "ai" | "user";
  text: string;
  question?: string;
  url?: string;
  linkLabel?: string;
  placeId?: number;
  updates?: CampusUpdate[];
};

type CampusUpdate = {
  id: string;
  title: string;
  summary: string;
  startDate: string;
  endDate: string;
  category: string;
  source: string;
  url: string;
};

function campusDate(value: string, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-GH", { timeZone: "Africa/Accra", ...options }).format(new Date(`${value}T12:00:00Z`));
}

function dateKey(value: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Accra", year: "numeric", month: "2-digit", day: "2-digit" }).format(value);
}

type RoutePreview = {
  destination: Place;
  distance: number;
  duration: number;
  coordinates: [number, number][];
  steps: { instruction: string; distance: number; duration: number }[];
  landmarks: Place[];
  start: { lat: number; lon: number };
};

type TimetableEntry = {
  id: string;
  courseCode: string;
  title: string;
  venue: string;
  placeId: number | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  reminderMinutes: number;
};

type IssueDraft = {
  category: "Lighting" | "Water" | "Security" | "Damage" | "Other";
  description: string;
  locationText: string;
  latitude: number | null;
  longitude: number | null;
  photo: File | null;
};

type UserPreferences = {
  accessibilityRequired: boolean;
  travelMode: "walking" | "shuttle";
  savedPlaces: number[];
  recentQuestions: string[];
  visitCounts: Record<string, number>;
};

type Language = "en" | "fat" | "tw" | "gaa" | "ee";

const languageOptions: { code: Language; label: string; speech: string }[] = [
  { code: "en", label: "English", speech: "en-GH" },
  { code: "fat", label: "Fante", speech: "ak-GH" },
  { code: "tw", label: "Twi", speech: "ak-GH" },
  { code: "gaa", label: "Ga", speech: "gaa-GH" },
  { code: "ee", label: "Ewe", speech: "ee-GH" },
];

const languageCopy: Record<Language, {
  welcome: string; help: string; ask: string; listening: string; helpful: string; notHelpful: string;
  incorrect: string; received: string; correction: string; cancel: string; send: string; answerLead: string;
}> = {
  en: { welcome: "Welcome to UCC Campus Connect.", help: "What can we help you find today?", ask: "Ask about a place, event, or request directions…", listening: "Listening…", helpful: "Helpful", notHelpful: "Not helpful", incorrect: "Report incorrect information", received: "Feedback received", correction: "What information should be corrected?", cancel: "Cancel", send: "Send report", answerLead: "" },
  fat: { welcome: "Akwaaba UCC Campus Connect.", help: "Ebɛn adze na yebotum aboa wo ma aahwehwɛ ndɛ?", ask: "Bisa beebi, dwumadzi anaa kwan ho asɛm…", listening: "Yeretsie wo…", helpful: "Ɔboa me", notHelpful: "Ɔmboa me", incorrect: "Bɔ amandzɛɛ wɔ nsɛm a wɔnntɔ da ho", received: "Yɛagye w’adwenkyerɛ", correction: "Ebɛn asɛm na ɔsɛ dɛ wɔtsen no?", cancel: "Gyae", send: "Fa amandzɛɛ no kɔ", answerLead: "UCC ho mbuae no nye yi:" },
  tw: { welcome: "Akwaaba UCC Campus Connect.", help: "Dɛn na yebetumi aboa wo ahwehwɛ nnɛ?", ask: "Bisa beae, dwumadi anaa akwankyerɛ ho asɛm…", listening: "Yɛretie wo…", helpful: "Ɛboa me", notHelpful: "Ɛmmoa me", incorrect: "Bɔ amanneɛ sɛ asɛm no nyɛ nokware", received: "Yɛanya w’adwenkyerɛ", correction: "Asɛm bɛn na ɛsɛ sɛ yɛsiesie?", cancel: "Twa mu", send: "Fa amanneɛ no kɔ", answerLead: "UCC ho mmuae no ni:" },
  gaa: { welcome: "Ojekoo, UCC Campus Connect.", help: "Mɛni ji obaanyɛ bo ni?", ask: "Bí niŋ be, shikpon alo lɛlɛŋkwɛi he…", listening: "Míitsɔ bo…", helpful: "Eboa mi", notHelpful: "Eboa mi ko", incorrect: "Kɛ sane ni efee jogbaŋŋ amaneɛ", received: "Míshɛ bo sane", correction: "Sane mɛni ji ebaahiɛ shishi?", cancel: "Gbo", send: "Kɛ amaneɛ no kɔ", answerLead: "UCC sane no ji nɛ:" },
  ee: { welcome: "Woezɔ UCC Campus Connect.", help: "Nu ka míate ŋu akpe ɖe ŋuwò le egbe?", ask: "Bia teƒe, nudzɔdzɔ alo mɔfiame ŋu…", listening: "Míele to ɖom…", helpful: "Eɖe ŋunye", notHelpful: "Mede ŋunye o", incorrect: "Gblɔ be nyatakaka la mesɔ o", received: "Míexɔ wò susu", correction: "Nyatakaka kae wòle be woatrɔ?", cancel: "Tsi", send: "Ɖo nyatakaka la ɖa", answerLead: "UCC ŋu ŋuɖoɖo lae nye esi:" },
};

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function distanceMeters(from: { lat: number; lon: number }, to: { lat: number; lon: number }) {
  const radians = (value: number) => value * Math.PI / 180;
  const earthRadius = 6371000;
  const dLat = radians(to.lat - from.lat);
  const dLon = radians(to.lon - from.lon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(dLon / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function placeContact(place: Place) {
  if (place.id === 1 || place.id === 73 || place.id === 75) return "Sam Jonah Library · +233 31 229 6323";
  if (place.id === 2) return "UCC Accident & Emergency · +233 31 229 2614";
  if (place.id === 93) return "UCC emergency · 020 300 5175";
  if (place.id === 94) return "UCC Fire Service · 020 538 8648";
  if (place.category === "Banking") return `${place.name} campus branch`;
  if (place.category === "Academic") return "Contact the relevant UCC faculty or department";
  return "No public contact number listed";
}

function routeInstruction(step: any) {
  const type = step.maneuver?.type ?? "continue";
  const modifier = step.maneuver?.modifier?.replace("_", " ");
  const road = step.name ? ` onto ${step.name}` : "";
  if (type === "depart") return `Start${road}`;
  if (type === "arrive") return "You have arrived at your destination";
  if (type === "turn") return `Turn ${modifier ?? ""}${road}`.replace(/\s+/g, " ").trim();
  if (type === "new name") return `Continue${road}`;
  if (type === "roundabout" || type === "rotary") return `Enter the roundabout${step.maneuver?.exit ? ` and take exit ${step.maneuver.exit}` : ""}${road}`;
  return `${type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ")}${modifier ? ` ${modifier}` : ""}${road}`;
}

function describeWeather(code: number, isDay: boolean) {
  if (code === 0) return { icon: isDay ? "☀" : "☾", label: "Clear sky" };
  if (code === 1) return { icon: isDay ? "🌤" : "☾", label: "Mainly clear" };
  if (code === 2) return { icon: "⛅", label: "Partly cloudy" };
  if (code === 3) return { icon: "☁", label: "Overcast" };
  if ([45, 48].includes(code)) return { icon: "≋", label: "Foggy" };
  if ([51, 53, 55, 56, 57].includes(code)) return { icon: "🌦", label: "Drizzle" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: "🌧", label: "Rain" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: "❄", label: "Snow" };
  if ([95, 96, 99].includes(code)) return { icon: "⛈", label: "Thunderstorm" };
  return { icon: "◌", label: "Current conditions" };
}

const places: Place[] = [
  { id: 1, name: "Sam Jonah Library", category: "Academic", distance: "4 min walk", hours: "Open until 10 PM", icon: "▤", color: "#003b73", lat: 5.1166973, lon: -1.2909944, accessible: true },
  { id: 2, name: "University Hospital", category: "Health", distance: "On campus", hours: "Emergency care available", icon: "+", color: "#c43d38", lat: 5.1051584, lon: -1.2828135, accessible: true },
  { id: 3, name: "Casely Hayford Hall", category: "Accommodation", distance: "Northern Campus", hours: "Casford Road", icon: "▦", color: "#d79b13", lat: 5.1167288, lon: -1.2841606 },
  { id: 4, name: "Atlantic Hall", category: "Accommodation", distance: "South Campus", hours: "School Bus Road", icon: "▦", color: "#315fa8", lat: 5.1056191, lon: -1.2869944, accessible: true },
  { id: 5, name: "Valco Hall", category: "Accommodation", distance: "Northern Campus", hours: "University Avenue", icon: "▦", color: "#62499a", lat: 5.1158808, lon: -1.2824973 },
  { id: 6, name: "ADB Bank", category: "Banking", distance: "Northern Campus", hours: "Casford Road", icon: "₵", color: "#158b83", lat: 5.1176325, lon: -1.2856637 },
  { id: 7, name: "Kwame Nkrumah Hall", category: "Accommodation", distance: "Northern Campus", hours: "University Avenue", icon: "▦", color: "#8b6237", lat: 5.1162601, lon: -1.2805715 },
  { id: 8, name: "Science Annex Building", category: "Academic", distance: "Northern Campus", hours: "Ayensu Road", icon: "⌬", color: "#2f6ca5", lat: 5.1151027, lon: -1.2941064, accessible: true },
  { id: 9, name: "Oguaa Hall", category: "Accommodation", distance: "South Campus", hours: "School Bus Road", icon: "▦", color: "#99623a", lat: 5.1041491, lon: -1.2863727 },
  { id: 10, name: "Adehye Hall", category: "Accommodation", distance: "South Campus", hours: "School Bus Road", icon: "▦", color: "#a84f7a", lat: 5.1053955, lon: -1.2862198 },
  { id: 11, name: "Superannuation Hall", category: "Accommodation", distance: "2.5 km from UCC", hours: "Arku Korsah Road", icon: "▦", color: "#49729b", lat: 5.1334863, lon: -1.2886309 },
  { id: 12, name: "UCC Sports Complex", category: "Recreation", distance: "On campus", hours: "Near the N1", icon: "◉", color: "#2d8a65", lat: 5.1038328, lon: -1.2811756 },
  { id: 13, name: "Cape Coast Teaching Hospital", category: "Health", distance: "4 km from UCC", hours: "Estate Road, Pedu", icon: "+", color: "#bd443c", lat: 5.1340712, lon: -1.2660169, accessible: true },
  { id: 14, name: "Cape Coast Sports Stadium", category: "Recreation", distance: "3.5 km from UCC", hours: "Arku Korsah Road", icon: "◉", color: "#3c79a8", lat: 5.1358596, lon: -1.2824832, accessible: true },
  { id: 15, name: "Cape Coast Castle", category: "Landmark", distance: "5 km from UCC", hours: "Castle Road, Cape Coast", icon: "◆", color: "#876a42", lat: 5.103627, lon: -1.2411004 },
  { id: 16, name: "Saint George’s Castle", category: "Landmark", distance: "10 km from UCC", hours: "Elmina", icon: "◆", color: "#69558c", lat: 5.0827429, lon: -1.3482357 },
  { id: 17, name: "Alumni Hostel", category: "Hostels", distance: "Northern Campus", hours: "Near Sasakawa Road", icon: "H", color: "#6d4c8d", lat: 5.1174744, lon: -1.2890447 },
  { id: 18, name: "Graduate Hostel", category: "Hostels", distance: "Northern Campus", hours: "Near Sasakawa Road", icon: "H", color: "#526fa3", lat: 5.1185174, lon: -1.2891454 },
  { id: 19, name: "Valco Trust Hall", category: "Hostels", distance: "Northern Campus", hours: "Sasakawa Road", icon: "H", color: "#76559b", lat: 5.1192123, lon: -1.2889378 },
  { id: 20, name: "SSNIT Hostel", category: "Hostels", distance: "Near UCC", hours: "Kobina Sekyi Road area", icon: "H", color: "#3f7893", lat: 5.1209606, lon: -1.2856606 },
  { id: 21, name: "Dakar Court", category: "Hostels", distance: "Near UCC", hours: "Kobina Sekyi Road area", icon: "H", color: "#8a5f45", lat: 5.1206738, lon: -1.2860433 },
  { id: 22, name: "Maplin's Court", category: "Hostels", distance: "Amamoma", hours: "School Bus Road", icon: "H", color: "#287c72", lat: 5.1098609, lon: -1.2920425 },
  { id: 23, name: "Nandy Villa", category: "Hostels", distance: "Amamoma", hours: "School Bus Road", icon: "H", color: "#9a6848", lat: 5.1148301, lon: -1.2924833 },
  { id: 24, name: "Jodok Hostel", category: "Hostels", distance: "Amamoma", hours: "Near School Bus Road", icon: "H", color: "#447c9b", lat: 5.1125536, lon: -1.2917781 },
  { id: 25, name: "Oye Inn", category: "Hostels", distance: "Amamoma", hours: "Near School Bus Road", icon: "H", color: "#9a536b", lat: 5.1145674, lon: -1.2929534 },
  { id: 26, name: "WTC Hostel", category: "Hostels", distance: "Amamoma", hours: "Near School Bus Road", icon: "H", color: "#3b739f", lat: 5.1143278, lon: -1.2928162 },
  { id: 27, name: "Haroderb Hostel", category: "Hostels", distance: "Amamoma", hours: "Amamoma Road", icon: "H", color: "#786146", lat: 5.1075493, lon: -1.2943846 },
  { id: 28, name: "Florence Hostel", category: "Hostels", distance: "Amamoma", hours: "Near Amamoma Road", icon: "H", color: "#a04f6d", lat: 5.1085164, lon: -1.2944597 },
  { id: 29, name: "Global Annex Hostel", category: "Hostels", distance: "Amamoma", hours: "Near Amamoma Road", icon: "H", color: "#397b85", lat: 5.1131311, lon: -1.295248 },
  { id: 30, name: "Juliborn Hostel", category: "Hostels", distance: "Amamoma", hours: "Jonnel Street", icon: "H", color: "#70609a", lat: 5.1086834, lon: -1.2970993 },
  { id: 31, name: "Adwoa Dufie Hostel", category: "Hostels", distance: "Ayensu", hours: "Near Ayensu Road", icon: "H", color: "#a45c54", lat: 5.113455, lon: -1.301529 },
  { id: 32, name: "AKB Hostel", category: "Hostels", distance: "Ayensu", hours: "Near Ayensu Road", icon: "H", color: "#4a73a1", lat: 5.1143724, lon: -1.3007888 },
  { id: 33, name: "Aseda Hostel", category: "Hostels", distance: "Ayensu", hours: "Near Ayensu Road", icon: "H", color: "#867045", lat: 5.1146902, lon: -1.2992464 },
  { id: 34, name: "Ayensu Plaza", category: "Hostels", distance: "Ayensu", hours: "Ayensu Road area", icon: "H", color: "#3f7d78", lat: 5.1151747, lon: -1.2986566 },
  { id: 35, name: "Global Hostel", category: "Hostels", distance: "Ayensu", hours: "Ayensu Road", icon: "H", color: "#53689c", lat: 5.1163863, lon: -1.2991688 },
  { id: 36, name: "Peace Hostel", category: "Hostels", distance: "Ayensu", hours: "Ayensu Road", icon: "H", color: "#8a6550", lat: 5.1144432, lon: -1.2978252 },
  { id: 37, name: "Success City Hostel", category: "Hostels", distance: "Ayensu", hours: "Ayensu Road area", icon: "H", color: "#2f7d8b", lat: 5.1141355, lon: -1.2977929 },
  { id: 38, name: "Prince Hostel", category: "Hostels", distance: "Ayensu", hours: "Ayensu Road area", icon: "H", color: "#715597", lat: 5.1159021, lon: -1.3003819 },
  { id: 39, name: "Ocean View Hostel", category: "Hostels", distance: "Ayensu", hours: "West of UCC", icon: "H", color: "#397da0", lat: 5.1137554, lon: -1.3019312 },
  { id: 40, name: "The Rock Hostel", category: "Hostels", distance: "Ayensu", hours: "West of UCC", icon: "H", color: "#795a4a", lat: 5.1156841, lon: -1.3028152 },
  { id: 41, name: "Nunu's Height Hostel", category: "Hostels", distance: "Ayensu", hours: "West of UCC", icon: "H", color: "#92506e", lat: 5.1146461, lon: -1.3025831 },
  { id: 42, name: "Dobo's Hostel", category: "Hostels", distance: "Ayensu", hours: "West of UCC", icon: "H", color: "#4a7798", lat: 5.1148733, lon: -1.3021625 },
  { id: 43, name: "Mohammed Mumuni Hostel", category: "Hostels", distance: "Ayensu", hours: "West of UCC", icon: "H", color: "#7b6745", lat: 5.1145727, lon: -1.3020999 },
  { id: 44, name: "Sam Hill Hostel", category: "Hostels", distance: "Ayensu", hours: "West of UCC", icon: "H", color: "#327f74", lat: 5.117457, lon: -1.3023312 },
  { id: 45, name: "Russian Lodge Hostel", category: "Hostels", distance: "Kwaprow", hours: "Kwaprow area", icon: "H", color: "#62639b", lat: 5.1207708, lon: -1.3010968 },
  { id: 46, name: "Step Hostel", category: "Hostels", distance: "Kwaprow", hours: "Kwaprow area", icon: "H", color: "#9b5a51", lat: 5.1202895, lon: -1.3014375 },
  { id: 47, name: "Golden Royal Palace", category: "Hostels", distance: "Kwaprow", hours: "Kwaprow Road", icon: "H", color: "#4b759d", lat: 5.1242398, lon: -1.2997977 },
  { id: 48, name: "Stabilo Hostel", category: "Hostels", distance: "Kwaprow", hours: "Kwaprow Road", icon: "H", color: "#8c6b45", lat: 5.1246208, lon: -1.2987634 },
  { id: 49, name: "Sammy Otoo Hostel", category: "Hostels", distance: "Kwaprow", hours: "Kwaprow Road", icon: "H", color: "#3b817a", lat: 5.1255754, lon: -1.2970573 },
  { id: 50, name: "Student Villa", category: "Hostels", distance: "Kwaprow", hours: "Kwaprow area", icon: "H", color: "#6c5593", lat: 5.126805, lon: -1.2964214 },
  { id: 51, name: "Godfrey Hostel", category: "Hostels", distance: "Kwaprow", hours: "Kwaprow area", icon: "H", color: "#925451", lat: 5.1278099, lon: -1.2987828 },
  { id: 52, name: "Anne's Home", category: "Hostels", distance: "Kwaprow", hours: "Kwaprow Road", icon: "H", color: "#47799b", lat: 5.1246757, lon: -1.2973115 },
  { id: 53, name: "Efrat Heights", category: "Hostels", distance: "UCC environs", hours: "Cape Coast", icon: "H", color: "#776348", lat: 5.1323883, lon: -1.2821497 },
  { id: 54, name: "Medical Hall", category: "Hostels", distance: "UCC environs", hours: "Near Cape Coast Teaching Hospital", icon: "H", color: "#3b817c", lat: 5.1343974, lon: -1.2844258 },
  { id: 55, name: "SRC Hall", category: "Hostels", distance: "UCC environs", hours: "Arku Korsah Road", icon: "H", color: "#665797", lat: 5.1339941, lon: -1.287187 },
  { id: 56, name: "Large Lecture Theatre (LLT)", category: "Academic", distance: "Northern Campus", hours: "University Avenue", icon: "▤", color: "#0c5f91", lat: 5.1170784, lon: -1.291436, accessible: true },
  { id: 57, name: "C. A. Ackah Lecture Theatre (CALC)", category: "Academic", distance: "Northern Campus", hours: "Near Auditorium 900", icon: "▤", color: "#315fa8", lat: 5.1194735, lon: -1.2920707 },
  { id: 58, name: "New Lecture Theatre (NLT)", category: "Academic", distance: "Northern Campus", hours: "Near College of Distance Education", icon: "▤", color: "#3a759b", lat: 5.1221183, lon: -1.29589 },
  { id: 59, name: "Sandwich Lecture Theatre (SWLT)", category: "Academic", distance: "Northern Campus", hours: "West of Science", icon: "▤", color: "#5767a0", lat: 5.1180625, lon: -1.2981875 },
  { id: 60, name: "Auditorium 900", category: "Academic", distance: "Northern Campus", hours: "Near CALC", icon: "▤", color: "#73569a", lat: 5.1194735, lon: -1.2920707 },
  { id: 61, name: "UCC Main Auditorium", category: "Academic", distance: "Northern Campus", hours: "Science area", icon: "▤", color: "#8b6145", lat: 5.1167375, lon: -1.2938906 },
  { id: 62, name: "Faculty of Science", category: "Academic", distance: "Northern Campus", hours: "Science area", icon: "⌬", color: "#247c83", lat: 5.1162523, lon: -1.2935597 },
  { id: 63, name: "Faculty of Arts", category: "Academic", distance: "Northern Campus", hours: "Near LLT", icon: "⌬", color: "#426f9e", lat: 5.1181625, lon: -1.2926094 },
  { id: 64, name: "Faculty of Social Sciences", category: "Academic", distance: "Northern Campus", hours: "Near LLT", icon: "⌬", color: "#65589a", lat: 5.1174417, lon: -1.2928121 },
  { id: 65, name: "School of Business", category: "Academic", distance: "Northern Campus", hours: "Near College of Distance Education", icon: "⌬", color: "#916149", lat: 5.1208184, lon: -1.2946096 },
  { id: 66, name: "School of Medical Sciences", category: "Academic", distance: "Northern Campus", hours: "Medical School area", icon: "⌬", color: "#287c72", lat: 5.1201375, lon: -1.2938281, accessible: true },
  { id: 67, name: "School of Medical Sciences Auditorium", category: "Academic", distance: "Northern Campus", hours: "Medical School area", icon: "▤", color: "#3b73a0", lat: 5.1201375, lon: -1.2938281 },
  { id: 68, name: "School of Graduate Studies", category: "Academic", distance: "Northern Campus", hours: "West of Medical School", icon: "⌬", color: "#6b5797", lat: 5.1206868, lon: -1.2958627 },
  { id: 69, name: "College of Distance Education", category: "Academic", distance: "Northern Campus", hours: "Near NLT", icon: "⌬", color: "#95584d", lat: 5.1220366, lon: -1.2948219 },
  { id: 70, name: "College of Education", category: "Academic", distance: "Northern Campus", hours: "Near CALC", icon: "⌬", color: "#397c82", lat: 5.119055, lon: -1.293885 },
  { id: 71, name: "Amissah-Arthur Language Centre", category: "Academic", distance: "Northern Campus", hours: "West of College of Education", icon: "⌬", color: "#4c6fa0", lat: 5.1191875, lon: -1.2947969 },
  { id: 72, name: "Institute for Development Studies (IDS)", category: "Academic", distance: "Northern Campus", hours: "Near Sam Jonah Library", icon: "⌬", color: "#705b91", lat: 5.1179594, lon: -1.2912416 },
  { id: 73, name: "IDS Library", category: "Academic", distance: "Northern Campus", hours: "Institute for Development Studies", icon: "▤", color: "#8d6843", lat: 5.1179594, lon: -1.2912416 },
  { id: 74, name: "New Central Administration Block", category: "Academic", distance: "Northern Campus", hours: "Near Sam Jonah Library", icon: "⌬", color: "#337b76", lat: 5.115532, lon: -1.291193 },
  { id: 75, name: "Old Library", category: "Academic", distance: "South Campus", hours: "Near Administration Block", icon: "▤", color: "#4b6e9b", lat: 5.1045875, lon: -1.2847656 },
  { id: 76, name: "Administration Block", category: "Academic", distance: "South Campus", hours: "Old Site", icon: "⌬", color: "#6a5792", lat: 5.1055362, lon: -1.2845144 },
  { id: 77, name: "Centre for International Education", category: "Academic", distance: "South Campus", hours: "Near University Hospital", icon: "⌬", color: "#925a4b", lat: 5.1060615, lon: -1.2813843 },
  { id: 78, name: "Sasakawa Restaurant", category: "Dining", distance: "Northern Campus", hours: "Sasakawa Guest House", icon: "●", color: "#bd6f32", lat: 5.1183816, lon: -1.2897789 },
  { id: 79, name: "Institute of Education Restaurant", category: "Dining", distance: "Northern Campus", hours: "Institute of Education Guest House", icon: "●", color: "#9b6840", lat: 5.1209973, lon: -1.2900602 },
  { id: 80, name: "Department of Tourism Restaurant", category: "Dining", distance: "Northern Campus", hours: "Near Casely Hayford Hall", icon: "●", color: "#b55f3e", lat: 5.1175852, lon: -1.2853204 },
  { id: 81, name: "Valco Canteen", category: "Dining", distance: "Northern Campus", hours: "Valco Hall", icon: "●", color: "#a37736", lat: 5.1154835, lon: -1.2826993 },
  { id: 82, name: "Algorithm Cafe", category: "Dining", distance: "Northern Campus", hours: "Near Casford Road", icon: "●", color: "#8f5c45", lat: 5.117045, lon: -1.2884217 },
  { id: 83, name: "VOTEC Canteen", category: "Dining", distance: "South Campus", hours: "Near Oguaa Hall", icon: "●", color: "#b26b35", lat: 5.1056861, lon: -1.2865645 },
  { id: 84, name: "White Castle Restaurant", category: "Dining", distance: "South Campus", hours: "Near UCC Sports Complex", icon: "●", color: "#936645", lat: 5.1021409, lon: -1.2811035 },
  { id: 85, name: "Pizzaman Chickenman UCC Branch", category: "Dining", distance: "UCC environs", hours: "East of campus", icon: "●", color: "#bd573b", lat: 5.113318, lon: -1.2788652 },
  { id: 86, name: "Absa ATM", category: "Banking", distance: "Northern Campus", hours: "Science area", icon: "₵", color: "#a94b55", lat: 5.1160348, lon: -1.2926932 },
  { id: 87, name: "SG-SSB ATM", category: "Banking", distance: "Northern Campus", hours: "Science area", icon: "₵", color: "#3f70a0", lat: 5.1164035, lon: -1.2926894 },
  { id: 88, name: "Zenith Bank", category: "Banking", distance: "Northern Campus", hours: "Casford Road area", icon: "₵", color: "#7f5a94", lat: 5.1178316, lon: -1.286478 },
  { id: 89, name: "GCB Bank", category: "Banking", distance: "Northern Campus", hours: "University Avenue area", icon: "₵", color: "#397d76", lat: 5.1151336, lon: -1.2796793 },
  { id: 90, name: "Old Site Shuttle Station", category: "Transport", distance: "South Campus", hours: "Near Oguaa and Adehye halls", icon: "↔", color: "#34745d", lat: 5.1054253, lon: -1.2858249, accessible: true },
  { id: 91, name: "Science Shuttle Station", category: "Transport", distance: "Northern Campus", hours: "Opposite Sam Jonah Library", icon: "↔", color: "#356b91", lat: 5.1167122, lon: -1.2922016, accessible: true },
  { id: 92, name: "Valco Shuttle Station", category: "Transport", distance: "Northern Campus", hours: "Near Valco Hall", icon: "↔", color: "#7a5c93", lat: 5.11538, lon: -1.2818592, accessible: true },
  { id: 93, name: "UCC Police Station", category: "Safety", distance: "South Campus", hours: "Campus security support", icon: "◇", color: "#315f82", lat: 5.1059614, lon: -1.2798723, accessible: true },
  { id: 94, name: "UCC Fire Service Station", category: "Safety", distance: "South Campus", hours: "Fire and rescue response", icon: "◇", color: "#b64b3f", lat: 5.1055128, lon: -1.2799135, accessible: true },
];

const destinationAliases: Record<string, number> = {
  "calc": 57, "c a ackah": 57, "ackah theatre": 57, "albert koomson": 57,
  "llt": 56, "large lecture": 56, "nlt": 58, "new lecture": 58, "swlt": 59, "sandwich theatre": 59,
  "main library": 1, "central library": 1, "sam jona": 1, "sam jonah": 1, "jonah library": 1, "jona libray": 1,
  "casford": 3, "casfod": 3, "casely": 3, "atl": 4, "atlantic": 4, "knh": 7, "nkrumah": 7,
  "ucc hospital": 2, "campus hospital": 2, "student clinic": 2,
  "science": 8, "science annex": 8, "main auditorium": 61, "ucc auditorium": 61, "900": 60,
  "sob": 65, "business school": 65, "sms": 66, "medical school": 66, "sgs": 68, "graduate school": 68,
  "code": 69, "distance education": 69, "ids": 72, "old admin": 76, "new admin": 74,
  "old site station": 90, "old site shuttle": 90, "science station": 91, "science shuttle": 91, "valco station": 92,
};

const shuttleRoutes = [
  { name: "Campus Connector", stops: [90, 91, 92], period: "Academic days · operating times follow posted campus notices", interval: 15 },
  { name: "Old Site–Science Link", stops: [90, 91], period: "Academic days · peak teaching periods", interval: 12 },
  { name: "Science–Valco Link", stops: [91, 92], period: "Academic days · peak teaching periods", interval: 15 },
];

function normalizeDestination(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function editDistance(a: string, b: string) {
  const matrix = Array.from({ length: b.length + 1 }, (_, row) => [row, ...Array(a.length).fill(0)]);
  for (let column = 0; column <= a.length; column++) matrix[0][column] = column;
  for (let row = 1; row <= b.length; row++) for (let column = 1; column <= a.length; column++) {
    matrix[row][column] = b[row - 1] === a[column - 1] ? matrix[row - 1][column - 1] : 1 + Math.min(matrix[row - 1][column - 1], matrix[row][column - 1], matrix[row - 1][column]);
  }
  return matrix[b.length][a.length];
}

function findDestination(input: string) {
  const normalized = normalizeDestination(input);
  const alias = Object.entries(destinationAliases).sort((a, b) => b[0].length - a[0].length).find(([name]) => normalized.includes(name));
  if (alias) return places.find((place) => place.id === alias[1]) ?? null;
  const direct = places.slice().sort((a, b) => b.name.length - a.name.length).find((place) => normalized.includes(normalizeDestination(place.name)));
  if (direct) return direct;
  const queryWords = normalized.split(" ").filter((word) => word.length > 2 && !["where", "find", "show", "directions", "direction", "route", "walk", "shuttle", "please", "campus"].includes(word));
  let best: { place: Place; score: number } | null = null;
  for (const place of places) {
    const placeWords = normalizeDestination(place.name).split(" ").filter((word) => word.length > 2);
    const matches = queryWords.filter((queryWord) => placeWords.some((placeWord) => editDistance(queryWord, placeWord) <= Math.max(1, Math.floor(placeWord.length * 0.28)))).length;
    const score = matches / Math.max(queryWords.length, placeWords.length * 0.65, 1);
    if (!best || score > best.score) best = { place, score };
  }
  return best && best.score >= 0.42 ? best.place : null;
}

const categories = [
  ["All places", "⌘"], ["Academic", "▤"], ["Accommodation", "▦"], ["Health", "+"],
  ["Hostels", ""], ["Dining", "●"], ["Banking", "₵"], ["Transport", "↔"], ["Safety", "◇"], ["Recreation", "◉"], ["Landmark", "◆"],
];

const quickActions = [
  ["Find a place", "⌖", "Explore campus facilities", "map"],
  ["Report an issue", "!", "Tell us what needs attention", "report"],
  ["Emergency", "+", "Get help right away", "emergency"],
  ["Ask Campus AI", "✦", "Answers from campus data", "assistant"],
];

export default function Home() {
  const [active, setActive] = useState("Home");
  const [category, setCategory] = useState("All places");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<number[]>([1]);
  const [selected, setSelected] = useState<Place | null>(places[0]);
  const [panel, setPanel] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([
    { from: "ai", text: "Welcome! I’m getting your UCC Campus AI ready." },
  ]);
  const [message, setMessage] = useState("");
  const [account, setAccount] = useState<Account>({ identity: null, profile: null });
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState("");
  const [welcomeTime] = useState(() => new Date());
  const [weather, setWeather] = useState<CampusWeather | null>(null);
  const [weatherError, setWeatherError] = useState(false);
  const [route, setRoute] = useState<RoutePreview | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [timetableError, setTimetableError] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [lastReferencedPlace, setLastReferencedPlace] = useState<Place | null>(null);
  const [shuttleDestinationId, setShuttleDestinationId] = useState(57);
  const [issueDraft, setIssueDraft] = useState<IssueDraft | null>(null);
  const [issueSubmitting, setIssueSubmitting] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({ accessibilityRequired: false, travelMode: "walking", savedPlaces: [], recentQuestions: [], visitCounts: {} });
  const [campusUpdates, setCampusUpdates] = useState<CampusUpdate[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, string>>({});
  const [correctionTarget, setCorrectionTarget] = useState<string | null>(null);
  const [correctionText, setCorrectionText] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const lc = languageCopy[language];

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("ucc-language") as Language | null;
    if (savedLanguage && languageOptions.some((item) => item.code === savedLanguage)) setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("ucc-language", language);
    document.documentElement.lang = language === "fat" || language === "tw" ? "ak" : language;
  }, [language]);

  useEffect(() => {
    fetch("/api/account", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setAccount(data))
      .catch(() => setAccountError("Account details could not be loaded."))
      .finally(() => setAccountLoading(false));
  }, []);

  useEffect(() => {
    if (!account.identity) {
      setTimetable([]);
      return;
    }
    fetch("/api/timetable", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setTimetable(data.entries ?? []))
      .catch(() => setTimetableError("Your timetable could not be loaded."));
  }, [account.identity]);

  useEffect(() => {
    if (!account.identity) return;
    fetch("/api/preferences", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        setPreferences(data);
        setSaved(data.savedPlaces ?? []);
      })
      .catch(() => undefined);
  }, [account.identity]);

  useEffect(() => {
    fetch("/api/campus-updates")
      .then((response) => {
        if (!response.ok) throw new Error("Updates unavailable");
        return response.json();
      })
      .then((data) => setCampusUpdates(data.updates ?? []))
      .catch(() => setCampusUpdates([]))
      .finally(() => setUpdatesLoading(false));
  }, []);

  useEffect(() => {
    let activeRequest = true;
    const loadWeather = () => {
      fetch("https://api.open-meteo.com/v1/forecast?latitude=5.1165&longitude=-1.2909&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day&timezone=Africa%2FAccra", { cache: "no-store" })
        .then((response) => {
          if (!response.ok) throw new Error("Weather service unavailable");
          return response.json();
        })
        .then((data) => {
          if (!activeRequest || !data.current) return;
          setWeather({
            temperature: data.current.temperature_2m,
            apparentTemperature: data.current.apparent_temperature,
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            weatherCode: data.current.weather_code,
            isDay: Boolean(data.current.is_day),
          });
          setWeatherError(false);
        })
        .catch(() => {
          if (activeRequest) setWeatherError(true);
        });
    };
    loadWeather();
    const refresh = window.setInterval(loadWeather, 10 * 60 * 1000);
    return () => {
      activeRequest = false;
      window.clearInterval(refresh);
    };
  }, []);

  const accountName = account.profile?.fullName ?? account.identity?.displayName ?? "Create account";
  const accountInitials = accountName === "Create account" ? "+" : accountName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const identityFirstName = accountName.includes("@")
    ? accountName.split("@")[0].split(/[._-]/)[0]
    : accountName.split(/\s+/)[0];
  const firstName = identityFirstName.charAt(0).toUpperCase() + identityFirstName.slice(1);
  const signedIn = Boolean(account.identity);
  const timeGreeting = welcomeTime.getHours() < 12 ? "Good morning" : welcomeTime.getHours() < 18 ? "Good afternoon" : "Good evening";
  const welcomeDate = new Intl.DateTimeFormat("en-GH", { weekday: "long", month: "long", day: "numeric" }).format(welcomeTime).toUpperCase();
  const todayKey = dateKey(welcomeTime);
  const todayUpdates = campusUpdates.filter((update) => update.startDate <= todayKey && update.endDate >= todayKey && update.category === "Academic calendar");
  const latestUpdates = campusUpdates.filter((update) => update.source === "UCC News").slice(0, 3);
  const featuredUpdate = latestUpdates[0];

  async function saveAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAccountError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/account", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fullName: form.get("fullName"),
        studentId: form.get("studentId"),
        programme: form.get("programme"),
        level: form.get("level"),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setAccountError(data.error ?? "Account could not be saved.");
      return;
    }
    setAccount(data);
    setPanel(null);
    toast(account.profile ? "Profile updated" : "Your UCC Connect account is ready");
  }

  async function saveTimetableEntries(entries: Omit<TimetableEntry, "id">[]) {
    setTimetableError("");
    const response = await fetch("/api/timetable", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ entries }),
    });
    const data = await response.json();
    if (!response.ok) {
      setTimetableError(data.error ?? "Timetable could not be saved.");
      return false;
    }
    setTimetable(data.entries ?? []);
    toast(entries.length > 1 ? `${entries.length} classes imported` : "Class added to your timetable");
    return true;
  }

  async function updatePreferences(patch: Record<string, unknown>) {
    if (!signedIn) return;
    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
        setSaved(data.savedPlaces ?? []);
      }
    } catch {
      // Keep the current session responsive if preference syncing is unavailable.
    }
  }

  function toggleSavedPlace(placeId: number) {
    const next = saved.includes(placeId) ? saved.filter((id) => id !== placeId) : [...saved, placeId];
    setSaved(next);
    updatePreferences({ savedPlaces: next });
    toast(next.includes(placeId) ? "Place saved" : "Place removed from saved");
  }

  async function addTimetableEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const venue = String(form.get("venue") ?? "");
    const matchedVenue = places.find((place) => place.name === venue);
    const saved = await saveTimetableEntries([{
      courseCode: String(form.get("courseCode") ?? ""),
      title: String(form.get("title") ?? ""),
      venue,
      placeId: matchedVenue?.id ?? null,
      dayOfWeek: Number(form.get("dayOfWeek")),
      startTime: String(form.get("startTime") ?? ""),
      endTime: String(form.get("endTime") ?? ""),
      reminderMinutes: Number(form.get("reminderMinutes") ?? 20),
    }]);
    if (saved) event.currentTarget.reset();
  }

  async function deleteTimetableEntry(id: string) {
    const response = await fetch(`/api/timetable?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await response.json();
    if (response.ok) {
      setTimetable(data.entries ?? []);
      toast("Class removed");
    }
  }

  async function importTimetable(file: File) {
    const text = await file.text();
    const rows = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const dataRows = rows[0]?.toLowerCase().includes("course") ? rows.slice(1) : rows;
    const entries = dataRows.map((line) => {
      const [courseCode, title, day, startTime, endTime, venue, reminder = "20"] = line.split(",").map((value) => value.trim());
      const dayOfWeek = dayNames.findIndex((name) => name.toLowerCase().startsWith(day?.toLowerCase()));
      const matchedVenue = places.find((place) => place.name.toLowerCase() === venue?.toLowerCase());
      return { courseCode, title, venue, placeId: matchedVenue?.id ?? null, dayOfWeek, startTime, endTime, reminderMinutes: Number(reminder) };
    }).filter((entry) => entry.courseCode && entry.title && entry.venue && entry.dayOfWeek >= 0);
    if (!entries.length) {
      setTimetableError("No valid classes were found. Use: course,title,day,start,end,venue,reminder");
      return;
    }
    await saveTimetableEntries(entries);
  }

  const filtered = useMemo(() => places.filter((place) => {
    const matchesCategory = category === "All places" || place.category === category;
    const matchesQuery = `${place.name} ${place.category} ${place.distance} ${place.hours}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, query]);
  const mapLat = selected?.lat ?? 5.104722;
  const mapLon = selected?.lon ?? -1.282847;
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapLon - 0.004}%2C${mapLat - 0.0035}%2C${mapLon + 0.004}%2C${mapLat + 0.0035}&layer=mapnik`;
  const fullMapUrl = `https://www.openstreetmap.org/?mlat=${mapLat}&mlon=${mapLon}#map=18/${mapLat}/${mapLon}`;
  const weatherCondition = weather ? describeWeather(weather.weatherCode, weather.isDay) : null;
  const routeDrawing = useMemo(() => {
    if (!route?.coordinates.length) return null;
    const lons = route.coordinates.map(([lon]) => lon);
    const lats = route.coordinates.map(([, lat]) => lat);
    const minLon = Math.min(...lons) - 0.0007;
    const maxLon = Math.max(...lons) + 0.0007;
    const minLat = Math.min(...lats) - 0.00055;
    const maxLat = Math.max(...lats) + 0.00055;
    const points = route.coordinates.map(([lon, lat]) => `${((lon - minLon) / (maxLon - minLon)) * 1000},${600 - ((lat - minLat) / (maxLat - minLat)) * 600}`).join(" ");
    return {
      points,
      mapUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik`,
    };
  }, [route]);
  const nextClass = useMemo(() => {
    const now = new Date();
    const candidates = timetable.map((entry) => {
      const [hours, minutes] = entry.startTime.split(":").map(Number);
      const start = new Date(now);
      let dayOffset = (entry.dayOfWeek - now.getDay() + 7) % 7;
      start.setDate(now.getDate() + dayOffset);
      start.setHours(hours, minutes, 0, 0);
      if (start.getTime() <= now.getTime()) {
        dayOffset += 7;
        start.setDate(start.getDate() + 7);
      }
      return { entry, start, minutesAway: Math.round((start.getTime() - now.getTime()) / 60000) };
    });
    return candidates.sort((a, b) => a.start.getTime() - b.start.getTime())[0] ?? null;
  }, [timetable, welcomeTime]);
  const contextSuggestions = useMemo(() => {
    const suggestions: { title: string; detail: string; action?: string }[] = [];
    if (nextClass) {
      const when = nextClass.minutesAway < 120 ? `in ${nextClass.minutesAway} minutes` : `${dayNames[nextClass.entry.dayOfWeek]} at ${nextClass.entry.startTime}`;
      suggestions.push({ title: `${nextClass.entry.courseCode} begins ${when}`, detail: `${nextClass.entry.title} · ${nextClass.entry.venue}`, action: `Directions to ${nextClass.entry.venue}` });
      const venue = places.find((place) => place.id === nextClass.entry.placeId);
      if (venue && currentLocation && nextClass.minutesAway < 180) {
        const distanceKm = Math.hypot((venue.lat - currentLocation.lat) * 111, (venue.lon - currentLocation.lon) * 110.5);
        const walkingMinutes = Math.max(2, Math.round(distanceKm / 4.8 * 60));
        const leaveIn = nextClass.minutesAway - walkingMinutes - 5;
        suggestions.push({ title: leaveIn <= 0 ? "Leave now to arrive on time" : `Leave in about ${leaveIn} minutes`, detail: `Estimated ${walkingMinutes}-minute walk to ${venue.name}`, action: `Directions to ${venue.name}` });
      }
    }
    if (weather && [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weather.weatherCode)) {
      suggestions.push({ title: "Wet weather on campus", detail: "Consider an umbrella or campus shuttle before your next class." });
    } else if (weather && weather.temperature >= 30) {
      suggestions.push({ title: "It is hot on campus", detail: "Carry water and allow time for a shaded walking route." });
    }
    if (account.profile && !timetable.length) suggestions.push({ title: `Set up your Level ${account.profile.level} timetable`, detail: `Add ${account.profile.programme} classes for reminders and departure guidance.` });
    return suggestions.slice(0, 3);
  }, [nextClass, currentLocation, weather, account.profile, timetable.length]);
  const shuttleDestination = places.find((place) => place.id === shuttleDestinationId) ?? places[56];
  const recommendedShuttleStop = places.filter((place) => place.category === "Transport").map((stop) => ({ stop, distance: distanceMeters(stop, shuttleDestination) })).sort((a, b) => a.distance - b.distance)[0];

  useEffect(() => {
    if (accountLoading) return;
    setChat((current) => current.length === 1
      ? [{
          from: "ai",
          text: signedIn
            ? `Hi ${firstName}! I can help with UCC directions, hostels, lecture halls, academic facilities, services, weather${account.profile ? `, and information relevant to your ${account.profile.programme} profile` : ""}. What do you need?`
            : "Hi! I can help with UCC directions, hostels, lecture halls, academic facilities, services, and current campus weather. Sign in for a personalized experience.",
        }]
      : current);
  }, [accountLoading, signedIn, firstName, account.profile]);

  useEffect(() => {
    if (filtered.length && (query.trim() || category !== "All places")) setSelected(filtered[0]);
  }, [filtered, query, category]);

  function toast(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2600);
  }

  async function loadWalkingRoute(startLat: number, startLon: number, destination: Place) {
    setRouteLoading(true);
    setRoute(null);
    const fallbackUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${startLat}%2C${startLon}%3B${destination.lat}%2C${destination.lon}`;
    try {
      const response = await fetch(`https://routing.openstreetmap.de/routed-foot/route/v1/driving/${startLon},${startLat};${destination.lon},${destination.lat}?overview=full&geometries=geojson&steps=true`);
      if (!response.ok) throw new Error("Routing unavailable");
      const data = await response.json();
      const result = data.routes?.[0];
      if (!result?.geometry?.coordinates) throw new Error("No walking route");
      const coordinates = result.geometry.coordinates as [number, number][];
      const landmarkCandidates = places.filter((place) => place.id !== destination.id).map((place) => {
        const proximity = coordinates.reduce((closest, [lon, lat]) => Math.min(closest, Math.hypot(place.lon - lon, place.lat - lat)), Number.POSITIVE_INFINITY);
        return { place, proximity };
      }).filter(({ proximity }) => proximity < 0.0012).sort((a, b) => a.proximity - b.proximity).slice(0, 4).map(({ place }) => place);
      const steps = (result.legs?.[0]?.steps ?? []).filter((step: any) => step.distance > 2 || step.maneuver?.type === "arrive").map((step: any) => ({
        instruction: routeInstruction(step),
        distance: step.distance,
        duration: step.duration,
      }));
      setRoute({
        destination,
        distance: result.distance,
        duration: result.duration,
        coordinates,
        steps,
        landmarks: landmarkCandidates,
        start: { lat: startLat, lon: startLon },
      });
      setChat((current) => [...current, {
        from: "ai",
        text: `Your walking route to ${destination.name} is ready: ${(result.distance / 1000).toFixed(1)} km, about ${Math.max(1, Math.round(result.duration / 60))} minutes. I’ve opened the interactive preview with landmarks and step-by-step guidance.`,
        url: fallbackUrl,
        linkLabel: "Open route in OpenStreetMap →",
        placeId: destination.id,
      }]);
    } catch {
      setChat((current) => [...current, {
        from: "ai",
        text: `I found your location, but the in-app walking route could not be loaded. You can still open directions to ${destination.name} in OpenStreetMap.`,
        url: fallbackUrl,
        linkLabel: `Open directions to ${destination.name} →`,
      }]);
    } finally {
      setRouteLoading(false);
    }
  }

  function startVoiceInput() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast("Voice input is not supported in this browser");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = languageOptions.find((item) => item.code === language)?.speech ?? "en-GH";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      toast("Voice input could not be started");
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      sendMessage(transcript);
    };
    recognition.start();
  }

  function speakRoute() {
    if (!route || !("speechSynthesis" in window)) {
      toast("Spoken directions are not supported in this browser");
      return;
    }
    window.speechSynthesis.cancel();
    const text = `Walking directions to ${route.destination.name}. ${route.steps.map((step) => `${step.instruction}.`).join(" ")}`;
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = languageOptions.find((item) => item.code === language)?.speech ?? "en-GH";
    speech.rate = 0.92;
    window.speechSynthesis.speak(speech);
  }

  function shareNearbyResults(kind: "food" | "atm" | "library" | "hostel", origin: { lat: number; lon: number }, originLabel: string) {
    const candidates = places.filter((place) => {
      if (kind === "food") return place.category === "Dining";
      if (kind === "atm") return place.category === "Banking";
      if (kind === "library") return /library/i.test(place.name);
      return place.category === "Hostels" || place.category === "Accommodation";
    }).map((place) => ({ place, distance: distanceMeters(origin, place) })).sort((a, b) => {
      const accessibilityA = preferences.accessibilityRequired && !a.place.accessible ? 500 : 0;
      const accessibilityB = preferences.accessibilityRequired && !b.place.accessible ? 500 : 0;
      return (a.distance + accessibilityA) - (b.distance + accessibilityB);
    }).slice(0, 3);
    if (!candidates.length) {
      setChat((current) => [...current, { from: "ai", text: `I could not find a mapped ${kind} near ${originLabel}.` }]);
      return;
    }
    const nearest = candidates[0].place;
    setSelected(nearest);
    setLastReferencedPlace(nearest);
    setChat((current) => [...current, {
      from: "ai",
      text: `Closest ${kind === "food" ? "food options" : `${kind}s`} to ${originLabel}: ${candidates.map(({ place, distance }) => `${place.name} (${distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(1)} km`})`).join(", ")}. I’ve selected ${nearest.name} on the map.`,
      placeId: nearest.id,
    }]);
  }

  function useLocationForIssue() {
    if (!navigator.geolocation || !issueDraft) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setCurrentLocation({ lat: coords.latitude, lon: coords.longitude });
      setIssueDraft((draft) => draft ? { ...draft, latitude: coords.latitude, longitude: coords.longitude, locationText: draft.locationText || "Current location shared" } : draft);
      toast("Current location attached");
    }, () => toast("Location access was not available"), { enableHighAccuracy: true, timeout: 12000 });
  }

  async function submitIssue() {
    if (!issueDraft || issueSubmitting) return;
    if (!signedIn) {
      setPanel("profile");
      return;
    }
    if (issueDraft.locationText.trim().length < 2) {
      setChat((current) => [...current, { from: "ai", text: "Please add the issue location or attach your current location before submitting." }]);
      return;
    }
    setIssueSubmitting(true);
    const form = new FormData();
    form.set("category", issueDraft.category);
    form.set("description", issueDraft.description);
    form.set("locationText", issueDraft.locationText);
    if (issueDraft.latitude != null) form.set("latitude", String(issueDraft.latitude));
    if (issueDraft.longitude != null) form.set("longitude", String(issueDraft.longitude));
    if (issueDraft.photo) form.set("photo", issueDraft.photo);
    try {
      const response = await fetch("/api/issues", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Report could not be submitted.");
      setChat((current) => [...current, { from: "ai", text: `Report ${data.id.slice(0, 8).toUpperCase()} was submitted successfully${data.hasPhoto ? " with your photo" : ""}. Campus support can now review it.` }]);
      setIssueDraft(null);
      toast("Issue report submitted");
    } catch (error) {
      setChat((current) => [...current, { from: "ai", text: error instanceof Error ? error.message : "Report could not be submitted." }]);
    } finally {
      setIssueSubmitting(false);
    }
  }

  function shareEmergencyLocation() {
    if (!navigator.geolocation) {
      toast("Location sharing is not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const location = { lat: coords.latitude, lon: coords.longitude };
      setCurrentLocation(location);
      const url = `https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lon}#map=18/${location.lat}/${location.lon}`;
      const text = `I need help. My current location is ${location.lat.toFixed(6)}, ${location.lon.toFixed(6)}. ${url}`;
      try {
        if (navigator.share) await navigator.share({ title: "Emergency location", text, url });
        else {
          await navigator.clipboard.writeText(text);
          toast("Emergency location copied");
        }
      } catch {
        toast("Location is ready to share");
      }
    }, () => toast("Location access was not available"), { enableHighAccuracy: true, timeout: 12000 });
  }

  async function submitAiFeedback(item: ChatMessage, rating: "helpful" | "not_helpful" | "incorrect") {
    if (!item.id || feedbackGiven[item.id]) return;
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messageId: item.id, rating, question: item.question, answer: item.text, correction: rating === "incorrect" ? correctionText : undefined, placeId: item.placeId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Feedback could not be saved.");
      setFeedbackGiven((current) => ({ ...current, [item.id!]: rating }));
      setCorrectionTarget(null);
      setCorrectionText("");
      toast(rating === "helpful" ? "Thanks for your feedback" : "Feedback saved for review");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Feedback could not be saved");
    }
  }

  function sendMessage(prompt?: string) {
    const q = (prompt ?? message).trim();
    if (!q) return;
    setChat((current) => [...current, { from: "user", text: q }]);
    updatePreferences({ recentQuestion: q });
    setMessage("");
    window.setTimeout(() => {
      const lower = q.toLowerCase();
      const matchedPlace = findDestination(q);
      const wantsDirections = /\b(direction|directions|route|walk|walking|navigate|get to|how do i get)\b/.test(lower);
      const wantsShuttle = /\b(shuttle|campus bus|bus stop|next bus)\b/.test(lower);
      const wantsIssueReport = /\b(report|broken|faulty|leak|leaking|no water|security concern|damaged|damage|not working)\b/.test(lower);
      const wantsDuration = /\b(how long|how far|travel time|walking time)\b/.test(lower);
      const wantsCampusUpdates = /\b(event|events|announcement|announcements|seminar|seminars|workshop|conference|src|deadline|deadlines|exam|exams|examination|examinations|academic calendar|registration date)\b/.test(lower);
      const discoveryKind: "food" | "atm" | "library" | "hostel" | null =
        /\b(eat|food|restaurant|canteen|cafe)\b/.test(lower) ? "food" :
        /\b(atm|bank|cash)\b/.test(lower) ? "atm" :
        /\b(library|libraries)\b/.test(lower) ? "library" :
        /\b(hostel|hall|accommodation)\b/.test(lower) && /\b(near|nearest|closest)\b/.test(lower) ? "hostel" : null;
      const wantsDiscovery = Boolean(discoveryKind && /\b(near|nearby|nearest|closest|find|where)\b/.test(lower));
      const personalLead = signedIn ? `${firstName}, ` : "";
      let answer = `${personalLead}I can answer questions about ${places.length} mapped UCC places. Try a facility name, “list lecture halls”, “show hostels in Kwaprow”, “campus weather”, or “my profile”.`;
      let responsePlace: Place | null = null;
      let responseUpdates: CampusUpdate[] | undefined;

      if (wantsCampusUpdates) {
        const terms = lower.split(/\W+/).filter((term) => term.length > 3 && !["what", "when", "show", "about", "latest", "current"].includes(term));
        const matches = campusUpdates.filter((update) => {
          const haystack = `${update.title} ${update.summary} ${update.category}`.toLowerCase();
          return terms.length === 0 || terms.some((term) => haystack.includes(term) || (term.startsWith("exam") && haystack.includes("examination")));
        });
        responseUpdates = (matches.length ? matches : campusUpdates).slice(0, 4);
        answer = responseUpdates.length
          ? `Here are ${responseUpdates.length} relevant items from official UCC event and academic-calendar sources. Open a card for the complete university notice.`
          : "I could not reach the current UCC updates feed just now. Please check the official UCC Events portal.";
      } else if (/\b(submit|send|file)\b/.test(lower) && /\b(report|issue)\b/.test(lower) && issueDraft) {
        submitIssue();
        return;
      } else if (wantsIssueReport) {
        if (!signedIn) {
          answer = "Please sign in before submitting an issue so campus support can associate the report with your account.";
        } else {
          const category: IssueDraft["category"] =
            /\b(light|lamp|dark)\b/.test(lower) ? "Lighting" :
            /\b(water|leak|pipe|tap)\b/.test(lower) ? "Water" :
            /\b(security|unsafe|suspicious|threat)\b/.test(lower) ? "Security" :
            /\b(damage|broken|crack)\b/.test(lower) ? "Damage" : "Other";
          setIssueDraft({ category, description: q, locationText: matchedPlace?.name ?? "", latitude: null, longitude: null, photo: null });
          answer = `I’ve started a ${category.toLowerCase()} report${matchedPlace ? ` at ${matchedPlace.name}` : ""}. Add or confirm the location below, optionally attach a photo or your live location, then submit it.`;
        }
      } else if (wantsShuttle) {
        if (matchedPlace && matchedPlace.category !== "Transport") {
          const stops = places.filter((place) => place.category === "Transport");
          const bestStop = stops.map((stop) => ({ stop, distance: distanceMeters(stop, matchedPlace) })).sort((a, b) => a.distance - b.distance)[0];
          const bestRoute = shuttleRoutes.find((item) => item.stops.includes(bestStop.stop.id)) ?? shuttleRoutes[0];
          const eta = Math.max(2, bestRoute.interval - (new Date().getMinutes() % bestRoute.interval));
          setSelected(bestStop.stop);
          setLastReferencedPlace(matchedPlace);
          responsePlace = bestStop.stop;
          answer = `For ${matchedPlace.name}, use ${bestStop.stop.name} on the ${bestRoute.name}. The stop is about ${Math.round(bestStop.distance)} m from the destination. Planning estimate: the next shuttle is in roughly ${eta} minutes. ${bestRoute.period}. This is not live vehicle tracking, so check notices at the stop.`;
        } else {
          const estimates = shuttleRoutes.map((item) => `${item.name}: about ${Math.max(2, item.interval - (new Date().getMinutes() % item.interval))} min`).join("; ");
          answer = `UCC shuttles connect Old Site, Science, and Valco. Current planning estimates are ${estimates}. These are frequency-based estimates, not live bus positions. Open the Shuttle assistant for stops, routes, and operating information.`;
        }
      } else if (wantsDuration && lastReferencedPlace) {
        if (route?.destination.id === lastReferencedPlace.id) {
          answer = `The current walking route to ${lastReferencedPlace.name} is ${(route.distance / 1000).toFixed(1)} km and takes about ${Math.max(1, Math.round(route.duration / 60))} minutes.`;
        } else if (navigator.geolocation) {
          setChat((current) => [...current, { from: "ai", text: `I’ll use your current location to calculate the walking time to ${lastReferencedPlace.name}.` }]);
          navigator.geolocation.getCurrentPosition(({ coords }) => {
            setCurrentLocation({ lat: coords.latitude, lon: coords.longitude });
            loadWalkingRoute(coords.latitude, coords.longitude, lastReferencedPlace);
          }, () => setChat((current) => [...current, { from: "ai", text: "I need location access to calculate your walking time." }]), { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
          return;
        }
      } else if (wantsDiscovery && discoveryKind) {
        const refersToPrevious = /\b(it|there|that place|the place)\b/.test(lower);
        const originPlace = refersToPrevious ? lastReferencedPlace : null;
        if (originPlace) {
          shareNearbyResults(discoveryKind, originPlace, originPlace.name);
          return;
        }
        if (currentLocation) {
          shareNearbyResults(discoveryKind, currentLocation, "your current location");
          return;
        }
        if (navigator.geolocation) {
          setChat((current) => [...current, { from: "ai", text: `Allow location access and I’ll find the closest ${discoveryKind === "food" ? "food options" : discoveryKind} to you.` }]);
          navigator.geolocation.getCurrentPosition(({ coords }) => {
            const origin = { lat: coords.latitude, lon: coords.longitude };
            setCurrentLocation(origin);
            shareNearbyResults(discoveryKind, origin, "your current location");
          }, () => setChat((current) => [...current, { from: "ai", text: "Location access is needed for nearby discovery. You can also name a place, then ask what is closest to it." }]), { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
          return;
        }
      } else if (matchedPlace && wantsDirections) {
        setSelected(matchedPlace);
        setLastReferencedPlace(matchedPlace);
        updatePreferences({ visitedPlaceId: matchedPlace.id });
        if (!navigator.geolocation) {
          setChat((current) => [...current, { from: "ai", text: "This browser does not support location services. Open the destination on the Explore UCC map to choose a starting point manually." }]);
          return;
        }
        setChat((current) => [...current, { from: "ai", text: `I found ${matchedPlace.name}. Allow location access and I’ll create a walking route from where you are now.` }]);
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            setCurrentLocation({ lat: coords.latitude, lon: coords.longitude });
            loadWalkingRoute(coords.latitude, coords.longitude, matchedPlace);
          },
          (error) => {
            const reason = error.code === 1 ? "Location permission was denied" : "Your current location could not be determined";
            setChat((current) => [...current, { from: "ai", text: `${reason}. Enable location access in your browser and ask me again, or open ${matchedPlace.name} on the map.` }]);
          },
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
        );
        return;
      } else if (wantsDirections) {
        answer = "Tell me the destination name as well—for example, “Directions to LLT,” “Walk to Sam Jonah Library,” or “How do I get to UCC Hospital?”";
      } else if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(lower)) {
        answer = `Hi${signedIn ? ` ${firstName}` : ""}! Ask me for a campus location, a list of hostels or lecture halls, current weather, emergency help, or information about your account.`;
      } else if (matchedPlace) {
        setSelected(matchedPlace);
        setLastReferencedPlace(matchedPlace);
        responsePlace = matchedPlace;
        updatePreferences({ visitedPlaceId: matchedPlace.id });
        answer = `${matchedPlace.name} is in ${matchedPlace.distance}. ${matchedPlace.hours}.${matchedPlace.accessible ? " It is marked as wheelchair accessible." : ""} I’ve selected it on the Explore UCC map so you can open its exact location.`;
      } else if (lower.includes("weather") || lower.includes("temperature") || lower.includes("rain")) {
        answer = weather && weatherCondition
          ? `Current conditions at UCC are ${Math.round(weather.temperature)}°C and ${weatherCondition.label.toLowerCase()}. It feels like ${Math.round(weather.apparentTemperature)}°C, with ${weather.humidity}% humidity and wind around ${Math.round(weather.windSpeed)} km/h.`
          : "The live UCC weather service is still loading. The current conditions card on the homepage will update automatically.";
      } else if (lower.includes("hostel")) {
        const area = ["amamoma", "ayensu", "kwaprow", "northern"].find((item) => lower.includes(item));
        const hostels = places.filter((place) => place.category === "Hostels" && (!area || place.distance.toLowerCase().includes(area)));
        answer = `${area ? `I found ${hostels.length} hostels around ${area.charAt(0).toUpperCase() + area.slice(1)}` : `The directory contains ${hostels.length} mapped hostels`}: ${hostels.slice(0, 8).map((place) => place.name).join(", ")}${hostels.length > 8 ? ", and more" : ""}. Select Hostels in Explore UCC to view every result and exact map marker.`;
      } else if (lower.includes("lecture") || lower.includes("auditorium")) {
        const halls = places.filter((place) => /lecture|auditorium/i.test(place.name));
        answer = `Mapped UCC lecture and auditorium facilities include ${halls.map((place) => place.name).join(", ")}. Tell me one name or acronym and I’ll select it on the map.`;
      } else if (lower.includes("academic") || lower.includes("faculty") || lower.includes("school") || lower.includes("library")) {
        const academic = places.filter((place) => place.category === "Academic");
        answer = `Explore UCC currently has ${academic.length} academic facilities, including Sam Jonah Library, LLT, CALC, NLT, the faculties of Science, Arts and Social Sciences, the School of Business, School of Medical Sciences, IDS, and both administration areas. Ask for any one by name.`;
      } else if (lower.includes("clinic") || lower.includes("health") || lower.includes("hospital")) {
        answer = "UCC University Hospital is on South Campus and serves students, staff, and the public. Accident and Emergency can be reached on +233 31 229 2614; UCC Ambulance can be reached on 020 526 9824, 054 991 0148, or 027 001 3890. I can also show the hospital on the map.";
      } else if (lower.includes("atm") || lower.includes("bank")) {
        answer = "ADB Bank is mapped on Northern Campus along Casford Road. Ask me to show ADB Bank and I’ll select its exact map location.";
      } else if (lower.includes("emergency") || lower.includes("security") || lower.includes("danger")) {
        answer = "For campus response, call UCC emergency on 020 300 5175. For immediate danger, call Ghana’s Emergency Response Centre on 112, Police on 191, Fire Service on 192, or Ambulance on 193. You can open the Emergency panel for UCC health, ambulance, and fire contacts.";
      } else if (lower.includes("profile") || lower.includes("programme") || lower.includes("level") || lower.includes("who am i")) {
        answer = account.profile
          ? `You’re signed in as ${account.profile.fullName}, ${account.profile.programme}, Level ${account.profile.level}, with ID ${account.profile.studentId}. I’ll use your first name and programme context when helpful.`
          : signedIn ? "You’re signed in, but your UCC profile is not complete yet. Open your account menu to add your name, ID, programme, and level." : "You’re currently browsing as a guest. Sign in and complete your UCC profile to personalize Campus AI.";
      } else if (lower.includes("saved") || lower.includes("favourite") || lower.includes("favorite")) {
        const savedPlaces = places.filter((place) => saved.includes(place.id));
        answer = savedPlaces.length ? `You have saved ${savedPlaces.map((place) => place.name).join(", ")}.` : "You have no saved places yet. Use the heart beside a directory result to save it.";
      } else if (lower.includes("timetable") || lower.includes("next class") || lower.includes("lecture today")) {
        answer = nextClass
          ? `Your next class is ${nextClass.entry.courseCode}, ${nextClass.entry.title}, at ${nextClass.entry.venue} on ${dayNames[nextClass.entry.dayOfWeek]} at ${nextClass.entry.startTime}. Ask for directions to ${nextClass.entry.venue} when you are ready to leave.`
          : signedIn ? "Your timetable is empty. Open My timetable to add a class or import a CSV file." : "Sign in to create a personal timetable with reminders and route suggestions.";
      }
      setChat((current) => [...current, { id: crypto.randomUUID(), from: "ai", text: lc.answerLead ? `${lc.answerLead}\n${answer}` : answer, question: q, placeId: responsePlace?.id, updates: responseUpdates }]);
    }, 450);
  }

  function openAction(key: string) {
    if (key === "map") {
      setActive("Map");
      document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
    } else if (key === "report") {
      setPanel("assistant");
      window.setTimeout(() => sendMessage("I want to report an issue"), 100);
    } else setPanel(key);
  }

  function renderAssistant(fullPage = false) {
    return <>
      <div className="assistant-heading">
        <div><div className="modal-icon ai">✦</div><h2>{signedIn ? `${firstName}’s Campus AI` : "UCC Campus AI"}</h2><p className="modal-subtitle">{account.profile ? `Personalized for ${account.profile.programme} · Level ${account.profile.level}` : "Answers grounded in verified UCC information"}</p></div>
        <div className="assistant-head-actions"><label className="language-picker"><span>Language</span><select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>{languageOptions.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label><button className="ai-page-link" onClick={() => setPanel("shuttle")}>↔ Shuttle assistant</button><button className="ai-page-link" onClick={() => setPanel("timetable")}>▦ My timetable</button>{!fullPage && <button className="ai-page-link" onClick={() => setPanel("assistant-page")}>Open full page ↗</button>}</div>
      </div>
      {contextSuggestions.length > 0 && <div className="context-suggestions">{contextSuggestions.map((suggestion) => <button key={suggestion.title} onClick={() => suggestion.action ? sendMessage(suggestion.action) : undefined}><span>✦</span><div><b>{suggestion.title}</b><small>{suggestion.detail}</small></div>{suggestion.action && <em>→</em>}</button>)}</div>}
      {issueDraft && <div className="chat-report-draft">
        <div><span>REPORT DRAFT · {issueDraft.category.toUpperCase()}</span><b>{issueDraft.description}</b></div>
        <input value={issueDraft.locationText} onChange={(event) => setIssueDraft({ ...issueDraft, locationText: event.target.value })} placeholder="Where is the issue?" aria-label="Issue location" />
        <div className="report-attachments"><button onClick={useLocationForIssue}>◎ {issueDraft.latitude != null ? "Location attached" : "Attach location"}</button><label>▧ {issueDraft.photo ? issueDraft.photo.name : "Add photo"}<input type="file" accept="image/*" capture="environment" onChange={(event) => setIssueDraft({ ...issueDraft, photo: event.target.files?.[0] ?? null })} /></label><button className="submit-chat-report" onClick={submitIssue} disabled={issueSubmitting}>{issueSubmitting ? "Submitting…" : "Submit report"}</button></div>
      </div>}
      <div className={`assistant-layout ${route || routeLoading ? "has-route" : ""}`}>
        <div className="assistant-conversation">
          <div className="chat-log">{chat.map((item, index) => {
            const cardPlace = item.placeId ? places.find((place) => place.id === item.placeId) : null;
            const cardMap = cardPlace ? `https://www.openstreetmap.org/export/embed.html?bbox=${cardPlace.lon - 0.002}%2C${cardPlace.lat - 0.0017}%2C${cardPlace.lon + 0.002}%2C${cardPlace.lat + 0.0017}&layer=mapnik` : "";
            return <div key={index} className={`chat-message ${item.from}`}>
              <div className={`bubble ${item.from}`}>{item.text}{item.url && <a href={item.url} target="_blank" rel="noreferrer">{item.linkLabel}</a>}</div>
              {item.updates && <div className="chat-update-cards">{item.updates.map((update) => <a key={update.id} href={update.url} target="_blank" rel="noreferrer">
                <span>{update.category}</span><b>{update.title}</b>
                <small>{new Date(update.startDate).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}{update.endDate !== update.startDate ? ` – ${new Date(update.endDate).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}` : ""}</small>
                <p>{update.summary}</p><em>{update.source} ↗</em>
              </a>)}</div>}
              {cardPlace && <article className="facility-card">
                <div className="facility-map"><iframe title={`Map preview of ${cardPlace.name}`} src={cardMap} loading="lazy" /><span className="osm-marker" aria-hidden="true" /></div>
                <div className="facility-card-body"><div className="facility-title"><span style={{ background: cardPlace.color }}>{cardPlace.icon}</span><div><b>{cardPlace.name}</b><small>{cardPlace.category} · {cardPlace.distance}</small></div></div>
                <div className="facility-facts"><span><b>Hours / location</b>{cardPlace.hours}</span><span><b>Accessibility</b>{cardPlace.accessible ? "♿ Accessible" : "Not confirmed"}</span><span><b>Contact</b>{placeContact(cardPlace)}</span></div>
                <div className="facility-actions"><button onClick={() => sendMessage(`${preferences.travelMode === "shuttle" ? "Shuttle" : "Directions"} to ${cardPlace.name}`)}>⌖ {preferences.travelMode === "shuttle" ? "Shuttle route" : "Directions"}</button><button onClick={() => toggleSavedPlace(cardPlace.id)}>{saved.includes(cardPlace.id) ? "♥ Saved" : "♡ Save"}</button><button onClick={() => { setSelected(cardPlace); setPanel(null); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}>Open map</button></div></div>
              </article>}
              {account.identity?.emailVerified && item.from === "ai" && item.id && item.id !== "welcome" && <div className="answer-feedback">
                {feedbackGiven[item.id] ? <span>✓ {lc.received}</span> : <>
                  <button onClick={() => submitAiFeedback(item, "helpful")}>👍 {lc.helpful}</button>
                  <button onClick={() => submitAiFeedback(item, "not_helpful")}>👎 {lc.notHelpful}</button>
                  <button onClick={() => { setCorrectionTarget(item.id!); setCorrectionText(""); }}>⚑ {lc.incorrect}</button>
                </>}
                {correctionTarget === item.id && !feedbackGiven[item.id] && <div className="correction-form">
                  <label>{lc.correction}</label>
                  <textarea value={correctionText} onChange={(event) => setCorrectionText(event.target.value)} placeholder="Tell us what is incorrect and, if possible, the correct information." />
                  <div><button onClick={() => setCorrectionTarget(null)}>{lc.cancel}</button><button className="send-correction" disabled={correctionText.trim().length < 5} onClick={() => submitAiFeedback(item, "incorrect")}>{lc.send}</button></div>
                </div>}
              </div>}
            </div>;
          })}</div>
          <div className="ai-suggestions">
            {["What UCC events are coming up?", "Examination deadlines", "Latest SRC announcements", "Find the closest ATM", "My next class"].map((prompt) => <button key={prompt} onClick={() => sendMessage(prompt)}>{prompt}</button>)}
          </div>
          <div className="chat-input">
            <button className={`voice-button ${listening ? "listening" : ""}`} onClick={startVoiceInput} aria-label="Ask Campus AI by voice" title="Ask by voice">{listening ? "●" : "🎙"}</button>
            <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder={listening ? lc.listening : lc.ask} autoFocus />
            <button onClick={() => sendMessage()} aria-label="Send message">↑</button>
          </div>
        </div>
        {(route || routeLoading) && <aside className="route-preview">
          {routeLoading && <div className="route-loading"><span>⌖</span><b>Building your walking route…</b><small>Using your live location and UCC map data</small></div>}
          {route && routeDrawing && <>
            <div className="route-summary"><div><span>WALKING ROUTE</span><h3>{route.destination.name}</h3></div><button onClick={speakRoute}>🔊 Speak directions</button></div>
            <div className="route-metrics"><div><b>{(route.distance / 1000).toFixed(1)} km</b><span>Distance</span></div><div><b>{Math.max(1, Math.round(route.duration / 60))} min</b><span>Estimated walk</span></div><div><b>{route.steps.length}</b><span>Steps</span></div></div>
            <div className="route-map">
              <iframe title={`Walking route to ${route.destination.name}`} src={routeDrawing.mapUrl} />
              <svg viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><polyline points={routeDrawing.points} /></svg>
            </div>
            {route.landmarks.length > 0 && <div className="route-landmarks"><b>Landmarks along the way</b><div>{route.landmarks.map((place) => <span key={place.id}>{place.icon} {place.name}</span>)}</div></div>}
            <div className="route-steps"><b>Step-by-step directions</b><ol>{route.steps.map((step, index) => <li key={`${step.instruction}-${index}`}><span>{index + 1}</span><div><b>{step.instruction}</b><small>{step.distance < 1000 ? `${Math.round(step.distance)} m` : `${(step.distance / 1000).toFixed(1)} km`} · {Math.max(1, Math.round(step.duration / 60))} min</small></div></li>)}</ol></div>
          </>}
        </aside>}
      </div>
    </>;
  }

  return (
    <div className="app-shell">
      {notice && <div className="toast" role="status">✓ {notice}</div>}
      <header className="topbar">
        <a className="brand" href="#top" onClick={() => setActive("Home")}>
          <span className="brand-mark">UCC</span>
          <span>UCC Campus<small>CONNECT</small></span>
        </a>
        <nav aria-label="Main navigation">
          {["Home", "Map", "Directory", "Updates"].map((item) => (
            <button className={active === item ? "active" : ""} key={item} onClick={() => {
              setActive(item);
              document.getElementById(item === "Updates" ? "updates" : item === "Home" ? "top" : "explore")?.scrollIntoView({ behavior: "smooth" });
            }}>{item}</button>
          ))}
        </nav>
        <div className="header-actions">
          <label className="header-language"><span>Language</span><select value={language} onChange={(event) => setLanguage(event.target.value as Language)} aria-label="Choose language">{languageOptions.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label>
          <button className="icon-button" aria-label="Notifications" onClick={() => toast("You’re all caught up")}>♢<b>3</b></button>
          <button className="profile" onClick={() => setPanel("profile")} disabled={accountLoading}><span>{accountInitials}</span><em>{accountLoading ? "Loading…" : accountName}<small>{account.profile ? `${account.profile.level} · ${account.profile.studentId}` : account.identity ? "Complete your UCC profile" : "Sign in to continue"}</small></em><i>⌄</i></button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><i /> {welcomeDate}</span>
            <h1>{account.identity ? `${lc.welcome} ${firstName}.` : lc.welcome}</h1>
            <p>{account.profile ? `${lc.help} ${firstName}?` : lc.help}</p>
            <div className="global-search">
              <span>⌕</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search UCC halls, faculties, services…" aria-label="Search UCC campus" />
              <kbd>⌘ K</kbd>
              <button onClick={() => {
                if (filtered[0]) setSelected(filtered[0]);
                document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
                if (!filtered.length) toast("No UCC places match that search");
              }}>Search</button>
            </div>
            <div className="popular"><span>Popular:</span> <button onClick={() => setQuery("Sam Jonah")}>Sam Jonah Library</button><button onClick={() => setQuery("Hall")}>Halls</button><button onClick={() => setQuery("Hospital")}>UCC Hospital</button></div>
          </div>
          <div className="today-card">
            <div className="today-head"><span>Today on campus</span><button onClick={() => document.getElementById("updates")?.scrollIntoView({ behavior: "smooth" })}>View calendar →</button></div>
            {updatesLoading && <div className="campus-status">Checking the official UCC calendar…</div>}
            {!updatesLoading && todayUpdates.map((update, index) => <a className="event-row" href={update.url} target="_blank" rel="noreferrer" key={update.id}>
              <time><b>NOW</b><small>ACTIVE</small></time><i className={index % 2 ? "gold" : "blue"} /><div><strong>{update.title}</strong><span>Until {campusDate(update.endDate, { day: "numeric", month: "short" })} · Official UCC calendar ↗</span></div>
            </a>)}
            {!updatesLoading && !todayUpdates.length && <div className="campus-status">No verified public campus events are listed for today.</div>}
            <div className="weather" aria-live="polite">
              <span>{weatherCondition?.icon ?? (weatherError ? "◌" : "…" )}</span>
              <div>
                <b>{weather ? `${Math.round(weather.temperature)}°C` : weatherError ? "Unavailable" : "Loading"}</b>
                <small>UCC · Cape Coast</small>
              </div>
              <em>{weather
                ? `${weatherCondition?.label} · Feels ${Math.round(weather.apparentTemperature)}° · Humidity ${weather.humidity}% · Wind ${Math.round(weather.windSpeed)} km/h`
                : weatherError ? "Could not load current conditions" : "Getting current conditions…"}</em>
            </div>
          </div>
        </section>

        <section className="quick-section">
          <div className="section-title"><div><span>GET THINGS DONE</span><h2>Quick actions</h2></div><p>Your most-used campus services, one tap away.</p></div>
          <div className="quick-grid">
            {quickActions.map(([title, icon, desc, key]) => (
              <button className={`quick-card ${key}`} key={key} onClick={() => openAction(key)}>
                <i>{icon}</i><span><b>{title}</b><small>{desc}</small></span><em>→</em>
              </button>
            ))}
          </div>
        </section>

        <section className="explore" id="explore">
          <div className="explore-head">
            <div><span>EXPLORE UCC</span><h2>Find your way around campus</h2></div>
            <button className="location-button" onClick={() => navigator.geolocation ? navigator.geolocation.getCurrentPosition(({ coords }) => { setCurrentLocation({ lat: coords.latitude, lon: coords.longitude }); toast("Location updated"); }, () => toast("Location access was not available")) : toast("Geolocation is not supported")}>◎ Use my location</button>
          </div>
          <div className="category-row">
            {categories.map(([name, icon]) => <button key={name} className={category === name ? "selected" : ""} onClick={() => setCategory(name)}>{icon && <i>{icon}</i>}{name}</button>)}
          </div>
          <div className="map-directory">
            <div className="map osm-map">
              <iframe
                key={selected?.id ?? "ucc"}
                title="OpenStreetMap of the University of Cape Coast"
                src={mapEmbedUrl}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
              <span className="osm-marker" aria-hidden="true" />
              <div className="osm-topbar">
                <span><i /> University of Cape Coast</span>
                <a href={fullMapUrl} target="_blank" rel="noreferrer">Open full map ↗</a>
              </div>
              {selected && <div className="osm-detail">
                <span style={{ background: selected.color }}>{selected.icon}</span>
                <div><small>SELECTED PLACE</small><b>{selected.name}</b><em>{selected.distance} · {selected.hours}</em></div>
                <a href={fullMapUrl} target="_blank" rel="noreferrer">Open exact location →</a>
              </div>}
              <div className="osm-credit">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a></div>
            </div>
            <aside className="place-list">
              <div className="list-head"><b>Nearby places</b><span>{filtered.length} results</span></div>
              <div className="places-scroll" tabIndex={0} aria-label="Scrollable list of nearby places">
                {filtered.map((place) => <article key={place.id} className={selected?.id === place.id ? "chosen" : ""} onClick={() => { setSelected(place); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
                  <i style={{ background: `${place.color}18`, color: place.color }}>{place.icon}</i>
                  <div><b>{place.name}</b><span>{place.category} · {place.distance}</span><small><em /> {place.hours}{place.accessible && " · ♿ Accessible"}</small></div>
                  <button aria-label={`Save ${place.name}`} onClick={(e) => { e.stopPropagation(); toggleSavedPlace(place.id); }}>{saved.includes(place.id) ? "♥" : "♡"}</button>
                </article>)}
                {!filtered.length && <div className="empty">No campus places match your search.</div>}
              </div>
              <button className="directory-link" onClick={() => { setCategory("All places"); setQuery(""); }}>View full directory <span>→</span></button>
            </aside>
          </div>
        </section>

        <section className="updates-section" id="updates">
          <div className="updates-main">
            <div className="section-title compact"><div><span>STAY INFORMED</span><h2>Latest updates</h2></div><a href="https://news.ucc.edu.gh/ucc-news" target="_blank" rel="noreferrer">View all →</a></div>
            {updatesLoading && <div className="campus-status">Loading the latest official UCC updates…</div>}
            {!updatesLoading && featuredUpdate && <a className="featured-update" href={featuredUpdate.url} target="_blank" rel="noreferrer"><div className="date-tile"><b>{campusDate(featuredUpdate.startDate, { day: "2-digit" })}</b><span>{campusDate(featuredUpdate.startDate, { month: "short" }).toUpperCase()}</span></div><div><span className="tag red">UCC NEWS</span><h3>{featuredUpdate.title}</h3><p>{featuredUpdate.summary}</p><small>{featuredUpdate.source} · {campusDate(featuredUpdate.startDate, { day: "numeric", month: "long", year: "numeric" })} ↗</small></div></a>}
            <div className="mini-updates">
              {latestUpdates.slice(1).map((update, index) => <a href={update.url} target="_blank" rel="noreferrer" key={update.id}><span className={`tag ${index ? "orange" : "purple"}`}>{update.category.toUpperCase()}</span><b>{update.title}</b><small>{campusDate(update.startDate, { day: "numeric", month: "long", year: "numeric" })} · {update.source} ↗</small></a>)}
            </div>
            {!updatesLoading && !featuredUpdate && <div className="campus-status">Official UCC updates are temporarily unavailable. Use “View all” to check the university news page.</div>}
          </div>
          <aside className="safety-card">
            <i>◇</i><div><span>AVAILABLE 24/7</span><h3>Campus safety</h3><p>Security support is always a tap away.</p></div>
            <a href="tel:0203005175">☎ Call UCC emergency</a>
            <button onClick={() => setPanel("emergency")}>More emergency contacts →</button>
          </aside>
        </section>
      </main>

      <footer><div className="brand light"><span className="brand-mark">UCC</span><span>UCC Campus<small>CONNECT</small></span></div><p>For the University of Cape Coast community, Ghana.</p><span>© 2026 University of Cape Coast</span></footer>

      <button className="floating-ai" onClick={() => setPanel("assistant")} aria-label="Open campus assistant"><span>✦</span><b>Ask Campus AI</b></button>

      {panel === "assistant-page" && <section className="ai-page" role="dialog" aria-modal="true">
        <header><a className="brand" href="#top"><span className="brand-mark">UCC</span><span>UCC Campus<small>CONNECT</small></span></a><button onClick={() => setPanel(null)}>← Back to Campus Connect</button></header>
        <main>{renderAssistant(true)}</main>
      </section>}

      {panel && panel !== "assistant-page" && <div className="modal-backdrop" onMouseDown={() => setPanel(null)}>
        <section className={`modal ${panel === "assistant" ? "chat-modal" : ""}`} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
          <button className="modal-close" onClick={() => setPanel(null)}>×</button>
          {panel === "assistant" && renderAssistant(false)}
          {panel === "timetable" && !signedIn && <>
            <div className="modal-icon ai">▦</div><h2>My timetable</h2><p className="modal-subtitle">Sign in to save classes, import your schedule, and receive personalized reminders.</p>
            <a className="primary-action action-link" href="/login">Sign in or create an account</a>
          </>}
          {panel === "timetable" && signedIn && <>
            <div className="modal-icon ai">▦</div><h2>My timetable</h2><p className="modal-subtitle">Campus AI uses your schedule for class reminders, departure times, and directions.</p>
            <form className="timetable-form" onSubmit={addTimetableEntry}>
              <div className="form-row"><label>Course code<input name="courseCode" required placeholder="CSC 201" /></label><label>Class title<input name="title" required placeholder="Data Structures" /></label></div>
              <label>Mapped venue<select name="venue" required defaultValue=""><option value="" disabled>Select a UCC facility</option>{places.filter((place) => place.category === "Academic").map((place) => <option key={place.id}>{place.name}</option>)}</select></label>
              <div className="form-row"><label>Day<select name="dayOfWeek" defaultValue="1">{dayNames.map((day, index) => <option value={index} key={day}>{day}</option>)}</select></label><label>Reminder<select name="reminderMinutes" defaultValue="20"><option value="10">10 minutes</option><option value="20">20 minutes</option><option value="30">30 minutes</option><option value="60">1 hour</option></select></label></div>
              <div className="form-row"><label>Starts<input type="time" name="startTime" required /></label><label>Ends<input type="time" name="endTime" required /></label></div>
              <button className="primary-action" type="submit">Add class</button>
            </form>
            <label className="csv-import">Import CSV timetable<input type="file" accept=".csv,text/csv" onChange={(event) => event.target.files?.[0] && importTimetable(event.target.files[0])} /><small>Columns: course, title, day, start, end, venue, reminder</small></label>
            {timetableError && <p className="form-error">{timetableError}</p>}
            <div className="timetable-list">{timetable.map((entry) => <article key={entry.id}><time><b>{entry.startTime}</b><small>{dayNames[entry.dayOfWeek].slice(0, 3)}</small></time><div><b>{entry.courseCode} · {entry.title}</b><span>{entry.venue} · until {entry.endTime}</span></div><button onClick={() => deleteTimetableEntry(entry.id)} aria-label={`Remove ${entry.courseCode}`}>×</button></article>)}{!timetable.length && <div className="empty">No classes yet. Add one above or import a CSV timetable.</div>}</div>
          </>}
          {panel === "shuttle" && <>
            <div className="modal-icon ai">↔</div><h2>Campus shuttle assistant</h2><p className="modal-subtitle">Mapped UCC stops, route guidance, and frequency-based arrival estimates.</p>
            <label>Where are you going?<select value={shuttleDestinationId} onChange={(event) => setShuttleDestinationId(Number(event.target.value))}>{places.filter((place) => place.category !== "Transport" && place.category !== "Landmark").map((place) => <option value={place.id} key={place.id}>{place.name}</option>)}</select></label>
            <div className="best-stop"><span>BEST STOP</span><b>{recommendedShuttleStop.stop.name}</b><small>About {Math.round(recommendedShuttleStop.distance)} m from {shuttleDestination.name}</small><button onClick={() => { setSelected(recommendedShuttleStop.stop); setPanel(null); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}>Show stop on map →</button></div>
            <div className="shuttle-routes">{shuttleRoutes.map((item) => {
              const stopNames = item.stops.map((id) => places.find((place) => place.id === id)?.name.replace(" Shuttle Station", "")).join(" → ");
              const estimate = Math.max(2, item.interval - (new Date().getMinutes() % item.interval));
              return <article key={item.name}><div><b>{item.name}</b><span>{stopNames}</span><small>{item.period}</small></div><em><b>~{estimate} min</b><span>estimated</span></em></article>;
            })}</div>
            <p className="shuttle-disclaimer">Arrival times are planning estimates based on route frequency, not live vehicle tracking. Confirm current operations at posted station notices.</p>
          </>}
          {panel === "emergency" && <>
            <div className="modal-icon emergency">+</div><h2>Emergency help</h2><p className="modal-subtitle">If anyone is in immediate danger, call 112 or the appropriate dedicated service now.</p>
            <div className="emergency-instructions"><article><b>Security threat</b><span>Get to a safe, populated place if you can, avoid confrontation, and call campus security or Police on 191.</span></article><article><b>Medical emergency</b><span>Call emergency services. Do not move an injured person unless there is immediate danger or movement is required for lifesaving care. Follow the dispatcher’s instructions.</span></article><article><b>Fire</b><span>Leave the building using the stairs, do not use lifts, move to an assembly area, and call Fire Service on 192.</span></article></div>
            <div className="contact-list"><a href="tel:0203005175"><span>◇</span><b>UCC emergency line<small>020 300 5175 · Campus response</small></b><em>Call</em></a><a href="tel:+233312292614"><span>+</span><b>UCC Accident &amp; Emergency<small>+233 31 229 2614 · University Hospital</small></b><em>Call</em></a><a href="tel:0205269824"><span>+</span><b>UCC Ambulance<small>020 526 9824 · Alternatives: 054 991 0148 / 027 001 3890</small></b><em>Call</em></a><a href="tel:0205388648"><span>☎</span><b>UCC Fire Service Unit<small>020 538 8648</small></b><em>Call</em></a><a href="tel:112"><span>☎</span><b>National Emergency Response Centre<small>General national emergency coordination</small></b><em>112</em></a><a href="tel:191"><span>◇</span><b>Ghana Police Service<small>Dedicated national police emergency line</small></b><em>191</em></a><a href="tel:192"><span>☎</span><b>Ghana National Fire Service<small>Dedicated national fire emergency line</small></b><em>192</em></a><a href="tel:193"><span>+</span><b>National Ambulance Service<small>Dedicated national ambulance emergency line</small></b><em>193</em></a></div>
            <button className="primary-action emergency-share" onClick={shareEmergencyLocation}>◎ Share my current location</button>
            <div className="safe-locations"><b>{currentLocation ? "Nearby safe locations" : "Safe locations near central campus"}</b>{places.filter((place) => place.category === "Safety" || place.id === 2).map((place) => ({ place, distance: distanceMeters(currentLocation ?? { lat: 5.1054, lon: -1.283 }, place) })).sort((a, b) => a.distance - b.distance).map(({ place, distance }) => <button key={place.id} onClick={() => { setSelected(place); setPanel(null); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}><span>{place.icon}</span><div><b>{place.name}</b><small>{currentLocation ? (distance < 1000 ? `${Math.round(distance)} m away` : `${(distance / 1000).toFixed(1)} km away`) : (distance < 1000 ? `${Math.round(distance)} m from central campus` : `${(distance / 1000).toFixed(1)} km from central campus`)} · Show on map</small></div><em>→</em></button>)}</div>
          </>}
          {panel === "report" && <>
            <div className="modal-icon report">!</div><h2>Report an issue</h2><p className="modal-subtitle">Help us keep the campus working well.</p>
            <form onSubmit={(e) => { e.preventDefault(); setPanel(null); toast("Issue submitted successfully"); }}>
              <label>Issue title<input required placeholder="What needs attention?" /></label>
              <div className="form-row"><label>Category<select><option>Maintenance</option><option>Electricity</option><option>Water</option><option>Security</option><option>Internet</option></select></label><label>Priority<select><option>Normal</option><option>High</option><option>Urgent</option></select></label></div>
              <label>Description<textarea required placeholder="Tell us what happened and where…" /></label>
              <button className="primary-action" type="submit">Submit report</button>
            </form>
          </>}
          {panel === "profile" && !account.identity && <>
            <div className="modal-icon account-icon">◎</div><h2>Create your account</h2>
            <p className="modal-subtitle">Sign in securely to create your UCC Campus Connect profile. Your password is never shared with this app.</p>
            <div className="account-benefits"><span>✓ Save your profile across devices</span><span>✓ Keep your campus activity private</span><span>✓ Sign out at any time</span></div>
            <a className="primary-action action-link" href="/login">Sign in or create an account</a>
          </>}
          {panel === "profile" && account.identity && !account.profile && <>
            <div className="profile-large">{accountInitials}</div><h2>Complete your UCC profile</h2>
            <p className="modal-subtitle">Signed in as {account.identity.email}</p>
            <form onSubmit={saveAccount}>
              <label>Full name<input name="fullName" required minLength={2} defaultValue={account.identity.fullName ?? ""} placeholder="Your full name" /></label>
              <label>UCC student or staff ID<input name="studentId" required minLength={4} placeholder="e.g. PS/CSC/24/0001" /></label>
              <label>Programme or department<input name="programme" required minLength={2} placeholder="e.g. BSc Computer Science" /></label>
              <label>Level<select name="level" defaultValue="100"><option>100</option><option>200</option><option>300</option><option>400</option><option>500</option><option>Graduate</option><option>Staff</option></select></label>
              {accountError && <p className="form-error">{accountError}</p>}
              <button className="primary-action" type="submit">Create my account</button>
            </form>
            <form className="signout-form" method="post" action="/logout">
              <input type="hidden" name="_token" value={csrfToken} />
              <button className="signout-link" type="submit">Sign out</button>
            </form>
          </>}
          {panel === "profile" && account.profile && <>
            <div className="profile-large">{accountInitials}</div><h2>{account.profile.fullName}</h2>
            <p className="modal-subtitle">{account.profile.programme} · Level {account.profile.level}<br />{account.profile.studentId}</p>
            <div className="stats"><div><b>{saved.length}</b><span>Saved places</span></div><div><b>2</b><span>Open reports</span></div><div><b>{Object.values(preferences.visitCounts).reduce((total, count) => total + count, 0)}</b><span>Place views</span></div></div>
            <div className="preference-panel"><h3>Campus AI preferences</h3><label className="preference-toggle"><input type="checkbox" checked={preferences.accessibilityRequired} onChange={(event) => updatePreferences({ accessibilityRequired: event.target.checked })} /><span><b>Prioritize accessible places</b><small>Highlight confirmed accessible facilities and routes</small></span></label><label>Preferred travel mode<select value={preferences.travelMode} onChange={(event) => updatePreferences({ travelMode: event.target.value })}><option value="walking">Walking</option><option value="shuttle">Campus shuttle</option></select></label>
              {Object.keys(preferences.visitCounts).length > 0 && <div className="memory-list"><b>Frequently visited</b><span>{Object.entries(preferences.visitCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id]) => places.find((place) => place.id === Number(id))?.name).filter(Boolean).join(" · ")}</span></div>}
              {preferences.recentQuestions.length > 0 && <div className="memory-list"><b>Recent questions</b><div>{preferences.recentQuestions.slice(0, 4).map((question) => <button key={question} onClick={() => { setPanel("assistant"); sendMessage(question); }}>{question}</button>)}</div></div>}
            </div>
            <details className="edit-profile"><summary>Edit profile</summary><form onSubmit={saveAccount}>
              <label>Full name<input name="fullName" required defaultValue={account.profile.fullName} /></label>
              <label>UCC student or staff ID<input name="studentId" required defaultValue={account.profile.studentId} /></label>
              <label>Programme or department<input name="programme" required defaultValue={account.profile.programme} /></label>
              <label>Level<select name="level" defaultValue={account.profile.level}><option>100</option><option>200</option><option>300</option><option>400</option><option>500</option><option>Graduate</option><option>Staff</option></select></label>
              {accountError && <p className="form-error">{accountError}</p>}
              <button className="primary-action" type="submit">Save changes</button>
            </form></details>
            <form className="signout-form" method="post" action="/logout">
              <input type="hidden" name="_token" value={csrfToken} />
              <button className="signout-link" type="submit">Sign out of UCC Connect</button>
            </form>
          </>}
        </section>
      </div>}
    </div>
  );
}
