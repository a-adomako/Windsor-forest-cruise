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
│   └── main.js             # Video, countdown, and form logic
├── api/
│   └── waitlist.js         # Vercel serverless proxy for verified form submissions
├── apps-script/
│   └── code.gs             # Google Apps Script receiver for the backend Google Sheet
└── assets/
    └── photos/             # Production images + optimized web variants
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
The site now submits to a local Vercel serverless endpoint at `/api/waitlist`, and that function forwards validated data to Google Apps Script. This keeps the frontend on same-origin requests and allows the UI to confirm success or failure properly.

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
8. After authorizing, Google will give you a **Web app URL**. Copy it.
9. In Vercel, add an environment variable named `GOOGLE_APPS_SCRIPT_URL` and set it to that web app URL.
10. Redeploy the site. The frontend should continue posting to `/api/waitlist`; no frontend code changes are needed.

### 4. How to Change Event Content and Variables

**Video Link:**
If you want to swap the YouTube video:
Open `index.html` and update the `data-video-id` value on `.video-box`, then update the poster thumbnail URL if needed.

**Reunion Countdown Date:**
In `js/main.js`, update `config.sailDate` near the top of the file.
Keep the timezone offset in the ISO string so the countdown stays aligned with Eastern Time / Savannah time.

**Adding/Removing Form Fields:**
If you require more fields:
1. Add a new `<input>` block inside `index.html`. Give it an `id` and a `name`.
2. In `api/waitlist.js`, add validation/sanitization for the new field.
3. In `apps-script/code.gs`, add the sanitized value to the `.appendRow([])` array corresponding to its new column.
4. In `js/main.js`, add the mapping to the `payload` object in `initWaitlistForm()`.
