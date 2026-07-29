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
  { id: 1, name: "J. B. Danquah Library", category: "Academic", distance: "4 min", hours: "Open until 10 PM", icon: "▤", color: "#175c45", x: 45, y: 35, accessible: true },
  { id: 2, name: "University Health Centre", category: "Health", distance: "7 min", hours: "Open 24 hours", icon: "+", color: "#d7533f", x: 71, y: 55, accessible: true },
  { id: 3, name: "Science Faculty Café", category: "Food & dining", distance: "5 min", hours: "Open until 8 PM", icon: "◒", color: "#e8993a", x: 57, y: 74 },
  { id: 4, name: "Administration Block", category: "Administration", distance: "9 min", hours: "Open until 5 PM", icon: "▥", color: "#315fa8", x: 29, y: 62, accessible: true },
  { id: 5, name: "Campus Security Post", category: "Security", distance: "3 min", hours: "Open 24 hours", icon: "◇", color: "#7556a5", x: 76, y: 27 },
  { id: 6, name: "Central ATM Hub", category: "Banking", distance: "6 min", hours: "Open 24 hours", icon: "$", color: "#15958a", x: 34, y: 78 },
];

const categories = [
  ["All places", "⌘"], ["Academic", "▤"], ["Food & dining", "◒"], ["Health", "+"],
  ["Banking", "$"], ["Security", "◇"],
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
    { from: "ai", text: "Hi Ama! I answer using verified campus information. Where would you like to go?" },
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
      if (lower.includes("library")) answer = "J. B. Danquah Library is a 4-minute walk away and is open until 10 PM today.";
      if (lower.includes("clinic") || lower.includes("health")) answer = "The University Health Centre is open 24 hours. Campus emergency line: 0302 555 011.";
      if (lower.includes("atm")) answer = "The closest is Central ATM Hub, about a 6-minute walk from your location.";
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
          <span className="brand-mark"><i /><i /><i /></span>
          <span>Smart Campus<small>CONNECT</small></span>
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
          <button className="profile" onClick={() => setPanel("profile")}><span>AO</span><em>Ama Osei<small>Student</small></em><i>⌄</i></button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><i /> WEDNESDAY, JULY 29</span>
            <h1>Good morning, Ama.</h1>
            <p>Where do you need to be today?</p>
            <div className="global-search">
              <span>⌕</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })} placeholder="Search buildings, services, or departments…" aria-label="Search campus" />
              <kbd>⌘ K</kbd>
              <button onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })}>Search</button>
            </div>
            <div className="popular"><span>Popular:</span> <button onClick={() => setQuery("Library")}>Library</button><button onClick={() => setQuery("ATM")}>ATM</button><button onClick={() => setQuery("Health")}>Health Centre</button></div>
          </div>
          <div className="today-card">
            <div className="today-head"><span>Today on campus</span><button onClick={() => document.getElementById("updates")?.scrollIntoView({ behavior: "smooth" })}>View calendar →</button></div>
            <div className="event-row"><time><b>10:00</b><small>AM</small></time><i className="blue" /><div><strong>Orientation: New Students</strong><span>Great Hall · 1 hr</span></div></div>
            <div className="event-row"><time><b>2:30</b><small>PM</small></time><i className="gold" /><div><strong>Entrepreneurship Talk</strong><span>Business School · 90 min</span></div></div>
            <div className="weather"><span>☀</span><div><b>28°</b><small>Mostly sunny</small></div><em>Good day for a walk</em></div>
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
            <div><span>EXPLORE CAMPUS</span><h2>Find your way around</h2></div>
            <button className="location-button" onClick={() => navigator.geolocation ? navigator.geolocation.getCurrentPosition(() => toast("Location updated"), () => toast("Location access was not available")) : toast("Geolocation is not supported")}>◎ Use my location</button>
          </div>
          <div className="category-row">
            {categories.map(([name, icon]) => <button key={name} className={category === name ? "selected" : ""} onClick={() => setCategory(name)}><i>{icon}</i>{name}</button>)}
          </div>
          <div className="map-directory">
            <div className="map">
              <div className="road r1" /><div className="road r2" /><div className="road r3" />
              <span className="map-label l1">NORTH ROAD</span><span className="map-label l2">UNIVERSITY AVE</span><span className="map-label l3">SCIENCE WALK</span>
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
            <article className="featured-update"><div className="date-tile"><b>31</b><span>JUL</span></div><div><span className="tag red">IMPORTANT</span><h3>Course registration closes Friday</h3><p>Complete your semester registration and confirm all selected courses before the portal closes.</p><small>Academic Affairs · 2 hours ago</small></div></article>
            <div className="mini-updates">
              <article><span className="tag purple">EVENT</span><b>Campus Career Fair 2026</b><small>August 4 · Great Hall</small></article>
              <article><span className="tag orange">MAINTENANCE</span><b>Library Wi-Fi upgrade</b><small>Tonight · 11 PM–2 AM</small></article>
            </div>
          </div>
          <aside className="safety-card">
            <i>◇</i><div><span>AVAILABLE 24/7</span><h3>Campus safety</h3><p>Security support is always a tap away.</p></div>
            <a href="tel:0302555011">☎ Call security</a>
            <button onClick={() => setPanel("emergency")}>More emergency contacts →</button>
          </aside>
        </section>
      </main>

      <footer><div className="brand light"><span className="brand-mark"><i /><i /><i /></span><span>Smart Campus<small>CONNECT</small></span></div><p>Making campus life simpler, safer, and more connected.</p><span>© 2026 Smart Campus Connect</span></footer>

      <button className="floating-ai" onClick={() => setPanel("assistant")} aria-label="Open campus assistant"><span>✦</span><b>Ask Campus AI</b></button>

      {panel && <div className="modal-backdrop" onMouseDown={() => setPanel(null)}>
        <section className={`modal ${panel === "assistant" ? "chat-modal" : ""}`} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
          <button className="modal-close" onClick={() => setPanel(null)}>×</button>
          {panel === "assistant" && <>
            <div className="modal-icon ai">✦</div><h2>Campus AI</h2><p className="modal-subtitle">Answers grounded in verified campus information</p>
            <div className="chat-log">{chat.map((item, index) => <div key={index} className={`bubble ${item.from}`}>{item.text}</div>)}</div>
            <div className="chat-input"><input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Ask about places, hours, or services…" autoFocus /><button onClick={sendMessage}>↑</button></div>
          </>}
          {panel === "emergency" && <>
            <div className="modal-icon emergency">+</div><h2>Emergency help</h2><p className="modal-subtitle">If there is immediate danger, call the appropriate service.</p>
            <div className="contact-list"><a href="tel:0302555011"><span>◇</span><b>Campus security<small>0302 555 011 · 24 hours</small></b><em>Call</em></a><a href="tel:0302555012"><span>+</span><b>University Health Centre<small>0302 555 012 · 24 hours</small></b><em>Call</em></a><a href="tel:112"><span>☎</span><b>National emergency<small>Police, fire and ambulance</small></b><em>112</em></a></div>
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
            <div className="profile-large">AO</div><h2>Ama Osei</h2><p className="modal-subtitle">Student · Computer Science</p>
            <div className="stats"><div><b>{saved.length}</b><span>Saved places</span></div><div><b>2</b><span>Open reports</span></div><div><b>8</b><span>Places visited</span></div></div>
            <button className="primary-action" onClick={() => { setPanel(null); toast("Profile settings opened"); }}>Manage my profile</button>
          </>}
        </section>
      </div>}
    </div>
  );
}
