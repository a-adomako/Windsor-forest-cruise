/* ============================================================
   WINDSOR FOREST TAKEOVER CRUISE — main.js
   Handles: video embed, class dropdown, countdown, form submit
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const config = {
        apiEndpoint: '/api/waitlist',
        sailDate: '2026-06-19T00:00:00-05:00',
        videoId: 'y0_nhqUXLYU',
        classRange: {
            start: 2026,
            end: 1967,
        },
    };

    initVideoEmbed(config.videoId);
    initGraduatingClassDropdown(config.classRange);
    initFooterYear();
    initCountdown(config.sailDate);
    initWaitlistForm(config.apiEndpoint);
});

function initGraduatingClassDropdown(range) {
    const select = document.getElementById('graduatingClass');
    if (!select) return;

    const fragment = document.createDocumentFragment();

    for (let year = range.start; year >= range.end; year -= 1) {
        const option = document.createElement('option');
        option.value = String(year);
        option.textContent = `Class of ${year}`;
        fragment.appendChild(option);
    }

    const other = document.createElement('option');
    other.value = 'Other/Staff/Friend';
    other.textContent = 'Other / Staff / Friend';
    fragment.appendChild(other);

    select.appendChild(fragment);
}

function initFooterYear() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }
}

function initCountdown(sailDateValue) {
    const targetTime = new Date(sailDateValue).getTime();
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const container = document.getElementById('countdown-container');

    if (!container || !Number.isFinite(targetTime)) return;

    let timerId = null;

    const pad = (value) => String(value).padStart(2, '0');

    const renderExpiredState = () => {
        container.innerHTML = '<p class="countdown-expired">IT\'S TIME.<br>LET\'S SAIL. &#9875;</p>';
    };

    const updateCountdown = () => {
        const diff = targetTime - Date.now();

        if (diff <= 0) {
            if (timerId !== null) {
                clearInterval(timerId);
            }
            renderExpiredState();
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (daysEl) daysEl.textContent = pad(days);
        if (hoursEl) hoursEl.textContent = pad(hours);
        if (minutesEl) minutesEl.textContent = pad(minutes);
        if (secondsEl) secondsEl.textContent = pad(seconds);
    };

    updateCountdown();
    if (targetTime > Date.now()) {
        timerId = window.setInterval(updateCountdown, 1000);
    }
}

function initVideoEmbed(defaultVideoId) {
    const videoBox = document.querySelector('.video-box');
    const placeholder = document.getElementById('video-placeholder');
    if (!videoBox || !placeholder) return;

    const videoId = videoBox.dataset.videoId || defaultVideoId;
    if (!videoId) return;

    const mountEmbed = () => {
        if (videoBox.querySelector('iframe')) return;

        const iframe = document.createElement('iframe');
        iframe.className = 'video-embed';
        iframe.title = 'Windsor Forest Takeover Cruise';
        iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
        iframe.loading = 'eager';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.allowFullscreen = true;

        placeholder.remove();
        videoBox.appendChild(iframe);
    };

    placeholder.addEventListener('click', mountEmbed, { once: true });
}

function initWaitlistForm(apiEndpoint) {
    const form = document.getElementById('rsvp-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const btnSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;
    const formError = document.getElementById('form-error');
    const formWrap = document.getElementById('form-container');
    const successMsg = document.getElementById('success-message');

    if (!form || !submitBtn || !formError || !formWrap || !successMsg) return;

    const controllerTimeoutMs = 12000;

    const showError = (message) => {
        formError.textContent = message;
        formError.hidden = false;
    };

    const clearError = () => {
        formError.textContent = '';
        formError.hidden = true;
    };

    const setLoading = (loading) => {
        submitBtn.disabled = loading;
        submitBtn.setAttribute('aria-busy', loading ? 'true' : 'false');
        if (btnText) btnText.hidden = loading;
        if (btnSpinner) {
            btnSpinner.hidden = !loading;
            btnSpinner.style.display = loading ? 'inline-block' : 'none';
        }
    };

    const validatePhone = (value) => value.replace(/\D/g, '').length >= 10;
    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearError();

        const payload = {
            firstName: document.getElementById('firstName')?.value.trim() || '',
            lastName: document.getElementById('lastName')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            phone: document.getElementById('phone')?.value.trim() || '',
            graduatingClass: document.getElementById('graduatingClass')?.value || '',
            company: document.getElementById('company')?.value.trim() || '',
        };

        if (!payload.firstName || !payload.lastName) {
            showError('Please enter your first and last name.');
            return;
        }

        if (!validateEmail(payload.email)) {
            showError('Please enter a valid email address.');
            return;
        }

        if (!validatePhone(payload.phone)) {
            showError('Please enter a valid phone number (10+ digits).');
            return;
        }

        if (!payload.graduatingClass) {
            showError('Please select your graduating class.');
            return;
        }

        setLoading(true);

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), controllerTimeoutMs);

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Unable to submit your information right now.');
            }

            form.reset();
            formWrap.hidden = true;
            successMsg.hidden = false;
        } catch (error) {
            const message = error.name === 'AbortError'
                ? 'The request took too long. Please try again.'
                : error.message || 'Something went wrong. Please try again or contact us directly.';
            showError(message);
        } finally {
            window.clearTimeout(timeoutId);
            setLoading(false);
        }
    });
}
