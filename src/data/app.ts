/* OmniTrace mobile app — the one DATA object (the Acme Checkout story), ported verbatim from
   OmniTrace_Mobile_App_v1.0.html. Text must stay identical to the prototype. */

export type RoomId = "slack" | "figma" | "excel" | "notion" | "github" | "framer" | "drive";
export type PersonId = "priya" | "daniel" | "meera" | "arjun" | "omni";

export const P: Record<PersonId, string> = { priya: "Priya Nair", daniel: "Daniel Okafor", meera: "Meera Shah", arjun: "Arjun Mehta", omni: "OmniTrace" };

/** One source card behind an answer. a = room, n = room name, h = place, w = who, at = time, d = day, x = excerpt */
export interface Source { a: RoomId; n: string; h: string; w: PersonId; at: string; d: string; x: string }
export interface Question { id: string; q: string; k: string; d: string; save?: string; t: string; src: Source[] }
/** [isoDate, time, room, title, who, tag?] */
export type TrailEvent = [string, string, RoomId, string, PersonId, string?];
export interface Adr {
  t: string; d: string; nw?: number; line: string; ctx: string; dec: string; con: string;
  src: [RoomId, string][];
  raw: [RoomId, string, string][];
}
export interface Alert { id: number; a: RoomId; t: string; m: string; warn?: number }
export type NodeType = "room" | "person" | "card" | "dec" | "rule";
/** [id, type, short label, full label, room?, isoDate?] */
export type GraphNodeRow = [string, NodeType, string, string, RoomId?, string?];

export interface AppData {
  projects: string[];
  rooms: [RoomId, string, string][];
  qs: Question[];
  recent: string[];
  ev: TrailEvent[];
  adr: Record<string, Adr>;
  alerts: Alert[];
  skipped: [string, string, "mask" | "lock"][];
  nodes: GraphNodeRow[];
  edges: [string, string][];
  path: string[];
}

export const DATA: AppData = {
  projects:['Acme Checkout','Mandi Pricing','Highness Site'],
  rooms:[['slack','Slack','Messages in channels you choose'],['figma','Figma','Frame names and edits'],['excel','Excel','Cell changes in shared sheets'],['notion','Notion','Pages you pick'],['github','GitHub','Pull requests and commits'],['framer','Framer','Page versions'],['drive','Google Drive','File names and folders']],
  qs:[
    {id:'seat',q:'Why did we remove the multi-seat option in checkout last month?',k:'remove removed multi seat seats picker option checkout multiseat',d:'14 Mar',save:'Saved as ADR-031',
     t:'You removed it on 14 Mar, after a client call. SMB buyers were dropping off at the seat picker (38%). Priya raised it in Slack, Daniel redesigned the frame in Figma, Meera set seats to 1 in the pricing model, and Arjun merged PR #412.',
     src:[{a:'slack',n:'Slack',h:'#acme-checkout',w:'priya',at:'11:42',d:'11 Mar',x:'“Client call: multi-seat picker confuses SMB buyers. 38% drop-off at the seat step.”'},
      {a:'figma',n:'Figma',h:'Seat picker v3 → v4',w:'daniel',at:'15:10',d:'12 Mar',x:'File “Acme Checkout”. Frame “Seat picker v3” deleted. Frame “Single seat default” added.'},
      {a:'excel',n:'Excel',h:'Pricing_model_Q1.xlsx',w:'meera',at:'09:35',d:'13 Mar',x:'Sheet Plans · cell B14 · seats 5 → 1'},
      {a:'github',n:'GitHub',h:'PR #412',w:'arjun',at:'17:02',d:'14 Mar',x:'“Remove seat selector from checkout” · merged into main'}]},
    {id:'sheet',q:'Where is the final pricing sheet?',k:'where final pricing price sheet spreadsheet excel file model',d:'13 Mar',
     t:'It is Pricing_model_Q1_final.xlsx. Meera saved it on 13 Mar in Drive › Clients › Acme › Checkout › v3 › final. It is the copy with seats set to 1.',
     src:[{a:'excel',n:'Excel',h:'Pricing_model_Q1_final.xlsx',w:'meera',at:'09:35',d:'13 Mar',x:'Last saved copy · Plans!B14 = 1'},{a:'drive',n:'Google Drive',h:'Checkout › v3 › final',w:'meera',at:'09:41',d:'13 Mar',x:'Drive › Clients › Acme › Checkout › v3 › final'}]},
    {id:'scope',q:'Who approved the revised scope?',k:'who approve approved approval scope revised sign signed client',d:'6 Feb',
     t:'Priya Nair approved it on 6 Feb, in a reply to the client in #acme-checkout. The new scope dropped the gift-card step. The signed PDF is in Drive › Clients › Acme › Scope.',
     src:[{a:'slack',n:'Slack',h:'#acme-checkout',w:'priya',at:'12:20',d:'6 Feb',x:'“Approved. We drop the gift-card step from this phase.”'},{a:'drive',n:'Google Drive',h:'Scope_rev2_signed.pdf',w:'priya',at:'12:31',d:'6 Feb',x:'Drive › Clients › Acme › Scope'},{a:'notion',n:'Notion',h:'Checkout decisions',w:'omni',at:'09:00',d:'7 Feb',x:'Scope change logged, with a link to the thread.'}]},
    {id:'retry',q:'Why does this function retry 3 times?',k:'retry retries function three 3 times code timeout payment gateway',d:'21 Feb',
     t:'The payment gateway timed out under load on 21 Feb. Arjun added 3 retries in PR #388. In testing, more than 3 retries caused double charges.',
     src:[{a:'slack',n:'Slack',h:'#acme-incidents',w:'arjun',at:'10:14',d:'21 Feb',x:'“Gateway timing out at peak. 1 in 40 payments fail.”'},{a:'github',n:'GitHub',h:'PR #388',w:'arjun',at:'13:05',d:'21 Feb',x:'“Retry gateway call up to 3 times” · merged'},{a:'notion',n:'Notion',h:'Incident note',w:'arjun',at:'16:30',d:'22 Feb',x:'“4 or more retries caused double charges in test. Keep it at 3.”'}]},
    {id:'cta',q:'When did we move the CTA below the fold?',k:'when cta button fold move moved below pay call action',d:'3 Mar',
     t:'On 3 Mar. Daniel moved the Pay button below the order summary, so buyers see the total first. Completed orders went up 6% in the test.',
     src:[{a:'figma',n:'Figma',h:'Payment v3',w:'daniel',at:'14:22',d:'3 Mar',x:'Pay button moved under the order summary.'},{a:'framer',n:'Framer',h:'Checkout test page',w:'daniel',at:'11:00',d:'4 Mar',x:'Test page published · 50/50 split'},{a:'excel',n:'Excel',h:'AB_results.xlsx',w:'meera',at:'17:45',d:'9 Mar',x:'Completed orders · version B +6%'}]}],
  recent:['seat','scope','retry'],
  /* [date, time, room, title, who, tag] — tag: 'adr:031' links a decision, 'n:key' links a graph node */
  ev:[['2026-01-08','10:05','drive','Brief.docx added to Checkout › 01 brief','priya'],['2026-01-19','14:40','figma','Moodboard.fig started','daniel'],['2026-01-20','16:20','figma','Frame “Cart v2” added','daniel','n:cart'],
    ['2026-02-04','09:30','slack','Standup: checkout v2 is live for all plans','arjun','n:stand'],['2026-02-06','12:20','slack','Revised scope approved in #acme-checkout','priya'],['2026-02-16','10:12','slack','“ppl keep leaving to google promo codes”','priya'],
    ['2026-02-17','15:30','figma','Promo field becomes a text link','daniel'],['2026-02-18','17:45','github','PR #371 merged · collapse promo input','arjun'],['2026-02-18','18:00','notion','Moved the promo code field below payment','omni','adr:029'],
    ['2026-02-21','13:05','github','PR #388 · retry gateway call 3 times','arjun'],['2026-02-27','16:40','slack','Client wants forced sign-up','priya'],['2026-03-01','09:10','excel','Funnel_test.xlsx · D9 guests = 71%','meera'],
    ['2026-03-02','18:00','notion','Kept guest checkout','omni','adr:030'],['2026-03-11','11:42','slack','Client call: seat picker confuses SMB buyers','priya','n:msg'],['2026-03-12','15:10','figma','Seat picker v3 → v4 · single seat default','daniel','n:frame'],
    ['2026-03-13','09:35','excel','Plans!B14 seats 5 → 1','meera','n:cell'],['2026-03-14','17:02','github','PR #412 merged · remove seat selector','arjun','n:pr'],['2026-03-14','17:20','notion','Removed the multi-seat option from checkout','omni','adr:031'],
    ['2026-03-14','17:24','notion','Client rule: no seat selection on first purchase','priya','n:rule'],['2026-04-19','14:00','figma','Checkout copy edit · no conflict','daniel'],['2026-05-12','11:00','drive','Q2 pricing review notes','meera'],
    ['2026-06-03','09:20','excel','Funnel_test.xlsx updated · guests 74%','meera'],['2026-07-15','10:30','slack','Client asks about team plans','priya'],['2026-08-27','16:10','github','PR #455 · plan limits API','arjun'],
    ['2026-09-08','11:05','figma','Frame “Team plan picker v1” added','daniel','n:team'],['2026-09-22','10:48','figma','Team plan picker v1 asks for seats','daniel'],['2026-09-22','10:49','notion','Team plan picker paused','omni','adr:032']],
  adr:{
    '032':{t:'Team plan picker paused — contradicts ADR-031',d:'22 Sep 2026',nw:1,line:'Daniel’s new picker asks for seats again.',ctx:'Daniel started “Team plan picker v1” in Figma. It asks for seats on the first purchase.',dec:'Paused until Priya checks it with the client.',con:'Linked to ADR-031. Impact Radius warning sent to Daniel and Priya.',src:[['figma','Figma 22 Sep'],['notion','ADR-031']],
      raw:[['figma','Team plan picker v1 · Daniel · 22 Sep','seats step is back for team plans'],['notion','OmniTrace · 22 Sep','clashes with client rule from 14 Mar'],['slack','#acme-checkout · Priya · 22 Sep','will check w/ client tmrw, pls hold']]},
    '031':{t:'Removed the multi-seat option from checkout',d:'14 Mar 2026',line:'38% of SMB buyers dropped off at the seat step.',ctx:'Client call on 11 Mar: the multi-seat picker confused SMB buyers. 38% dropped off at the seat step.',dec:'Default to one seat. No seat picker on the first purchase.',con:'Seats are added later, in account settings. Client rule: no seat selection on first purchase.',src:[['slack','Slack 11 Mar'],['figma','Figma 12 Mar'],['excel','Excel 13 Mar'],['github','PR #412']],
      raw:[['slack','#acme-checkout · Priya · 11:42, 11 Mar','Client call: multi-seat picker confuses SMB buyers. 38% drop-off at the seat step.'],['figma','Seat picker v3 → v4 · Daniel','frame deleted · “Single seat default” added'],['excel','Pricing_model_Q1.xlsx · Meera','Plans!B14 seats: 5 → 1'],['github','PR #412 · Arjun · 17:02','Remove seat selector from checkout (merged)']]},
    '030':{t:'Kept guest checkout',d:'2 Mar 2026',line:'71% of orders came from guests.',ctx:'Sales asked to force sign-up before payment. 71% of orders came from guests.',dec:'Keep guest checkout. Offer an account after the order is placed.',con:'No sign-up wall. Account creation moves to the thank-you page.',src:[['slack','Slack 27 Feb'],['excel','Excel 1 Mar'],['notion','Notion 2 Mar']],
      raw:[['slack','#acme-checkout · Priya · 27 Feb','client wants forced signup. data says no?'],['excel','Funnel_test.xlsx · D9 · Meera','guest = 71% of orders'],['notion','Meeting note · 2 Mar','agreed: guest stays. acct offer on thx page']]},
    '029':{t:'Moved the promo code field below payment',d:'18 Feb 2026',line:'Buyers left checkout to hunt for promo codes.',ctx:'Buyers left checkout to hunt for promo codes. 1 in 9 opened a new tab at the promo field.',dec:'Fold the promo field into a small link under the payment block.',con:'Fewer exits at payment. Promo use dropped 4%. Finance agreed.',src:[['slack','Slack 16 Feb'],['figma','Figma 17 Feb'],['github','PR #371']],
      raw:[['slack','#acme-checkout · Priya · 16 Feb','ppl keep leaving to google promo codes lol. can we hide the field??'],['figma','Payment v2 · Daniel · 17 Feb','promo → text link, below card fields'],['github','PR #371 · Arjun · 18 Feb','Collapse promo input (merged)']]}},
  alerts:[{id:1,a:'figma',t:'Team plan picker v1 contradicts ADR-031',m:'Figma · Daniel Okafor · 22 Sep',warn:1},
    {id:2,a:'excel',t:'Funnel_test.xlsx updated — still agrees with ADR-030',m:'Excel · Meera Shah · 3 Jun'},
    {id:3,a:'figma',t:'Checkout copy edit checked — no conflict',m:'Figma · Daniel Okafor · 19 Apr'}],
  skipped:[['Banking tab','Chrome · 08:12','mask'],['Private window','Safari · 13:40','mask'],['Password field','Slack sign-in · 09:02','lock'],['Password field','GitHub sign-in · 09:05','lock']],
  /* graph: [id, type, short label, full label, room, date] */
  nodes:[['slack','room','Slack','Slack · meeting room'],['figma','room','Figma','Figma · drawing board'],['excel','room','Excel','Excel · accounting desk'],['github','room','GitHub','GitHub · workshop'],['notion','room','Notion','Notion · library'],
    ['priya','person','Priya','Priya Nair'],['daniel','person','Daniel','Daniel Okafor'],['meera','person','Meera','Meera Shah'],['arjun','person','Arjun','Arjun Mehta'],
    ['msg','card','11:42 call','Client call message','slack','2026-03-11'],['frame','card','frame v4','Seat picker v3 → v4','figma','2026-03-12'],['cell','card','B14 = 1','Plans!B14 seats 5 → 1','excel','2026-03-13'],['pr','card','PR #412','PR #412 merged','github','2026-03-14'],
    ['stand','card','standup','Standup: checkout v2 live','slack','2026-02-04'],['cart','card','cart v2','Frame “Cart v2”','figma','2026-01-20'],['team','card','team picker','Frame “Team plan picker v1”','figma','2026-09-08'],
    ['adr','dec','ADR-031','ADR-031 · multi-seat removed','notion','2026-03-14'],['rule','rule','client rule','Client rule · no seat selection on first purchase','notion','2026-03-14']],
  edges:[['msg','slack'],['stand','slack'],['frame','figma'],['cart','figma'],['team','figma'],['cell','excel'],['pr','github'],['adr','notion'],['rule','notion'],
    ['msg','priya'],['frame','daniel'],['cell','meera'],['pr','arjun'],['stand','arjun'],['cart','daniel'],['team','daniel'],['rule','priya'],['adr','priya'],
    ['msg','frame'],['frame','cell'],['cell','pr'],['pr','adr'],['adr','rule'],['team','rule']],
  path:['msg','frame','cell','pr','adr']
};

export const Q = (id: string | undefined): Question => DATA.qs.find((q) => q.id === id) || DATA.qs[0];
export const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const fmtDay = (iso: string) => { const d = new Date(iso + "T12:00:00"); return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`; };
export const dm = (iso: string) => { const d = new Date(iso + "T12:00:00"); return d.getDate() + " " + MON[d.getMonth()]; };
export const RN = Object.fromEntries(DATA.rooms.map((r) => [r[0], r[1]])) as Record<RoomId, string>;
export const DEFAULT_ROOMS: Record<RoomId, number> = { slack: 1, figma: 1, excel: 1, notion: 1, github: 1, framer: 0, drive: 1 };
export const PROJECT = "Acme Checkout";
