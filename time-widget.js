// "Time is precious" widget for Scriptable (iPhone).
// Home Screen: small, medium or large. Lock Screen: rectangular, inline or circular.
// Tapping the widget opens the full page.

// ---------- Settings (edit here) ----------
const CONFIG = {
  workStart: [9, 0],   // weekdays, used for the progress line
  workEnd:   [18, 0],  // weekdays: count down to this
  dayStart:  [6, 0],   // used for the progress line
  dayEnd:    [22, 0],  // evenings and weekends: count down to this
  restUntil: [5, 0],   // between dayEnd and this time: "The day is done"
  dim: 0.42,           // darkness over the picture (0 = none, 1 = black)
  site: "https://aloe-andrea.github.io/New-/"
};

const QUOTES = [
  ["It is not that we have a short time to live, but that we waste much of it.", "Seneca"],
  ["While we are postponing, life speeds by.", "Seneca"],
  ["Nothing, Lucilius, is ours, except time.", "Seneca"],
  ["Begin at once to live, and count each separate day as a separate life.", "Seneca"],
  ["Life is long if you know how to use it.", "Seneca"],
  ["You could leave life right now. Let that determine what you do and say and think.", "Marcus Aurelius"],
  ["Waste no more time arguing about what a good man should be. Be one.", "Marcus Aurelius"],
  ["Confine yourself to the present.", "Marcus Aurelius"],
  ["How long will you wait before you demand the best for yourself?", "Epictetus"],
  ["Lost time is never found again.", "Benjamin Franklin"],
  ["Time is what we want most, but what we use worst.", "William Penn"],
  ["You cannot kill time without injuring eternity.", "Henry David Thoreau"],
  ["Seize the day, trusting as little as possible in tomorrow.", "Horace"],
  ["Time flees, and it flees beyond recall.", "Virgil"],
  ["Time is the wisest counselor.", "Pericles"],
  ["How we spend our days is how we spend our lives.", "Annie Dillard"],
  ["The key is not spending time, but investing it.", "Stephen R. Covey"],
  ["Wherever you are, be all there.", "Jim Elliot"],
  ["The best time to plant a tree was twenty years ago. The second best time is now.", "Chinese proverb"]
];

// ---------- Time logic ----------
const now = new Date();
const at = (d, hm) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), hm[0], hm[1], 0, 0);
const pad = n => String(n).padStart(2, "0");

function target(d) {
  const weekday = d.getDay() >= 1 && d.getDay() <= 5;
  if (d >= at(d, CONFIG.dayEnd) || d < at(d, CONFIG.restUntil)) return { rest: true };
  if (weekday && d < at(d, CONFIG.workEnd))
    return { label: "WORK DAY · UNTIL " + pad(CONFIG.workEnd[0]) + ":" + pad(CONFIG.workEnd[1]), short: "Work day",
             start: at(d, CONFIG.workStart), end: at(d, CONFIG.workEnd), kind: "work day" };
  return { label: "YOUR DAY · UNTIL " + pad(CONFIG.dayEnd[0]) + ":" + pad(CONFIG.dayEnd[1]), short: "Your day",
           start: at(d, CONFIG.dayStart), end: at(d, CONFIG.dayEnd), kind: "day" };
}

const t = target(now);
const done = t.rest ? 1 : Math.min(1, Math.max(0, (now - t.start) / (t.end - t.start)));
const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
const family = config.widgetFamily || "medium";
const isLock = family.startsWith("accessory");

// ---------- Background picture (online, with offline fallback) ----------
const fm = FileManager.local();
const cacheDir = fm.joinPath(fm.cacheDirectory(), "time-widget");
if (!fm.fileExists(cacheDir)) fm.createDirectory(cacheDir, true);
const cachedImg = fm.joinPath(cacheDir, "last.jpg");

async function loadPicture() {
  try {
    const list = await new Request(CONFIG.site + "images.js").loadString();
    const items = JSON.parse(list.slice(list.indexOf("["), list.lastIndexOf("]") + 1));
    const pick = items[Math.floor(Math.random() * items.length)];
    const req = new Request(CONFIG.site + pick.file);
    req.timeoutInterval = 15;
    const img = await req.loadImage();
    fm.writeImage(cachedImg, img);
    return img;
  } catch (e) {
    return fm.fileExists(cachedImg) ? fm.readImage(cachedImg) : null;
  }
}

function backdrop(img, w, h) {
  const dc = new DrawContext();
  dc.size = new Size(w, h); dc.opaque = true; dc.respectScreenScale = false;
  dc.setFillColor(new Color("#0b1026")); dc.fillRect(new Rect(0, 0, w, h));
  if (img) {
    const s = Math.max(w / img.size.width, h / img.size.height);      // fill and crop to the centre
    const iw = img.size.width * s, ih = img.size.height * s;
    dc.drawImageInRect(img, new Rect((w - iw) / 2, (h - ih) / 2, iw, ih));
  }
  dc.setFillColor(new Color("#000000", CONFIG.dim)); dc.fillRect(new Rect(0, 0, w, h));
  for (let i = 0; i < 10; i++) {                                         // soft extra shade towards the bottom
    dc.setFillColor(new Color("#000000", 0.03 * (i + 1)));
    dc.fillRect(new Rect(0, h * (0.55 + i * 0.045), w, h * 0.045 + 1));
  }
  return dc.getImage();
}

function progressBar(width) {
  const dc = new DrawContext();
  dc.size = new Size(width, 6); dc.opaque = false; dc.respectScreenScale = true;
  dc.setFillColor(new Color("#ffffff", 0.25)); dc.fillRect(new Rect(0, 2, width, 2));
  dc.setFillColor(new Color("#ffd9a0")); dc.fillRect(new Rect(0, 2, Math.round(width * done), 2));
  return dc.getImage();
}

// ---------- Building blocks ----------
const white = Color.white();
function text(parent, str, font, opacity = 1, center = true) {
  const tx = parent.addText(str);
  tx.font = font; tx.textColor = new Color("#ffffff", opacity);
  if (center) tx.centerAlignText();
  return tx;
}
function centered(parent, build) {
  const row = parent.addStack(); row.layoutHorizontally();
  row.addSpacer(); build(row); row.addSpacer();
  return row;
}
function timer(parent, size) {
  const d = parent.addDate(t.end);
  d.applyTimerStyle(); d.font = Font.ultraLightSystemFont(size); d.textColor = white; d.centerAlignText();
  d.minimumScaleFactor = 0.6; d.lineLimit = 1;
  return d;
}

// ---------- Widgets ----------
async function homeWidget() {
  const w = new ListWidget();
  w.url = TAP_URL;
  const sizes = { small: [340, 340], medium: [728, 340], large: [728, 764], extraLarge: [1460, 764] };
  const [bw, bh] = sizes[family] || sizes.medium;
  w.backgroundImage = backdrop(await loadPicture(), bw, bh);
  w.setPadding(14, 14, 12, 14);

  const big = family === "large" || family === "extraLarge";
  const small = family === "small";
  w.addSpacer();

  if (t.rest) {
    text(w, "DAY COMPLETE", Font.mediumSystemFont(small ? 9 : 10), 0.8);
    w.addSpacer(4);
    text(w, "The day is done. Rest well.", Font.lightSystemFont(small ? 17 : big ? 28 : 22));
  } else {
    text(w, small ? t.short.toUpperCase() + " · " + pad(t.end.getHours()) + ":" + pad(t.end.getMinutes()) : t.label,
         Font.mediumSystemFont(small ? 9 : 10), 0.8);
    if (!small) { w.addSpacer(2); text(w, "Time is precious. Not wasting it.", Font.lightSystemFont(big ? 14 : 11), 0.92); }
    w.addSpacer(2);
    timer(w, small ? 34 : big ? 64 : 44);
    w.addSpacer(small ? 4 : 6);
    centered(w, row => { const b = row.addImage(progressBar(small ? 110 : 180)); b.imageSize = new Size(small ? 110 : 180, 6); });
    w.addSpacer(3);
    text(w, Math.round(done * 100) + (small ? "% behind you" : "% of the " + t.kind + " is behind you"), Font.mediumSystemFont(small ? 8 : 9), 0.75);
  }

  if (!small) {
    w.addSpacer(big ? 22 : 8);
    const q = text(w, "“" + quote[0] + "”", new Font("Georgia-Italic", big ? 18 : 12));
    q.lineLimit = big ? 4 : 2; q.minimumScaleFactor = 0.8;
    w.addSpacer(2);
    text(w, quote[1].toUpperCase(), Font.mediumSystemFont(8), 0.72);
  }
  w.addSpacer();
  return w;
}

function lockWidget() {
  const w = new ListWidget();
  w.url = TAP_URL;
  if (family === "accessoryInline") {
    if (t.rest) w.addText("Day complete. Rest well.");
    else { const d = w.addDate(t.end); d.applyTimerStyle(); }
    return w;
  }
  if (family === "accessoryCircular") {
    w.addAccessoryWidgetBackground = true;
    if (t.rest) { const x = w.addText("Rest"); x.font = Font.semiboldSystemFont(14); x.centerAlignText(); return w; }
    const l = w.addText(t.kind === "work day" ? "WORK" : "DAY"); l.font = Font.semiboldSystemFont(9); l.centerAlignText();
    const d = w.addDate(t.end); d.applyTimerStyle(); d.font = Font.semiboldSystemFont(12); d.centerAlignText(); d.minimumScaleFactor = 0.5;
    return w;
  }
  // accessoryRectangular
  if (t.rest) {
    const a = w.addText("DAY COMPLETE"); a.font = Font.semiboldSystemFont(11);
    const b = w.addText("Rest well."); b.font = Font.lightSystemFont(20);
    return w;
  }
  const a = w.addText(t.label); a.font = Font.semiboldSystemFont(10); a.minimumScaleFactor = 0.7; a.lineLimit = 1;
  const d = w.addDate(t.end); d.applyTimerStyle(); d.font = Font.lightSystemFont(24); d.minimumScaleFactor = 0.7;
  const c = w.addText(Math.round(done * 100) + "% behind you"); c.font = Font.mediumSystemFont(10); c.textOpacity = 0.8;
  return w;
}

// ---------- Run ----------
// iOS opens any web address from a widget in Safari, and cannot open a Home Screen web app directly.
// So a tap re-opens this script, which shows the full page full screen inside Scriptable, without Safari.
const TAP_URL = "scriptable:///run/" + encodeURIComponent(Script.name()) + "?open=page";
const openPage = (args.queryParameters || {}).open === "page";

if (openPage) {
  await WebView.loadURL(CONFIG.site, null, true);
} else {
  const widget = isLock ? lockWidget() : await homeWidget();

  // Refresh soon after the target time (so the mode switches), otherwise about every 20 minutes for a new picture and quote.
  const next = new Date(now.getTime() + 20 * 60 * 1000);
  let switchAt = t.rest ? at(now, CONFIG.restUntil) : new Date(t.end.getTime() + 5000);
  if (switchAt <= now) switchAt = new Date(switchAt.getTime() + 24 * 3600 * 1000);
  widget.refreshAfterDate = switchAt < next ? switchAt : next;

  if (config.runsInWidget || config.runsInAccessoryWidget) {
    Script.setWidget(widget);
  } else {
    await widget.presentMedium();   // preview when you run the script inside the app
  }
}
Script.complete();
