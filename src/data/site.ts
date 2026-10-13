/* Desktop site data — lifted verbatim from OmniTrace_Prototype_v1.0.html. */

export type AppId = "slack" | "figma" | "excel" | "notion" | "github" | "framer" | "drive";
export type SourceChip = readonly [AppId, string];

/* ---------- nav + spine ---------- */
export const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#how", label: "How it works" },
  { href: "#privacy", label: "Privacy" },
  { href: "#who", label: "Who it's for" },
] as const;

export const SPINE_SECTIONS = [
  { id: "top", name: "Top" },
  { id: "problem", name: "Problem" },
  { id: "how", name: "How it works" },
  { id: "product", name: "Product" },
  { id: "privacy", name: "Privacy" },
  { id: "who", name: "Who it's for" },
  { id: "faq", name: "FAQ" },
  { id: "cta", name: "Get OmniTrace" },
] as const;

/* ---------- hero ---------- */
export const HERO_QUESTION = "Why did we remove the multi-seat option in checkout last month?";

export interface HeroEvidence { app: AppId; head: string; body: string; foot: string; t: number; lane: string }
export const HERO_EVIDENCE: HeroEvidence[] = [
  { app: "slack", lane: "Slack", head: "Slack · #acme-checkout", body: "“Client call: multi-seat picker confuses SMB buyers. 38% drop-off at the seat step.”", foot: "Priya Nair · 11:42, 11 Mar", t: 0 + 11.7 / 24 },
  { app: "figma", lane: "Figma", head: "Figma · Acme Checkout · Seat picker v3 → v4", body: "Frame “Seat picker v3” deleted. Frame “Single seat default” added.", foot: "Daniel Okafor · 15:10, 12 Mar", t: 1 + 15.17 / 24 },
  { app: "excel", lane: "Excel", head: "Excel · Pricing_model_Q1.xlsx · Plans", body: "Cell B14 · seats: 5 → 1", foot: "Meera Shah · 09:35, 13 Mar", t: 2 + 9.58 / 24 },
  { app: "github", lane: "GitHub", head: "GitHub · PR #412", body: "“Remove seat selector from checkout” · merged", foot: "Arjun Mehta · merged 17:02, 14 Mar", t: 3 + 17.03 / 24 },
];
export const HERO_DAYS = ["11 Mar", "12 Mar", "13 Mar", "14 Mar"];

/** The hero answer: text runs and citation chips (index into HERO_EVIDENCE), with trailing punctuation. */
export type HeroAnswerPart = { text: string } | { cite: number; label: string; punct: string };
export const HERO_ANSWER: HeroAnswerPart[] = [
  { text: "You removed it on 14 Mar after a client call. SMB buyers were dropping off at the seat picker (38%). Priya raised it in Slack " },
  { cite: 0, label: "Slack 11 Mar", punct: "," },
  { text: " Daniel redesigned the frame in Figma " },
  { cite: 1, label: "Figma 12 Mar", punct: "," },
  { text: " Meera set seats to 1 in the pricing model " },
  { cite: 2, label: "Excel 13 Mar", punct: "," },
  { text: " and Arjun merged PR #412 " },
  { cite: 3, label: "GitHub 14 Mar", punct: "." },
];

/* ---------- §2 rooms & hallway ---------- */
/** [app, name, room kind, card title, card sub] */
export const ROOMS: readonly (readonly [AppId, string, string, string, string])[] = [
  ["slack", "Slack", "meeting room", "11:42 client call", "11 Mar · Priya"],
  ["figma", "Figma", "drawing board", "frame v4", "12 Mar · Daniel"],
  ["excel", "Excel", "accounting desk", "B14 = 1", "13 Mar · Meera"],
  ["github", "GitHub", "workshop", "PR #412", "14 Mar · Arjun"],
  ["notion", "Notion", "library", "ADR-031", "14 Mar · OmniTrace"],
];

/** room: x,y,w,h, cardCx,cardCy, stopX,stopY, furnX,furnY,furnScale */
export type RoomRect = readonly [number, number, number, number, number, number, number, number, number, number, number];
export interface RoomLayout {
  w: number; h: number; fs: number;
  hall: readonly [number, number, number, number];
  hp: (x: number, y: number) => [number, number];
  ht: readonly [number, number, number];
  r: readonly RoomRect[];
}
export const ROOM_LAYOUT: { d: RoomLayout; m: RoomLayout } = {
  d: {
    w: 1600, h: 700, fs: 20, hall: [30, 290, 1540, 120], hp: (x) => [x, 350], ht: [48, 396, 0],
    r: [
      [30, 30, 480, 240, 300, 128, 270, 226, 430, 206, 1], [560, 30, 480, 240, 830, 128, 800, 226, 960, 206, 1], [1090, 30, 480, 240, 1360, 128, 1330, 226, 1490, 206, 1],
      [830, 430, 740, 240, 1200, 572, 1200, 474, 1470, 604, 1], [30, 430, 750, 240, 405, 572, 405, 474, 690, 604, 1],
    ],
  },
  m: {
    w: 560, h: 784, fs: 16, hall: [244, 12, 72, 760], hp: (_x, y) => [280, y], ht: [306, 762, -90],
    r: [
      [12, 12, 220, 240, 122, 124, 196, 212, 58, 212, 0.7], [12, 272, 220, 240, 122, 384, 196, 472, 58, 472, 0.7], [12, 532, 220, 240, 122, 644, 196, 732, 58, 732, 0.7],
      [328, 412, 220, 360, 438, 566, 360, 706, 480, 712, 0.7], [328, 12, 220, 380, 438, 166, 360, 300, 480, 330, 0.7],
    ],
  },
};

export const ROOM_FURN: Record<string, string> = {
  slack: '<ellipse cx="0" cy="0" rx="40" ry="14"/><circle cx="-28" cy="-24" r="5"/><circle cx="0" cy="-26" r="5"/><circle cx="28" cy="-24" r="5"/><circle cx="-28" cy="24" r="5"/><circle cx="0" cy="26" r="5"/><circle cx="28" cy="24" r="5"/>',
  figma: '<path d="M-40 16L-30-28H36L28 16Z M-30 16L-36 32 M20 16L26 32 M-18-4Q0-20 16-6"/>',
  excel: '<path d="M-44-6H44V14H-44Z M-36 14V32 M36 14V32 M-14-30H14V-12H-14Z M-14-24H14 M-14-18H14 M-5-30V-12 M5-30V-12"/>',
  github: '<path d="M-44 4H44 M-36 4V30 M36 4V30 M-34-4L-12-26"/><circle cx="20" cy="-14" r="11" stroke-dasharray="5 3"/><circle cx="20" cy="-14" r="4"/>',
  notion: '<path d="M-44-28H44 M-44 0H44 M-44 28H44 M-40-28V-46 M-34-28V-42 M-28-28V-48 M-20-28V-40 M-12-28V-46 M2-28V-44 M8-28V-38 M-40 0V-16 M-32 0V-20 M-24 0V-14 M10 0V-18 M18 0V-20 M26 0V-12 M34 0V-18"/>',
};

export const ROOMS_STATUS = {
  without: { text: "Five rooms visited. ", bold: "Nothing kept." },
  with: { text: "Every step is kept: ", bold: "5 rooms, 5 cards, one trail." },
};

export const ROOMS_PROBLEMS = [
  { h: "Fragmented trails", p: "Feedback in Slack, a fix in Figma, a number in Excel, code in GitHub. Four pieces. No thread." },
  { h: "Lost memory", p: "When someone leaves the team, the reasons leave with them." },
  { h: "Search blind spots", p: "Each search box looks inside one app. None of them look across." },
];

/* ---------- §3 decision graph ---------- */
export const GRAPH_STEPS = [
  { h: "Capture", p: "OmniTrace watches the apps you already use. Every change becomes a small card. Text only. Nothing leaves your laptop." },
  { h: "Link", p: "It joins cards that belong together: same people, same files, same week." },
  { h: "Ask", p: "Ask in plain English. No tags. No manual notes." },
  { h: "Answer", p: "You get the full story, with a link to each source." },
];
export const GRAPH_QUESTION = "Why did we remove the multi-seat option in checkout?";

export type GraphNodeType = "room" | "person" | "card" | "dec" | "rule";
/** [id, type, short label, long label, lane?, date?] */
export type GraphRaw = readonly [string, GraphNodeType, string, string, number?, string?];
export const GRAPH_NODES: readonly GraphRaw[] = [
  ["slack", "room", "Slack", "Slack · meeting room", 0], ["figma", "room", "Figma", "Figma · drawing board", 1], ["excel", "room", "Excel", "Excel · accounting desk", 2], ["github", "room", "GitHub", "GitHub · workshop", 3], ["notion", "room", "Notion", "Notion · library", 4],
  ["priya", "person", "Priya", "Priya Nair"], ["daniel", "person", "Daniel", "Daniel Okafor"], ["meera", "person", "Meera", "Meera Shah"], ["arjun", "person", "Arjun", "Arjun Mehta"],
  ["msg", "card", "11:42 call", "Slack #acme-checkout · client call", 0, "2026-03-11"], ["frame", "card", "frame v4", "Figma · Seat picker v3 → v4", 1, "2026-03-12"], ["cell", "card", "B14 = 1", "Excel · Plans!B14 seats 5 → 1", 2, "2026-03-13"], ["pr", "card", "PR #412", "GitHub · PR #412 merged", 3, "2026-03-14"],
  ["stand", "card", "standup", "Slack · #acme-checkout standup", 0, "2026-02-04"], ["cart", "card", "cart v2", "Figma · Cart v2 frame", 1, "2026-01-20"], ["team", "card", "team picker", "Figma · Team plan picker v1", 1, "2026-09-08"],
  ["adr", "dec", "ADR-031", "Notion · ADR-031 · multi-seat removed", 4, "2026-03-14"], ["rule", "rule", "client rule", "Client rule · no seat selection on first purchase", 4, "2026-03-14"],
];
/** provenance: [source, quote, meta] */
export const GRAPH_PROV: Record<string, readonly [string, string, string]> = {
  msg: ["Slack · #acme-checkout", "“Client call: multi-seat picker confuses SMB buyers. 38% drop-off at the seat step.”", "Priya Nair · 11:42, 11 Mar 2026"],
  frame: ["Figma · Acme Checkout", "Frame “Seat picker v3 → v4”. The old frame was deleted. A “Single seat default” frame was added.", "Daniel Okafor · 15:10, 12 Mar 2026"],
  cell: ["Excel · Pricing_model_Q1.xlsx", "Sheet Plans, cell B14. Seats changed from 5 to 1.", "Meera Shah · 09:35, 13 Mar 2026"],
  pr: ["GitHub · acme/checkout", "PR #412 “Remove seat selector from checkout”. Merged.", "Arjun Mehta · merged 17:02, 14 Mar 2026"],
  stand: ["Slack · #acme-checkout", "Standup: “Checkout v2 is live for all plans.”", "Arjun Mehta · 09:30, 4 Feb 2026"],
  cart: ["Figma · Acme Checkout", "Frame “Cart v2” added.", "Daniel Okafor · 16:20, 20 Jan 2026"],
  team: ["Figma · Acme Checkout", "Frame “Team plan picker v1” added. It brings seat selection back.", "Daniel Okafor · 11:05, 8 Sep 2026"],
  rule: ["Notion · Client rules", "“No seat selection on first purchase.” Approved by the client.", "Priya Nair · 14 Mar 2026"],
};
export const GRAPH_EDGES: readonly (readonly [string, string])[] = [
  ["msg", "slack"], ["stand", "slack"], ["frame", "figma"], ["cart", "figma"], ["team", "figma"], ["cell", "excel"], ["pr", "github"], ["adr", "notion"], ["rule", "notion"],
  ["msg", "priya"], ["frame", "daniel"], ["cell", "meera"], ["pr", "arjun"], ["stand", "arjun"], ["cart", "daniel"], ["team", "daniel"], ["rule", "priya"], ["adr", "priya"],
  ["msg", "frame"], ["frame", "cell"], ["cell", "pr"], ["pr", "adr"], ["adr", "rule"], ["team", "rule"],
];
export const GRAPH_PATH = ["msg", "frame", "cell", "pr", "adr"];
export const GRAPH_PEOPLE = ["priya", "daniel", "meera", "arjun"];
export const GRAPH_ADR_SOURCES: readonly (readonly [string, AppId, string])[] = [
  ["msg", "slack", "Slack · 11 Mar"], ["frame", "figma", "Figma · 12 Mar"], ["cell", "excel", "Excel · 13 Mar"], ["pr", "github", "GitHub · 14 Mar"],
];

/* ---------- §4 features ---------- */
export const ASK_STOP = new Set(["why", "did", "we", "the", "a", "an", "of", "to", "in", "on", "is", "it", "does", "do", "this", "that", "what", "when", "who", "where", "how", "our", "us", "and", "for", "was", "were", "last", "month"]);
export interface AskQuestion { q: string; k: string; t: string; c: SourceChip[] }
export const ASK_QUESTIONS: AskQuestion[] = [
  { q: "Why did we remove the multi-seat option?", k: "remove removed multi seat seats picker option checkout multiseat", t: "You removed it on 14 Mar, after a client call. SMB buyers were dropping off at the seat step (38%). Priya raised it, Daniel redesigned the frame, Meera set seats to 1, and Arjun merged PR #412.", c: [["slack", "Slack 11 Mar"], ["figma", "Figma 12 Mar"], ["excel", "Excel 13 Mar"], ["github", "GitHub 14 Mar"]] },
  { q: "Who approved the revised scope?", k: "approve approved approval scope revised sign signed client", t: "Priya Nair approved it on 6 Feb, in a reply to the client in #acme-checkout. The new scope dropped the gift-card step. The signed PDF is in Drive › Clients › Acme › Scope.", c: [["slack", "Slack 6 Feb"], ["drive", "Drive 6 Feb"], ["notion", "Notion 7 Feb"]] },
  { q: "Why does this function retry 3 times?", k: "retry retries function three 3 times code timeout payment gateway", t: "The payment gateway timed out under load on 21 Feb. Arjun added 3 retries in PR #388. In testing, more than 3 retries caused double charges.", c: [["slack", "Slack 21 Feb"], ["github", "PR #388"], ["notion", "Incident note"]] },
  { q: "When did we move the CTA below the fold?", k: "cta button fold move moved below pay call action", t: "On 3 Mar. Daniel moved the Pay button below the order summary, so buyers see the total first. Completed orders went up 6% in the test.", c: [["figma", "Figma 3 Mar"], ["framer", "Framer 4 Mar"], ["excel", "Excel 9 Mar"]] },
];

export interface AdrFragment { app: AppId; meta: string; text: string }
export interface AdrEntry { id: string; date: string; title: string; context: string; decision: string; consequences: string; sources: SourceChip[]; raw: AdrFragment[] }
export const ADR_ENTRIES: AdrEntry[] = [
  {
    id: "ADR-029", date: "18 Feb 2026", title: "Moved the promo code field below payment",
    context: "Buyers left checkout to hunt for promo codes. 1 in 9 opened a new tab at the promo field.",
    decision: "Fold the promo field into a small link under the payment block.",
    consequences: "Fewer exits at payment. Promo use dropped 4%. Finance agreed.",
    sources: [["slack", "Slack 16 Feb"], ["figma", "Figma 17 Feb"], ["github", "PR #371"]],
    raw: [
      { app: "slack", meta: "#acme-checkout · Priya · 16 Feb", text: "ppl keep leaving to google promo codes lol. can we hide the field??" },
      { app: "figma", meta: "Payment v2 · Daniel · 17 Feb", text: "promo → text link, below card fields" },
      { app: "github", meta: "PR #371 · Arjun · 18 Feb", text: "Collapse promo input (merged)" },
    ],
  },
  {
    id: "ADR-030", date: "2 Mar 2026", title: "Kept guest checkout",
    context: "Sales asked to force sign-up before payment. 71% of orders came from guests.",
    decision: "Keep guest checkout. Offer an account after the order is placed.",
    consequences: "No sign-up wall. Account creation moves to the thank-you page.",
    sources: [["slack", "Slack 27 Feb"], ["excel", "Excel 1 Mar"], ["notion", "Notion 2 Mar"]],
    raw: [
      { app: "slack", meta: "#acme-checkout · Priya · 27 Feb", text: "client wants forced signup. data says no?" },
      { app: "excel", meta: "Funnel_test.xlsx · D9 · Meera", text: "guest = 71% of orders" },
      { app: "notion", meta: "Meeting note · 2 Mar", text: "agreed: guest stays. acct offer on thx page" },
    ],
  },
  {
    id: "ADR-031", date: "14 Mar 2026", title: "Removed the multi-seat option from checkout",
    context: "Client call on 11 Mar: the multi-seat picker confused SMB buyers. 38% dropped off at the seat step.",
    decision: "Default to one seat. No seat picker on the first purchase.",
    consequences: "Seats are added later, in account settings. Client rule: no seat selection on first purchase.",
    sources: [["slack", "Slack 11 Mar"], ["figma", "Figma 12 Mar"], ["excel", "Excel 13 Mar"], ["github", "PR #412"]],
    raw: [
      { app: "slack", meta: "#acme-checkout · Priya · 11:42, 11 Mar", text: "Client call: multi-seat picker confuses SMB buyers. 38% drop-off at the seat step." },
      { app: "figma", meta: "Seat picker v3 → v4 · Daniel", text: "frame deleted · “Single seat default” added" },
      { app: "excel", meta: "Pricing_model_Q1.xlsx · Meera", text: "Plans!B14 seats: 5 → 1" },
      { app: "github", meta: "PR #412 · Arjun · 17:02", text: "Remove seat selector from checkout (merged)" },
    ],
  },
];
export const ADR_NEW = {
  id: "ADR-032", date: "22 Sep 2026", tag: "new · written just now",
  title: "Team plan picker paused — contradicts ADR-031",
  context: "Daniel started “Team plan picker v1” in Figma. It asks for seats on the first purchase.",
  decision: "Paused until Priya checks it with the client.",
  consequences: "Linked to ADR-031. Impact Radius warning sent to Daniel and Priya.",
  sources: [["figma", "Figma 22 Sep"], ["notion", "ADR-031"]] as SourceChip[],
};

export type FileKind = "doc" | "fig" | "xls";
export interface FinderNode { x: number; y: number; f: string; d: string; w: string; k: FileKind; p: string; r: string; kw: string }
export const FINDER_NODES: FinderNode[] = [
  { x: 40, y: 130, f: "Brief.docx", d: "8 Jan", w: "Priya Nair", k: "doc", p: "Drive›Clients›Acme›Checkout›01 brief", r: "M40 130h.1", kw: "brief doc docx start requirements" },
  { x: 130, y: 130, f: "Moodboard.fig", d: "19 Jan", w: "Daniel Okafor", k: "fig", p: "Figma›Acme Checkout›Explore", r: "M40 130H130", kw: "moodboard mood ideas inspiration" },
  { x: 230, y: 130, f: "Checkout_v1.fig", d: "2 Feb", w: "Daniel Okafor", k: "fig", p: "Figma›Acme Checkout›v1", r: "M40 130H230", kw: "v1 first checkout design" },
  { x: 320, y: 60, f: "Seat_picker_test.fig", d: "12 Feb", w: "Daniel Okafor", k: "fig", p: "Figma›Acme Checkout›Explore›seat tests", r: "M40 130H230C270 130 280 60 320 60", kw: "seat seats picker test multi" },
  { x: 420, y: 130, f: "Checkout_v2.fig", d: "20 Feb", w: "Daniel Okafor", k: "fig", p: "Figma›Acme Checkout›v2", r: "M40 130H420", kw: "v2 second checkout" },
  { x: 480, y: 200, f: "Pricing_model_Q1.xlsx", d: "24 Feb", w: "Meera Shah", k: "xls", p: "Drive›Clients›Acme›Checkout›v2›drafts", r: "M40 130H420C445 130 455 200 480 200", kw: "pricing draft model price" },
  { x: 600, y: 200, f: "Pricing_model_Q1_final.xlsx", d: "13 Mar", w: "Meera Shah", k: "xls", p: "Drive›Clients›Acme›Checkout›v3›final", r: "M40 130H420C445 130 455 200 480 200H600", kw: "pricing price sheet final spreadsheet excel seats b14 model" },
  { x: 720, y: 130, f: "final_FINAL_v3.fig", d: "21 Mar", w: "Daniel Okafor", k: "fig", p: "Figma›Acme Checkout›v3›final", r: "M40 130H720", kw: "final design v3 figma frame latest" },
];

/** Impact radius: nodes with distance from the edited frame (drives ripple timing). */
export const IMPACT_NODES = [
  { d: 172, cx: 250, cy: 58, label: { x: 250, y: 38, anchor: "middle" as const, t: "Checkout v3" } },
  { d: 172, cx: 230, cy: 250, label: { x: 244, y: 262, anchor: undefined, t: "PR #412" } },
  { d: 259, cx: 356, cy: 168, label: { x: 370, y: 173, anchor: undefined, t: "B14 = 1" } },
  { d: 310, cx: 400, cy: 64, label: { x: 400, y: 38, anchor: "middle" as const, t: "ADR-031" } },
];
export const IMPACT_RULE = { d: 355, cx: 432, cy: 250, label: "Client rule · 14 Mar", line2: "No seat selection on first purchase" };

/* ---------- §5 privacy ---------- */
export const PRIV_INDEX = [
  "ADR-031 · Removed multi-seat option",
  "Slack · #acme-checkout · 11 Mar · 38%",
  "Excel · Plans!B14 · seats 5 → 1",
  "GitHub · PR #412 · merged 14 Mar",
];
export const PRIV_TABLE: readonly (readonly [string, string, string, boolean])[] = [
  ["Text index", "Your laptop", "You", true],
  ["Decision graph", "Your laptop", "You", true],
  ["Screen video", "Never recorded", "—", false],
  ["Passwords & cards", "Never recorded", "—", false],
];

/* ---------- §6 who ---------- */
export const WHO = [
  { role: "Product designers & UX researchers", q: "“Why did we drop the seat picker?”", line: "Send the client one link with the call, the frame and the numbers.", card: "14 Mar · 38% of SMB buyers left at the seat step.", chips: [["slack", "Slack 11 Mar"], ["figma", "Figma 12 Mar"]] as SourceChip[] },
  { role: "Software & hardware engineers", q: "“Why does this function retry 3 times?”", line: "See the incident and the business reason before you touch old code.", card: "Gateway timeouts on 21 Feb. More than 3 retries caused double charges.", chips: [["github", "PR #388"], ["slack", "Slack 21 Feb"]] as SourceChip[] },
  { role: "Agencies & project managers", q: "“Who approved the revised scope?”", line: "Get an audit trail for every client approval. No meeting notes to write.", card: "Priya Nair, 6 Feb. Signed PDF in Drive › Clients › Acme › Scope.", chips: [["slack", "Slack 6 Feb"], ["drive", "Drive 6 Feb"]] as SourceChip[] },
];

/* ---------- §7 integrations + FAQ ---------- */
export const ORBIT_APPS: readonly (readonly [AppId, string, string])[] = [
  ["slack", "Slack", "Messages in the channels you choose."],
  ["figma", "Figma", "Frame names, layer text and comments in files you pick."],
  ["excel", "Excel", "Cell changes and sheet names in workbooks you open."],
  ["notion", "Notion", "Pages and databases you share with it."],
  ["github", "GitHub", "Commits, pull request titles and review comments in repos you add."],
  ["framer", "Framer", "Page and component changes in projects you allow."],
  ["drive", "Google Drive", "File names, folders and version history."],
];

export const FAQ = [
  { q: "Does it record my screen?", a: "No. It reads text only, and only in the apps you allow. There is no video and no screenshots." },
  { q: "Can my manager see my history?", a: "No. Your index is locked with a key on your laptop. Only you hold the key. Not us, and not your company." },
  { q: "Does it slow my laptop?", a: "No. It works in small batches when your laptop is idle. You can pause it from the menu bar at any time." },
  { q: "Which apps does it work with?", a: "Slack, Figma, Excel, Notion, GitHub, Framer and Google Drive today. You pick which ones it can read." },
  { q: "Does it work offline?", a: "Yes. Reading, indexing and search all run on your laptop, so it works with no internet at all." },
];

export const FOOTER_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#privacy", label: "Privacy" },
  { href: "#privacy", label: "Security" },
  { href: "#footer", label: "Changelog" },
  { href: "#footer", label: "Contact" },
];
