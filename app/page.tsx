"use client";

import { useEffect, useMemo, useState } from "react";

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
  identity: { displayName: string; email: string; fullName: string | null } | null;
  profile: { id: string; email: string; fullName: string; studentId: string; programme: string; level: string; createdAt: string } | null;
};

const places: Place[] = [
  { id: 1, name: "Sam Jonah Library", category: "Academic", distance: "4 min walk", hours: "Open until 10 PM", icon: "▤", color: "#003b73", lat: 5.1164881, lon: -1.2909118, accessible: true },
  { id: 2, name: "University Hospital", category: "Health", distance: "On campus", hours: "Emergency care available", icon: "+", color: "#c43d38", lat: 5.1051584, lon: -1.2828135, accessible: true },
  { id: 3, name: "Casely Hayford Hall", category: "Accommodation", distance: "Northern Campus", hours: "Casford Road", icon: "▦", color: "#d79b13", lat: 5.1167009, lon: -1.2842355 },
  { id: 4, name: "Atlantic Hall", category: "Accommodation", distance: "South Campus", hours: "School Bus Road", icon: "▦", color: "#315fa8", lat: 5.105658, lon: -1.2868962, accessible: true },
  { id: 5, name: "Valco Hall", category: "Accommodation", distance: "Northern Campus", hours: "University Avenue", icon: "▦", color: "#62499a", lat: 5.1158808, lon: -1.2824973 },
  { id: 6, name: "ADB Bank", category: "Banking", distance: "Northern Campus", hours: "Casford Road", icon: "₵", color: "#158b83", lat: 5.1176325, lon: -1.2856637 },
  { id: 7, name: "Kwame Nkrumah Hall", category: "Accommodation", distance: "Northern Campus", hours: "University Avenue", icon: "▦", color: "#8b6237", lat: 5.1162601, lon: -1.2805715 },
  { id: 8, name: "Science Annex Building", category: "Academic", distance: "Northern Campus", hours: "Ayensu Road", icon: "⌬", color: "#2f6ca5", lat: 5.1150602, lon: -1.2941921, accessible: true },
  { id: 9, name: "Oguaa Hall", category: "Accommodation", distance: "South Campus", hours: "School Bus Road", icon: "▦", color: "#99623a", lat: 5.1041491, lon: -1.2863727 },
  { id: 10, name: "Adehye Hall", category: "Accommodation", distance: "South Campus", hours: "School Bus Road", icon: "▦", color: "#a84f7a", lat: 5.1053955, lon: -1.2862198 },
  { id: 11, name: "Superannuation Hall", category: "Accommodation", distance: "2.5 km from UCC", hours: "Arku Korsah Road", icon: "▦", color: "#49729b", lat: 5.1335456, lon: -1.2892089 },
  { id: 12, name: "UCC Sports Complex", category: "Recreation", distance: "On campus", hours: "Near the N1", icon: "◉", color: "#2d8a65", lat: 5.1038328, lon: -1.2811756 },
  { id: 13, name: "Cape Coast Teaching Hospital", category: "Health", distance: "4 km from UCC", hours: "Estate Road, Pedu", icon: "+", color: "#bd443c", lat: 5.1344245, lon: -1.2663799, accessible: true },
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
  { id: 56, name: "Large Lecture Theatre (LLT)", category: "Academic", distance: "Northern Campus", hours: "University Avenue", icon: "▤", color: "#0c5f91", lat: 5.1170421, lon: -1.2914191, accessible: true },
  { id: 57, name: "C. A. Ackah Lecture Theatre (CALC)", category: "Academic", distance: "Northern Campus", hours: "Near Auditorium 900", icon: "▤", color: "#315fa8", lat: 5.1195187, lon: -1.2923444 },
  { id: 58, name: "New Lecture Theatre (NLT)", category: "Academic", distance: "Northern Campus", hours: "Near College of Distance Education", icon: "▤", color: "#3a759b", lat: 5.1220862, lon: -1.2958289 },
  { id: 59, name: "Sandwich Lecture Theatre (SWLT)", category: "Academic", distance: "Northern Campus", hours: "West of Science", icon: "▤", color: "#5767a0", lat: 5.1178214, lon: -1.2983329 },
  { id: 60, name: "Auditorium 900", category: "Academic", distance: "Northern Campus", hours: "Near CALC", icon: "▤", color: "#73569a", lat: 5.1194249, lon: -1.2920655 },
  { id: 61, name: "UCC Main Auditorium", category: "Academic", distance: "Northern Campus", hours: "Science area", icon: "▤", color: "#8b6145", lat: 5.1166907, lon: -1.2939274 },
  { id: 62, name: "Faculty of Science", category: "Academic", distance: "Northern Campus", hours: "Science area", icon: "⌬", color: "#247c83", lat: 5.1164652, lon: -1.2937136 },
  { id: 63, name: "Faculty of Arts", category: "Academic", distance: "Northern Campus", hours: "Near LLT", icon: "⌬", color: "#426f9e", lat: 5.1180834, lon: -1.2926961 },
  { id: 64, name: "Faculty of Social Sciences", category: "Academic", distance: "Northern Campus", hours: "Near LLT", icon: "⌬", color: "#65589a", lat: 5.1174379, lon: -1.2928106 },
  { id: 65, name: "School of Business", category: "Academic", distance: "Northern Campus", hours: "Near College of Distance Education", icon: "⌬", color: "#916149", lat: 5.1208275, lon: -1.2948876 },
  { id: 66, name: "School of Medical Sciences", category: "Academic", distance: "Northern Campus", hours: "Medical School area", icon: "⌬", color: "#287c72", lat: 5.1201942, lon: -1.2938951, accessible: true },
  { id: 67, name: "School of Medical Sciences Auditorium", category: "Academic", distance: "Northern Campus", hours: "Medical School area", icon: "▤", color: "#3b73a0", lat: 5.1199532, lon: -1.2938228 },
  { id: 68, name: "School of Graduate Studies", category: "Academic", distance: "Northern Campus", hours: "West of Medical School", icon: "⌬", color: "#6b5797", lat: 5.1206405, lon: -1.2959177 },
  { id: 69, name: "College of Distance Education", category: "Academic", distance: "Northern Campus", hours: "Near NLT", icon: "⌬", color: "#95584d", lat: 5.122052, lon: -1.2947843 },
  { id: 70, name: "College of Education", category: "Academic", distance: "Northern Campus", hours: "Near CALC", icon: "⌬", color: "#397c82", lat: 5.1194205, lon: -1.2932987 },
  { id: 71, name: "Amissah-Arthur Language Centre", category: "Academic", distance: "Northern Campus", hours: "West of College of Education", icon: "⌬", color: "#4c6fa0", lat: 5.1191598, lon: -1.2947993 },
  { id: 72, name: "Institute for Development Studies (IDS)", category: "Academic", distance: "Northern Campus", hours: "Near Sam Jonah Library", icon: "⌬", color: "#705b91", lat: 5.1179053, lon: -1.291278 },
  { id: 73, name: "IDS Library", category: "Academic", distance: "Northern Campus", hours: "Institute for Development Studies", icon: "▤", color: "#8d6843", lat: 5.117857, lon: -1.2908862 },
  { id: 74, name: "New Central Administration Block", category: "Academic", distance: "Northern Campus", hours: "Near Sam Jonah Library", icon: "⌬", color: "#337b76", lat: 5.1154438, lon: -1.290884 },
  { id: 75, name: "Old Library", category: "Academic", distance: "South Campus", hours: "Near Administration Block", icon: "▤", color: "#4b6e9b", lat: 5.1045856, lon: -1.2846844 },
  { id: 76, name: "Administration Block", category: "Academic", distance: "South Campus", hours: "Old Site", icon: "⌬", color: "#6a5792", lat: 5.105474, lon: -1.2841994 },
  { id: 77, name: "Centre for International Education", category: "Academic", distance: "South Campus", hours: "Near University Hospital", icon: "⌬", color: "#925a4b", lat: 5.1062858, lon: -1.2818572 },
];

const categories = [
  ["All places", "⌘"], ["Academic", "▤"], ["Accommodation", "▦"], ["Health", "+"],
  ["Hostels", "H"], ["Banking", "₵"], ["Recreation", "◉"], ["Landmark", "◆"],
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
  const [chat, setChat] = useState([
    { from: "ai", text: "Hi Adwoa! I answer using verified University of Cape Coast information. Where would you like to go?" },
  ]);
  const [message, setMessage] = useState("");
  const [account, setAccount] = useState<Account>({ identity: null, profile: null });
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState("");
  const [welcomeTime] = useState(() => new Date());

  useEffect(() => {
    fetch("/api/account", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setAccount(data))
      .catch(() => setAccountError("Account details could not be loaded."))
      .finally(() => setAccountLoading(false));
  }, []);

  const accountName = account.profile?.fullName ?? account.identity?.displayName ?? "Create account";
  const accountInitials = accountName === "Create account" ? "+" : accountName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const identityFirstName = accountName.includes("@")
    ? accountName.split("@")[0].split(/[._-]/)[0]
    : accountName.split(/\s+/)[0];
  const firstName = identityFirstName.charAt(0).toUpperCase() + identityFirstName.slice(1);
  const timeGreeting = welcomeTime.getHours() < 12 ? "Good morning" : welcomeTime.getHours() < 18 ? "Good afternoon" : "Good evening";
  const welcomeDate = new Intl.DateTimeFormat("en-GH", { weekday: "long", month: "long", day: "numeric" }).format(welcomeTime).toUpperCase();

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

  const filtered = useMemo(() => places.filter((place) => {
    const matchesCategory = category === "All places" || place.category === category;
    const matchesQuery = `${place.name} ${place.category} ${place.distance} ${place.hours}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, query]);
  const mapLat = selected?.lat ?? 5.104722;
  const mapLon = selected?.lon ?? -1.282847;
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapLon - 0.004}%2C${mapLat - 0.0035}%2C${mapLon + 0.004}%2C${mapLat + 0.0035}&layer=mapnik&marker=${mapLat}%2C${mapLon}`;
  const fullMapUrl = `https://www.openstreetmap.org/?mlat=${mapLat}&mlon=${mapLon}#map=18/${mapLat}/${mapLon}`;

  useEffect(() => {
    if (filtered.length && (query.trim() || category !== "All places")) setSelected(filtered[0]);
  }, [filtered, query, category]);

  function toast(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2600);
  }

  function sendMessage() {
    if (!message.trim()) return;
    const q = message;
    setChat((current) => [...current, { from: "user", text: q }]);
    setMessage("");
    window.setTimeout(() => {
      const lower = q.toLowerCase();
      let answer = "I found a few relevant campus places. Try the directory or tell me the facility name.";
      if (lower.includes("library")) answer = "Sam Jonah Library is on Northern Campus, opposite the shuttle bus station. Semester hours are Monday–Friday, 9 AM–10 PM.";
      if (lower.includes("clinic") || lower.includes("health") || lower.includes("hospital")) answer = "UCC University Hospital serves students, staff and the public. Health Services: 03321 32447.";
      if (lower.includes("atm") || lower.includes("bank")) answer = "ADB Bank & ATM is near the Cafeteria Complex. UCC also has GCB, Prudential and Zenith banking services on campus.";
      if (lower.includes("emergency") || lower.includes("security")) answer = "UCC emergency lines include 020 300 5175 and 020 300 5176. Call Ghana’s national emergency number 112 for immediate danger.";
      setChat((current) => [...current, { from: "ai", text: answer }]);
    }, 450);
  }

  function openAction(key: string) {
    if (key === "map") {
      setActive("Map");
      document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
    } else setPanel(key);
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
          <button className="icon-button" aria-label="Notifications" onClick={() => toast("You’re all caught up")}>♢<b>3</b></button>
          <button className="profile" onClick={() => setPanel("profile")} disabled={accountLoading}><span>{accountInitials}</span><em>{accountLoading ? "Loading…" : accountName}<small>{account.profile ? `${account.profile.level} · ${account.profile.studentId}` : account.identity ? "Complete your UCC profile" : "Sign in to continue"}</small></em><i>⌄</i></button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><i /> {welcomeDate}</span>
            <h1>{accountLoading ? "Welcome to UCC." : account.identity ? `${timeGreeting}, ${firstName}.` : "Welcome to UCC Campus Connect."}</h1>
            <p>{accountLoading ? "Getting your campus ready…" : account.profile ? `What can we help you find today, ${firstName}?` : account.identity ? "Complete your profile to personalize your campus experience." : "Explore the University of Cape Coast or sign in to personalize your experience."}</p>
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
            <div className="event-row"><time><b>10:00</b><small>AM</small></time><i className="blue" /><div><strong>Research Methods Seminar</strong><span>Sam Jonah Library · 1 hr</span></div></div>
            <div className="event-row"><time><b>2:30</b><small>PM</small></time><i className="gold" /><div><strong>SRC Student Forum</strong><span>UCC Auditorium · 90 min</span></div></div>
            <div className="weather"><span>☀</span><div><b>28°</b><small>Cape Coast</small></div><em>Sea breeze this afternoon</em></div>
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
            <button className="location-button" onClick={() => navigator.geolocation ? navigator.geolocation.getCurrentPosition(() => toast("Location updated"), () => toast("Location access was not available")) : toast("Geolocation is not supported")}>◎ Use my location</button>
          </div>
          <div className="category-row">
            {categories.map(([name, icon]) => <button key={name} className={category === name ? "selected" : ""} onClick={() => setCategory(name)}><i>{icon}</i>{name}</button>)}
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
              <div className="places-scroll">
                {filtered.map((place) => <article key={place.id} className={selected?.id === place.id ? "chosen" : ""} onClick={() => { setSelected(place); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
                  <i style={{ background: `${place.color}18`, color: place.color }}>{place.icon}</i>
                  <div><b>{place.name}</b><span>{place.category} · {place.distance}</span><small><em /> {place.hours}{place.accessible && " · ♿ Accessible"}</small></div>
                  <button aria-label={`Save ${place.name}`} onClick={(e) => { e.stopPropagation(); setSaved((s) => s.includes(place.id) ? s.filter((id) => id !== place.id) : [...s, place.id]); }}>{saved.includes(place.id) ? "♥" : "♡"}</button>
                </article>)}
                {!filtered.length && <div className="empty">No campus places match your search.</div>}
              </div>
              <button className="directory-link" onClick={() => { setCategory("All places"); setQuery(""); }}>View full directory <span>→</span></button>
            </aside>
          </div>
        </section>

        <section className="updates-section" id="updates">
          <div className="updates-main">
            <div className="section-title compact"><div><span>STAY INFORMED</span><h2>Latest updates</h2></div><button onClick={() => toast("Showing all announcements")}>View all →</button></div>
            <article className="featured-update"><div className="date-tile"><b>27</b><span>JUL</span></div><div><span className="tag red">UCC NEWS</span><h3>UCC Counselling Centre produces 25 lay counsellors</h3><p>Twenty-five para-counsellors have graduated from the Young and Wise programme organised by the Counselling Centre.</p><small>University News · July 27, 2026</small></div></article>
            <div className="mini-updates">
              <article><span className="tag purple">SRC</span><b>UCC SRC unveils 2026–2031 strategic plan</b><small>July 23 · University News</small></article>
              <article><span className="tag orange">CAMPUS</span><b>New student executives inducted</b><small>2026/2027 academic year</small></article>
            </div>
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

      {panel && <div className="modal-backdrop" onMouseDown={() => setPanel(null)}>
        <section className={`modal ${panel === "assistant" ? "chat-modal" : ""}`} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
          <button className="modal-close" onClick={() => setPanel(null)}>×</button>
          {panel === "assistant" && <>
            <div className="modal-icon ai">✦</div><h2>UCC Campus AI</h2><p className="modal-subtitle">Answers grounded in verified UCC information</p>
            <div className="chat-log">{chat.map((item, index) => <div key={index} className={`bubble ${item.from}`}>{item.text}</div>)}</div>
            <div className="chat-input"><input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Ask about places, hours, or services…" autoFocus /><button onClick={sendMessage}>↑</button></div>
          </>}
          {panel === "emergency" && <>
            <div className="modal-icon emergency">+</div><h2>Emergency help</h2><p className="modal-subtitle">If there is immediate danger, call the appropriate service.</p>
            <div className="contact-list"><a href="tel:0203005175"><span>◇</span><b>UCC emergency line<small>020 300 5175 · Campus response</small></b><em>Call</em></a><a href="tel:0332132447"><span>+</span><b>UCC Health Services<small>03321 32447 · University Hospital</small></b><em>Call</em></a><a href="tel:0205388648"><span>☎</span><b>UCC Fire Service Unit<small>020 538 8648</small></b><em>Call</em></a><a href="tel:112"><span>☎</span><b>National emergency<small>Police, fire and ambulance</small></b><em>112</em></a></div>
            <button className="primary-action" onClick={() => toast("Your location is ready to share")}>◎ Capture my current location</button>
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
            <a className="primary-action action-link" href="/signin-with-chatgpt?return_to=%2F">Sign in with ChatGPT</a>
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
            <a className="signout-link" href="/signout-with-chatgpt?return_to=%2F">Sign out</a>
          </>}
          {panel === "profile" && account.profile && <>
            <div className="profile-large">{accountInitials}</div><h2>{account.profile.fullName}</h2>
            <p className="modal-subtitle">{account.profile.programme} · Level {account.profile.level}<br />{account.profile.studentId}</p>
            <div className="stats"><div><b>{saved.length}</b><span>Saved places</span></div><div><b>2</b><span>Open reports</span></div><div><b>8</b><span>Places visited</span></div></div>
            <details className="edit-profile"><summary>Edit profile</summary><form onSubmit={saveAccount}>
              <label>Full name<input name="fullName" required defaultValue={account.profile.fullName} /></label>
              <label>UCC student or staff ID<input name="studentId" required defaultValue={account.profile.studentId} /></label>
              <label>Programme or department<input name="programme" required defaultValue={account.profile.programme} /></label>
              <label>Level<select name="level" defaultValue={account.profile.level}><option>100</option><option>200</option><option>300</option><option>400</option><option>500</option><option>Graduate</option><option>Staff</option></select></label>
              {accountError && <p className="form-error">{accountError}</p>}
              <button className="primary-action" type="submit">Save changes</button>
            </form></details>
            <a className="signout-link" href="/signout-with-chatgpt?return_to=%2F">Sign out of UCC Connect</a>
          </>}
        </section>
      </div>}
    </div>
  );
}
