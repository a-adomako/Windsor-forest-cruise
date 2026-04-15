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
| Form backend | Vercel serverless proxy -> Google Apps Script Web App |
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
├── api/
│   └── waitlist.js
├── apps-script/
│   └── code.gs
└── assets/
    └── photos/
        ├── frame-image-19-desktop.webp       ← desktop frame overlay (active)
        ├── frame-image-21-mobile.webp        ← mobile frame overlay (active)
        ├── frame-image-04.png → frame-image-22.png   ← iteration history
        ├── sand-background-desktop.webp      ← desktop background (active)
        ├── sand-background-mobile.webp       ← mobile background (active)
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
      click-to-load YouTube poster
    </div>
    <picture .frame-picture>
      responsive frame overlay
    </picture>
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

This is the most complex part of the page. A decorative frame image with a **transparent center window** sits on top of a click-to-load YouTube player. The frame art (collage borders) overlaps the video edges for a natural look, but the heavy iframe is only created after user interaction.

### Key measurements (desktop)
- Frame source artwork: `frame-image-19.png` (natural dimensions: **2955 × 2276 px**)
- Production desktop frame asset: `frame-image-19-desktop.webp`
- Production mobile frame asset: `frame-image-21-mobile.webp`
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

/* frame art is still layered above the video, now via a picture element */
.frame-picture {
    position: absolute;
    inset: 0;
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
A different frame image is still used on mobile, but the page now uses `<picture>` so only the appropriate optimized asset is requested for the viewport:

```html
<picture class="frame-picture">
  <source media="(max-width: 767px)" srcset="assets/photos/frame-image-21-mobile.webp" type="image/webp">
  <source srcset="assets/photos/frame-image-19-desktop.webp" type="image/webp">
  <img class="frame-overlay" src="assets/photos/frame-image-19.png?v=1" alt="">
</picture>
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

**Backend flow:** Frontend -> `/api/waitlist` -> Google Apps Script Web App  
**Frontend endpoint:** `'/api/waitlist'` in `main.js`  
**Server validation:** Vercel function validates and sanitizes before forwarding  
**On success:** Hides the form, shows a success message ("You're on the list, Knight!") only after a confirmed backend response

Client-side validation covers: name presence, email format, phone length (10+ digits), class selection, and a hidden honeypot field.

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
- **Runtime env var:** `GOOGLE_APPS_SCRIPT_URL` should be set in Vercel for the serverless form proxy.
- **Cache busting:** Append `?v=N` to image `src` attributes when updating images that Vercel may have cached. Increment N each time.

---

## 11. Key Design Decisions & History

- **Why frame image is an `<img>` not a CSS background:** CSS `background-image` can't be stacked above an iframe. The frame must be a real DOM element with `z-index` above the video.
- **Why `object-fit: fill`:** The frame image's transparent window position only aligns correctly when the image fills the exact container dimensions. `cover` or `contain` would shift the window position.
- **Why `aspect-ratio` matches image pixel dimensions:** Ensures the container never stretches or letterboxes the frame image, keeping the transparent window at a predictable position.
- **Why `hero-video` is outside `.page-wrapper`:** `page-wrapper` has `overflow-x: hidden` on `html`, which clips anything exceeding viewport width. Moving the section outside lets it be true `100vw`.
- **Why a `<picture>` wrapper is used for the frame:** It preserves the exact same frame artwork while ensuring mobile users can receive a smaller optimized asset instead of always downloading the desktop version.
- **Why the frontend no longer posts directly to Apps Script:** Direct `no-cors` posting could not verify success. A same-origin Vercel proxy now returns a real JSON success/failure response while Apps Script remains the sheet writer.
- **Light mode:** The site was originally dark green. It was redesigned to a warm sand/light aesthetic. All white text was converted to `#1a3a2d` or `#1a1a1a`. The grain overlay was disabled (it used `mix-blend-mode: screen` which only works on dark backgrounds).

---

## 12. Currently Active Asset Versions

| Asset | File | Where used |
|---|---|---|
| Desktop frame | `frame-image-19-desktop.webp` | `<picture>` desktop source |
| Mobile frame | `frame-image-21-mobile.webp` | `<picture>` mobile source (≤767px) |
| Desktop background | `sand-background-desktop.webp` | `body` CSS (≥768px) |
| Mobile background | `sand-background-mobile.webp` | `body` CSS |
| YouTube poster | `https://i.ytimg.com/vi/y0_nhqUXLYU/hqdefault.jpg` | click-to-load hero poster |

---

## CODEX System Improvements

The visual design should remain intact. Improvements should focus on performance, reliability, security, maintainability, and delivery efficiency without changing the current art direction, layout structure, typography choices, or overall feel.

### 1. Performance Improvements (No Design Change)

- [DONE] **Re-export active images for web delivery:** The currently active frame and background assets are far too large for production delivery. Create optimized `webp` and/or `avif` versions of:
  - `assets/photos/frame-image-19.png`
  - `assets/photos/frame-image-21.png`
  - `assets/photos/sand-surface-texture-beige-background-zen-peace-concept.jpg`
- [DONE] **Keep the same compositions and crop positions:** Only optimize file size and responsive dimensions. Do not alter the visual artwork.
- [DONE] **Serve responsive frame assets:** Replace the current dual-`img` loading approach with a responsive image strategy so mobile users do not download desktop assets unnecessarily.
- [DONE] **Use responsive background variants:** Provide smaller background versions for tablet/mobile while preserving the same sand texture and visual tone.
- [DONE] **Defer heavy YouTube loading:** Replace the eager iframe load with a poster-state that loads the YouTube embed only after user interaction. The visual frame and layout should remain the same.
- [DONE] **Add long-term caching for static assets:** Configure deployment caching so versioned images, CSS, and JS are cached aggressively.

### 2. Reliability Fixes

- [DONE] **Fix countdown expiry logic:** The current countdown implementation can break after the event date because the interval is cleared before the timer variable is initialized in the expired path. Refactor the countdown so expiry is safe and does not affect the rest of the page.
- [DONE] **Isolate page behaviors:** Separate countdown, form, and media logic into independent setup functions so one failure does not block the rest of the script.
- [DONE] **Move content values into a small config layer:** Store the event date, video URL, and endpoint in a single configuration object to reduce editing risk during future updates.
- [DONE] **Remove dead code paths:** Delete or archive unused carousel logic and related CSS if that feature is not being shipped.

### 3. Form Submission Improvements

- [DONE] **Stop showing success on unverified submissions:** The current `no-cors` submission flow cannot confirm success but still shows a success state. Replace it with a verifiable submission path.
- [DONE] **Use a CORS-capable endpoint or proxy:** Options include:
  - a lightweight serverless function
  - a proxy in front of Google Apps Script
  - another backend that returns JSON success/failure responses
- [DONE] **Preserve the same user experience:** Keep the same form layout and success message styling, but only show success after a confirmed successful response.
- [DONE] **Add request timeout and retry-safe behavior:** Prevent indefinite pending states and avoid accidental duplicate submissions.

### 4. Security and Data Hygiene

- [DONE] **Add server-side validation:** Do not rely only on client-side checks for name, email, phone, and class year.
- [DONE] **Protect Google Sheets from formula injection:** Escape values starting with spreadsheet formula trigger characters such as `=`, `+`, `-`, and `@` before writing them to Sheets.
- [DONE] **Add spam protection:** Introduce either:
  - a honeypot field
  - reCAPTCHA or Turnstile
  - rate limiting at the backend layer
- [DONE] **Log failures more defensively:** Ensure backend failures are captured without exposing sensitive implementation details to end users.

### 5. Asset and Repository Cleanup

- [NOT DONE] **Remove or archive unused large assets from the production path:** The repository currently contains many very large iteration files that are not actively used by the website.
- [NOT DONE] **Keep only production-required assets in the main delivery path:** Move historical experiments and alternates into a separate archive folder or external storage.
- [DONE] **Document active production assets explicitly:** Maintain a short list of only the assets the live site depends on.

### 6. Codebase Maintainability

- [DONE] **Modularize `main.js`:** Split into small, clearly named functions such as:
  - `initCountdown()`
  - `initFooterYear()`
  - `initWaitlistForm()`
  - `initVideoEmbed()`
- [DONE] **Remove outdated comments/instructions:** The current inline setup notes and README references are partially stale and should be aligned with the live implementation.
- [DONE] **Keep documentation current:** Update `README.md` and this file whenever deployment flow, asset strategy, or form architecture changes.

### 7. Accessibility and UX Hardening

- [DONE] **Preserve visual design while improving semantics:** Keep the same look, but ensure accessible labeling, clearer loading states, and resilient error handling.
- [DONE] **Improve form feedback states:** Make validation and submission errors more explicit without redesigning the section.
- [DONE] **Respect reduced-motion preferences where applicable:** If any animations or auto-advancing behaviors remain, guard them with `prefers-reduced-motion`.

### 8. Deployment and Monitoring

- [DONE] **Add deployment configuration for static hosting:** Include explicit cache-control behavior and security headers using the hosting platform configuration.
- [NOT DONE] **Introduce repeatable performance audits:** Run Lighthouse or equivalent checks during release workflow to catch regressions.
- [NOT DONE] **Track production behavior:** Add lightweight analytics or monitoring for form failures and page performance if acceptable for the project.

### 9. Implementation Order Recommended by Codex

1. [DONE] Optimize the three active visual assets and ship responsive versions.
2. [DONE] Replace eager YouTube loading with click-to-load behavior.
3. [DONE] Fix countdown expiry logic and separate page initialization into isolated modules.
4. [DONE] Replace `no-cors` form submission with a verifiable backend response flow.
5. [DONE] Add backend validation, spam protection, and spreadsheet-safe sanitization.
6. [PARTIALLY DONE] Remove dead carousel code and archive unused assets.
7. [PARTIALLY DONE] Add cache headers, security headers, and repeatable performance checks.

### 10. Non-Negotiable Constraint

All improvements above must preserve the current approved design language. Changes should optimize delivery and system quality, not reinterpret the visual design.
