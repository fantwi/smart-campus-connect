export const dynamic = "force-dynamic";

type JsonLdEvent = {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  url?: string;
  category?: string;
};

type ListItem = { item?: JsonLdEvent };

function clean(value: string | undefined) {
  return (value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function fallbackUpdates() {
  return [
    {
      id: "academic-marking-2026",
      title: "Marking and grading of examination scripts",
      summary: "The official 2025/2026 UCC academic calendar schedules marking and grading through 28 August 2026.",
      startDate: "2026-07-25",
      endDate: "2026-08-28",
      category: "Academic deadline",
      source: "UCC Academic Calendar",
      url: "https://academics.ucc.edu.gh/academic-calendar",
    },
    {
      id: "academic-results-2026",
      title: "Release of examination results",
      summary: "The official academic calendar schedules the release of examination results from 29 August to 4 September 2026.",
      startDate: "2026-08-29",
      endDate: "2026-09-04",
      category: "Examinations",
      source: "UCC Academic Calendar",
      url: "https://academics.ucc.edu.gh/academic-calendar",
    },
  ];
}

export async function GET() {
  let updates = fallbackUpdates();
  try {
    const response = await fetch("https://events.ucc.edu.gh/all", {
      headers: { accept: "text/html", "user-agent": "UCC Campus Connect/1.0" },
      cf: { cacheTtl: 900, cacheEverything: true },
    });
    if (!response.ok) throw new Error("UCC event feed unavailable");
    const html = await response.text();
    const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const listScript = scripts.map((match) => match[1]).find((value) => value.includes('"@type":"ItemList"'));
    if (listScript) {
      const parsed = JSON.parse(listScript) as { itemListElement?: ListItem[] };
      const events = (parsed.itemListElement ?? []).flatMap(({ item }, index) => {
        if (!item?.name || !item.url || !item.startDate) return [];
        return [{
          id: `ucc-event-${index}-${item.startDate.slice(0, 10)}`,
          title: clean(item.name),
          summary: clean(item.description).slice(0, 320),
          startDate: item.startDate,
          endDate: item.endDate ?? item.startDate,
          category: clean(item.category) || "Campus event",
          source: "UCC Events",
          url: item.url,
        }];
      });
      const today = new Date();
      const recentCutoff = new Date(today);
      recentCutoff.setDate(recentCutoff.getDate() - 14);
      const relevant = events
        .filter((event) => new Date(event.endDate).getTime() >= recentCutoff.getTime())
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 30);
      updates = [...relevant, ...updates];
    }
  } catch {
    // The official academic-calendar fallback remains available.
  }
  return Response.json(
    { updates, refreshedAt: new Date().toISOString(), sources: ["https://events.ucc.edu.gh/", "https://academics.ucc.edu.gh/academic-calendar"] },
    { headers: { "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=3600" } },
  );
}
