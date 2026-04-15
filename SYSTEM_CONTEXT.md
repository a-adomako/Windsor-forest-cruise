# SYSTEM CONTEXT — Windsor Forest Takeover Cruise

> Hand-off document for continuity across LLM sessions.
> Last updated: 2026-04-15

---

## 1. What This Is

A static landing page for a Windsor Forest High School alumni group cruise event. Windsor Forest alumni are taking over **Royal Caribbean's _Utopia of the Seas_**. The page is a pre-launch interest/waitlist capture — no booking happens here. Full event details have not been publicly released yet, so the page builds anticipation and collects signups.

**Live URL:** https://windsor-forest-cruise.vercel.app  
**GitHub repo:** https://github.com/a-adomako/Windsor-forest-cruise (public)  
**Deployment:** Vercel (auto-deploys from `main` branch)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Markup | Plain HTML5 (`index.html`) |
| Styles | Plain CSS3 (`css/styles.css`) — no preprocessor |
| Scripts | Vanilla JS (`js/main.js`) — no framework |
| Fonts | Google Fonts: Bebas Neue (display), Caveat (script), DM Sans (body) |
| Form backend | Google Apps Script Web App (POST endpoint) |
| Hosting | Vercel (Hobby plan, requires public repo) |
| Version control | Git → GitHub |

No build step. No bundler. No npm. Everything is raw files deployed as-is.

---

## 3. File Structure

```
windsor-forest-cruise/
├── index.html
├── SYSTEM_CONTEXT.md         ← this file
├── css/
│   └── styles.css
├── js/
│   └── main.js
└── assets/
    └── photos/
        ├── frame-image-19.png                ← desktop frame overlay (active)
        ├── frame-image-21.png                ← mobile frame overlay (active)
        ├── frame-image-04.png → frame-image-22.png   ← iteration history
        ├── sand-surface-texture-beige-background-zen-peace-concept.jpg  ← body background
        └── (other decorative assets)
```

---

## 4. Page Structure (HTML)

The page is split into sections. Two sections deliberately sit **outside** `.page-wrapper` to achieve true 100vw width:

```
<div class="page-wrapper">         ← max-width 1440px, centered
  <header .site-header>
    "Royal Caribbean" eyebrow
    "Windsor Forest" (Caveat script)
    "TAKEOVER CRUISE" (Bebas Neue display)
    "⚓ Utopia of the Seas" (Caveat)
  </header>
</div>

<section .hero-video>              ← OUTSIDE page-wrapper → true 100vw
  <div .frame-outer>
    <div .video-box>
      <iframe YouTube embed>
    </div>
    <img .frame-overlay>           ← desktop frame PNG (frame-image-19.png)
    <img .frame-overlay-mobile>    ← mobile frame PNG (frame-image-21.png)
  </div>
</section>

<div class="page-wrapper">
  <section .countdown-section>    ← "Details Released In:" + live countdown
  <section .summary-section>      ← tagline + summary copy
</div>

<section .form-section>           ← OUTSIDE page-wrapper → true 100vw
  Waitlist signup form
</section>

<footer .site-footer>
```

---

## 5. Visual Design

- **Background:** Warm sand texture (`#f4dec3` base + `sand-surface-texture-beige-background-zen-peace-concept.jpg`)
- **Primary text color:** `#1a3a2d` (dark forest green) for all headings, countdown, tagline
- **Body text:** `#1a1a1a`
- **Accent gold:** `#C9A84C` (eyebrow lines, separators)
- **Form section background:** `#1e2411` (dark green), white form inputs, gold border-top
- **Footer background:** `#FFFFFF`
- **Grain overlay:** Disabled (`opacity: 0`) — was used for dark-mode aesthetic, removed when switching to light/sand theme
- **Drop shadow on frame:** `filter: drop-shadow(0 14px 44px rgba(0,0,0,0.8))` on `.frame-outer`

---

## 6. Frame + Video System

This is the most complex part of the page. A decorative PNG (the "frame image") with a **transparent center window** sits on top of a YouTube embed. The video shows through the transparent hole. The frame art (collage borders) overlaps the video edges for a natural look.

### Key measurements (desktop)
- Frame image in use: `frame-image-19.png` (natural dimensions: **2955 × 2276 px**)
- Transparent window in frame: **W: 1808px, H: 1017px** (exactly 16:9)
- Window as % of frame width: `1808 / 2955 = 61.2%` — this was the starting video width
- Current desktop video width: **57.2%** (reduced from 61.2% over iterations)

### CSS architecture

```css
/* frame-outer fills full viewport width; height auto via aspect-ratio */
.frame-outer {
    width: 100vw;
    aspect-ratio: 2955 / 2276;   /* matches frame-image-19.png exactly */
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 14px 44px rgba(0,0,0,0.8));
}

/* frame image: absolutely fills container, layered ABOVE video (z-index: 4) */
.frame-overlay {
    position: absolute;
    inset: 0;
    width: 100%; height: 100%;
    object-fit: fill;             /* fill to exact aspect-ratio — no cropping */
    transform: translate(-2%, -2%);  /* fine-tune frame image position */
    z-index: 4;
    pointer-events: none;
}

/* video box: centered in frame-outer, sits BELOW frame (z-index: 2) */
.video-box {
    width: 57.2%;
    aspect-ratio: 16 / 9;
    z-index: 2;
    transform: translate(1%, 11%);  /* fine-tune video position to align with transparent window */
}
```

### Mobile-specific frame image
A different frame image is used on mobile. Two `<img>` elements are in the HTML; CSS toggles which one is visible:

```html
<img class="frame-overlay" src="assets/photos/frame-image-19.png?v=1" alt="">        <!-- desktop -->
<img class="frame-overlay-mobile" src="assets/photos/frame-image-21.png?v=2" alt=""> <!-- mobile -->
```

```css
/* Base: mobile image hidden */
.frame-overlay-mobile { display: none; position: absolute; inset: 0; ... }

/* Mobile breakpoint: swap visibility */
@media (max-width: 767px) {
    .frame-overlay        { display: none; }
    .frame-overlay-mobile { display: block; }
}
```

### Mobile video position (≤767px)
```css
@media (max-width: 767px) {
    .frame-outer { width: 110vw; margin-left: -5vw; }  /* 10% bigger, centered */
    .video-box   { width: 57%; transform: translate(2%, 7%); }
}
```

---

## 7. Countdown Timer

- Target date: **June 19, 2026 at midnight Eastern** (`2026-06-19T00:00:00-05:00`)
- Updates every second via `setInterval`
- On expiry: replaces countdown display with "IT'S TIME. LET'S SAIL. ⚓"
- **To change the date:** Edit `SAIL_DATE` in `js/main.js` line ~44

---

## 8. Waitlist Form

Fields: First Name, Last Name, Email, Phone, Graduating Class (dropdown 2026→1967 + "Other/Staff/Friend")

**Backend:** Google Apps Script Web App  
**Endpoint:** Stored in `APPS_SCRIPT_URL` constant in `main.js`  
**Method:** `fetch()` POST with `mode: 'no-cors'` (standard for Apps Script)  
**On success:** Hides the form, shows a success message ("You're on the list, Knight!")

Client-side validation covers: name presence, email format, phone length (10+ digits), class selection.

---

## 9. Responsive Breakpoints

| Breakpoint | Width | Notes |
|---|---|---|
| Desktop (default) | > 1199px | Full layout, `page-wrapper` max 1440px |
| Tablet | 768–1199px | Reduced padding, frame still 100vw |
| Mobile | ≤ 767px | Single-column form, frame 110vw, mobile frame image, smaller countdown |

---

## 10. Deployment Notes

- **Vercel project name:** `windsor-forest-cruise`
- **Git remote:** `https://github.com/a-adomako/Windsor-forest-cruise.git`
- **Branch:** `main` (auto-deploys on push)
- **Git identity for commits:** `user.email` must be `aarontabi@gmail.com` — this is the Vercel-connected GitHub account. Using a different email causes deployment to be blocked.
- **Vercel plan:** Hobby — repo must remain **public** or deployments from collaborators will be blocked.
- **Cache busting:** Append `?v=N` to image `src` attributes when updating images that Vercel may have cached. Increment N each time.

---

## 11. Key Design Decisions & History

- **Why frame image is an `<img>` not a CSS background:** CSS `background-image` can't be stacked above an iframe. The frame must be a real DOM element with `z-index` above the video.
- **Why `object-fit: fill`:** The frame image's transparent window position only aligns correctly when the image fills the exact container dimensions. `cover` or `contain` would shift the window position.
- **Why `aspect-ratio` matches image pixel dimensions:** Ensures the container never stretches or letterboxes the frame image, keeping the transparent window at a predictable position.
- **Why `hero-video` is outside `.page-wrapper`:** `page-wrapper` has `overflow-x: hidden` on `html`, which clips anything exceeding viewport width. Moving the section outside lets it be true `100vw`.
- **Why two `<img>` elements for mobile/desktop frame:** CSS `content: url()` on `<img>` elements is unreliable across mobile browsers. Two separate elements toggled with `display` is the robust solution.
- **Why `no-cors` on form fetch:** Google Apps Script Web App endpoints don't return CORS headers, so the browser would block a normal fetch. `no-cors` allows the POST to fire and the Apps Script still receives it — the response is just opaque.
- **Light mode:** The site was originally dark green. It was redesigned to a warm sand/light aesthetic. All white text was converted to `#1a3a2d` or `#1a1a1a`. The grain overlay was disabled (it used `mix-blend-mode: screen` which only works on dark backgrounds).

---

## 12. Currently Active Asset Versions

| Asset | File | Where used |
|---|---|---|
| Desktop frame | `frame-image-19.png` | `.frame-overlay` (desktop) |
| Mobile frame | `frame-image-21.png` | `.frame-overlay-mobile` (≤767px) |
| Body background | `sand-surface-texture-beige-background-zen-peace-concept.jpg` | `body` CSS |
| YouTube video | `https://www.youtube.com/embed/y0_nhqUXLYU` | `<iframe>` in hero |
