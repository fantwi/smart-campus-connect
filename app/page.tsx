"use client";

import { useMemo, useState } from "react";

type Place = {
  id: number;
  name: string;
  category: string;
  distance: string;
  hours: string;
  icon: string;
  color: string;
  x: number;
  y: number;
  accessible?: boolean;
};

const places: Place[] = [
  { id: 1, name: "Sam Jonah Library", category: "Academic", distance: "4 min", hours: "Open until 10 PM", icon: "▤", color: "#003b73", x: 45, y: 35, accessible: true },
  { id: 2, name: "UCC University Hospital", category: "Health", distance: "8 min", hours: "Emergency care available", icon: "+", color: "#c43d38", x: 71, y: 55, accessible: true },
  { id: 3, name: "Casford Cafeteria", category: "Food & dining", distance: "5 min", hours: "Northern Campus", icon: "◒", color: "#d79b13", x: 57, y: 74 },
  { id: 4, name: "Central Administration", category: "Administration", distance: "9 min", hours: "South Campus", icon: "▥", color: "#315fa8", x: 29, y: 62, accessible: true },
  { id: 5, name: "UCC Security Control", category: "Security", distance: "3 min", hours: "Open 24 hours", icon: "◇", color: "#62499a", x: 76, y: 27 },
  { id: 6, name: "ADB Bank & ATM", category: "Banking", distance: "6 min", hours: "Near Cafeteria Complex", icon: "₵", color: "#158b83", x: 34, y: 78 },
  { id: 7, name: "Kwame Nkrumah Hall", category: "Accommodation", distance: "7 min", hours: "Northern Campus", icon: "▦", color: "#8b6237", x: 20, y: 42 },
  { id: 8, name: "Science Building Complex", category: "Academic", distance: "6 min", hours: "Network & Infrastructure", icon: "⌬", color: "#2f6ca5", x: 65, y: 15, accessible: true },
];

const categories = [
  ["All places", "⌘"], ["Academic", "▤"], ["Accommodation", "▦"], ["Food & dining", "◒"],
  ["Health", "+"], ["Banking", "₵"], ["Security", "◇"],
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

  const filtered = useMemo(() => places.filter((place) => {
    const matchesCategory = category === "All places" || place.category === category;
    const matchesQuery = `${place.name} ${place.category}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, query]);

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
          <button className="profile" onClick={() => setPanel("profile")}><span>AM</span><em>Adwoa Mensah<small>UCC Student</small></em><i>⌄</i></button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><i /> WEDNESDAY, JULY 29</span>
            <h1>Good morning, Adwoa.</h1>
            <p>Where on UCC campus do you need to be?</p>
            <div className="global-search">
              <span>⌕</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })} placeholder="Search UCC halls, faculties, services…" aria-label="Search UCC campus" />
              <kbd>⌘ K</kbd>
              <button onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })}>Search</button>
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
            <div className="map">
              <div className="road r1" /><div className="road r2" /><div className="road r3" />
              <span className="map-label l1">NORTHERN CAMPUS</span><span className="map-label l2">SCIENCE ROAD</span><span className="map-label l3">SHUTTLE ROUTE</span>
              <div className="field f1" /><div className="field f2" />
              {filtered.map((place) => <button aria-label={place.name} key={place.id} className={`marker ${selected?.id === place.id ? "current" : ""}`} style={{ left: `${place.x}%`, top: `${place.y}%`, background: place.color }} onClick={() => setSelected(place)}>{place.icon}</button>)}
              <div className="you-are-here"><i /> You are here</div>
              <div className="map-tools"><button onClick={() => toast("Map zoomed in")}>+</button><button onClick={() => toast("Map zoomed out")}>−</button></div>
              {selected && <div className="map-popup"><button aria-label="Close place details" onClick={() => setSelected(null)}>×</button><span style={{ background: selected.color }}>{selected.icon}</span><div><small>{selected.category}</small><b>{selected.name}</b><em>{selected.distance} walk · {selected.hours}</em></div></div>}
            </div>
            <aside className="place-list">
              <div className="list-head"><b>Nearby places</b><span>{filtered.length} results</span></div>
              <div className="places-scroll">
                {filtered.map((place) => <article key={place.id} className={selected?.id === place.id ? "chosen" : ""} onClick={() => setSelected(place)}>
                  <i style={{ background: `${place.color}18`, color: place.color }}>{place.icon}</i>
                  <div><b>{place.name}</b><span>{place.category} · {place.distance} walk</span><small><em /> {place.hours}{place.accessible && " · ♿ Accessible"}</small></div>
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
          {panel === "profile" && <>
            <div className="profile-large">AM</div><h2>Adwoa Mensah</h2><p className="modal-subtitle">UCC Student · Computer Science & IT</p>
            <div className="stats"><div><b>{saved.length}</b><span>Saved places</span></div><div><b>2</b><span>Open reports</span></div><div><b>8</b><span>Places visited</span></div></div>
            <button className="primary-action" onClick={() => { setPanel(null); toast("Profile settings opened"); }}>Manage my profile</button>
          </>}
        </section>
      </div>}
    </div>
  );
}
