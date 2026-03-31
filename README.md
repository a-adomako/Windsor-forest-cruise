# Windsor Forest Takeover Cruise — Landing Page

A single-page static website for gathering pre-cruise RSVPs.

## Handover Requirements & Instructions

This repository contains the full source code (HTML, CSS, JS) meant directly for web browsers. Since it does not use a framework like React or Node.js, there's no build step required. The files are organized as follows:

```
windsor-forest-cruise/
├── index.html              # The main single page
├── css/
│   └── styles.css          # Styling variables and rules
├── js/
│   └── main.js             # Countdown timer & form submission logic
├── apps-script/
│   └── code.gs             # Google Apps Script for the backend Google Sheet
└── assets/
    ├── collage-frame.png   # The hero visual element
    └── photos/             # Directory for carousel items (if added later)
```

### 1. How to deploy to Netlify/Vercel
**Netlify:**
1. Create a free account at [Netlify](https://www.netlify.com/).
2. On your team dashboard, go to "Sites" -> "Add new site" -> "Deploy manually".
3. Drag and drop the `windsor-forest-cruise` folder into the drag-and-drop zone.
4. Your site is live! Netlify will provide a `.netlify.app` URL.

**Vercel:**
1. Create a free account at [Vercel](https://vercel.com/).
2. Push this folder to a GitHub repository, then link the repository via the Vercel dashboard.
3. Vercel will automatically build (which is just serving static files) and deploy it.

### 2. How to connect a custom domain
In both Netlify and Vercel:
1. Go to your site's **Domain Management / Settings**.
2. Click **Add Custom Domain** and type your domain (e.g. `takovercruise.com`).
3. Follow their instructions to add either an `A record` or a `CNAME` record to your domain registrar (GoDaddy, Namecheap, Google Domains).
4. After DNS propagates (can take up to 24h depending on your registrar), the site will work perfectly under your custom domain. SSL/HTTPS is generated automatically!

### 3. Google Sheets Integration Setup (For Form RSVPs)
We implemented a form that does not require a database—it just sends the inputted data directly to a Google Sheet using Google Apps Script.

**Setup Instructions:**
1. Open up Google Sheets and create a new sheet with these headers representing your columns: `Timestamp | First Name | Last Name | Email | Phone | Graduating Class`.
2. In the menu, click **Extensions** -> **Apps Script**.
3. Clear out whatever code is there and paste the contents from `apps-script/code.gs`.
4. Click the "Save" icon.
5. In the top right, click **Deploy** -> **New deployment**.
6. Set the "Select type" gear icon to **Web app**.
   - **Execute as:** "Me"
   - **Who has access:** "Anyone"
7. Click "Deploy". Note: Google will ask you to review permissions. Give it permission to manage your sheet.
8. After authorizing, Google will give you a **Web app URL**. Copy this block of text.
9. Open `js/main.js` in your website folder, find `const APPS_SCRIPT_URL = '...'` (around line 25), and paste your newly generated link there! 
10. At this point, you'll need to uncomment the `fetch(APPS_SCRIPT_URL...)` block in the javascript in order for data to submit. It's safe to test now.

### 4. How to Change Event Content and Variables

**Video Link:**
If you want to swap the placeholder YouTube embed to the real one:
Open `index.html` and locate the `<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ...">` tag. Replace the `src` URL with your client's new YouTube embed code.

**Reunion Countdown Date:**
In `js/main.js`, near line 65 you'll find:
`const REUNION_DATE = new Date('2027-01-01T00:00:00-05:00').getTime();`
Change `2027-01-01` to the desired format (YYYY-MM-DD), ensuring `-05:00` stays (that keeps the timezone at Eastern Time / Savannah time).

**Adding/Removing Form Fields:**
If you require more fields:
1. Add a new `<input>` block inside `index.html`. Give it an `id` and a `name`.
2. In `app-script/code.gs`, add `data.yourNewFieldName` to the `.appendRow([])` array corresponding to its new column.
3. In `js/main.js`, add the mapping by duplicating a line in the `formData` object: `yourNewFieldName: document.getElementById('newFieldId').value.trim(),`

**Adding the Photo Carousel (Currently Hidden/Placeholder):**
Add `.jpg`/`.png` photos into `assets/photos/`. Map them in `index.html` within the `<div class="carousel-track">` items by giving each item an inline `style="background-image: url('assets/photos/pic.jpg')"`! If you add a ton of photos, you may want to research a CSS scroll-snap carousel approach, but this starts you off lightweight!
