/* ============================================================
   WINDSOR FOREST TAKEOVER CRUISE — main.js
   Handles: dropdown, countdown, carousel, form submission
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ────────────────────────────────────────────────────────
       1. GRADUATING CLASS DROPDOWN
       Reverse-chronological from 2026 → 1967, then "Other".
    ──────────────────────────────────────────────────────── */
    (function populateClassDropdown() {
        const select = document.getElementById('graduatingClass');
        if (!select) return;

        for (let year = 2026; year >= 1967; year--) {
            const opt = document.createElement('option');
            opt.value = year;
            opt.textContent = `Class of ${year}`;
            select.appendChild(opt);
        }

        const other = document.createElement('option');
        other.value = 'Other/Staff/Friend';
        other.textContent = 'Other / Staff / Friend';
        select.appendChild(other);
    })();

    /* ────────────────────────────────────────────────────────
       2. FOOTER YEAR
    ──────────────────────────────────────────────────────── */
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ────────────────────────────────────────────────────────
       3. COUNTDOWN TIMER
       Change SAIL_DATE to the real event date when confirmed.
       Format: 'YYYY-MM-DDTHH:MM:SS-05:00' (Eastern Time)
    ──────────────────────────────────────────────────────── */
    const SAIL_DATE = new Date('2026-06-19T00:00:00-05:00').getTime();

    const daysEl    = document.getElementById('days');
    const hoursEl   = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const cdWrap    = document.getElementById('countdown-container');

    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function updateCountdown() {
        const diff = SAIL_DATE - Date.now();

        if (diff <= 0) {
            clearInterval(timerInterval);
            if (cdWrap) {
                cdWrap.innerHTML =
                    '<p class="countdown-expired">IT\'S TIME.<br>LET\'S SAIL. &#9875;</p>';
            }
            return;
        }

        const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (daysEl)    daysEl.textContent    = pad(days);
        if (hoursEl)   hoursEl.textContent   = pad(hours);
        if (minutesEl) minutesEl.textContent = pad(minutes);
        if (secondsEl) secondsEl.textContent = pad(seconds);
    }

    updateCountdown(); // run immediately to avoid 1-second flash
    const timerInterval = setInterval(updateCountdown, 1000);

    /* ────────────────────────────────────────────────────────
       4. PHOTO CAROUSEL
       Uses CSS scroll-snap. Buttons scroll by one item width.
       Auto-scrolls every 3s; pauses on hover.
    ──────────────────────────────────────────────────────── */
    (function initCarousel() {
        const viewport = document.querySelector('.carousel-viewport');
        const prevBtn  = document.querySelector('.carousel-prev');
        const nextBtn  = document.querySelector('.carousel-next');
        if (!viewport) return;

        const SCROLL_AMOUNT = 150; // px per button click — approx one item

        function scrollBy(amount) {
            viewport.scrollBy({ left: amount, behavior: 'smooth' });
        }

        if (prevBtn) prevBtn.addEventListener('click', () => scrollBy(-SCROLL_AMOUNT));
        if (nextBtn) nextBtn.addEventListener('click', () => scrollBy(SCROLL_AMOUNT));

        // Auto-scroll
        let autoId = setInterval(() => scrollBy(SCROLL_AMOUNT), 3200);

        // Wrap around: if at end, jump to start
        viewport.addEventListener('scrollend', () => {
            const atEnd = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 8;
            if (atEnd) {
                viewport.scrollTo({ left: 0, behavior: 'instant' });
            }
        });

        // Pause on hover / touch
        viewport.addEventListener('mouseenter', () => clearInterval(autoId));
        viewport.addEventListener('touchstart', () => clearInterval(autoId), { passive: true });
        viewport.addEventListener('mouseleave', () => {
            autoId = setInterval(() => scrollBy(SCROLL_AMOUNT), 3200);
        });
    })();

    /* ────────────────────────────────────────────────────────
       5. FORM VALIDATION & SUBMISSION
       ─────────────────────────────────────────────────────
       SETUP CHECKLIST:
         1. Deploy apps-script/code.gs as a Google Apps Script Web App.
            (Extensions → Apps Script → Deploy → New Deployment → Web App
             → Execute as: Me, Who has access: Anyone)
         2. Copy the generated web app URL and paste it into APPS_SCRIPT_URL below.
         3. Uncomment the fetch() block (find "UNCOMMENT FETCH").

       reCAPTCHA (optional):
         4. Uncomment the <script> tag in index.html and add your site key.
         5. Uncomment the grecaptcha.execute() lines below.
    ──────────────────────────────────────────────────────── */

    // ↓ PASTE YOUR DEPLOYED APPS SCRIPT URL HERE ↓
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

    const form        = document.getElementById('rsvp-form');
    const submitBtn   = document.getElementById('submit-btn');
    const btnText     = submitBtn && submitBtn.querySelector('.btn-text');
    const btnSpinner  = submitBtn && submitBtn.querySelector('.btn-spinner');
    const formError   = document.getElementById('form-error');
    const formWrap    = document.getElementById('form-container');
    const successMsg  = document.getElementById('success-message');

    function showError(msg) {
        if (!formError) return;
        formError.textContent = msg;
        formError.hidden = false;
    }

    function clearError() {
        if (!formError) return;
        formError.textContent = '';
        formError.hidden = true;
    }

    function setLoading(loading) {
        submitBtn.disabled = loading;
        if (btnText)    btnText.hidden    = loading;
        if (btnSpinner) btnSpinner.hidden = !loading;
    }

    function validatePhone(value) {
        // Allow digits, spaces, dashes, parens, +
        const digits = value.replace(/\D/g, '');
        return digits.length >= 10;
    }

    function validateEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearError();

            const firstName      = document.getElementById('firstName').value.trim();
            const lastName       = document.getElementById('lastName').value.trim();
            const email          = document.getElementById('email').value.trim();
            const phone          = document.getElementById('phone').value.trim();
            const graduatingClass = document.getElementById('graduatingClass').value;

            // ── Client-side validation ──
            if (!firstName || !lastName) {
                showError('Please enter your first and last name.');
                return;
            }
            if (!validateEmail(email)) {
                showError('Please enter a valid email address.');
                return;
            }
            if (!validatePhone(phone)) {
                showError('Please enter a valid phone number (10+ digits).');
                return;
            }
            if (!graduatingClass) {
                showError('Please select your graduating class.');
                return;
            }

            setLoading(true);

            const payload = { firstName, lastName, email, phone, graduatingClass };

            try {
                /* ── UNCOMMENT FETCH when you have a real APPS_SCRIPT_URL ──
                   Note: mode 'no-cors' is required for Google Apps Script.
                   The response body will be opaque (unreadable) with no-cors,
                   so we treat any completion as success. If you need to read
                   the response, deploy the script with CORS headers instead.

                const response = await fetch(APPS_SCRIPT_URL, {
                    method:  'POST',
                    mode:    'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(payload),
                });
                */

                /* ── DEMO MODE: simulated delay (remove when fetch is active) ── */
                await new Promise(resolve => setTimeout(resolve, 1200));
                /* ── END DEMO MODE ── */

                // Optional reCAPTCHA v3 token (uncomment if using reCAPTCHA):
                // payload.recaptchaToken = await grecaptcha.execute('YOUR_RECAPTCHA_SITE_KEY', { action: 'submit' });

                // ── Show success state ──
                if (formWrap)   formWrap.hidden = true;
                if (successMsg) successMsg.hidden = false;

            } catch (err) {
                console.error('Form submission error:', err);
                showError('Something went wrong. Please try again or contact us directly.');
            } finally {
                setLoading(false);
            }
        });
    }

});
