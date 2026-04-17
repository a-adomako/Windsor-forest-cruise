const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL
    || 'https://script.google.com/macros/s/AKfycbwbP7ViDQXmqLOK8z234p3eJEyx1XaK_VRQaforZM0hNf3qfwoH5wrvhxyo8j68DfgE/exec';

const FORMULA_PREFIX = /^[=+\-@]/;

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ success: false, message: 'Method not allowed.' });
    }

    const payload = typeof req.body === 'string' ? safeParse(req.body) : req.body;

    if (!payload) {
        return res.status(400).json({ success: false, message: 'Invalid request body.' });
    }

    if ((payload.company || '').trim()) {
        return res.status(200).json({ success: true });
    }

    const cleaned = normalizePayload(payload);
    const validationError = validatePayload(cleaned);
    if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
    }

    const upstreamController = new AbortController();
    const timeoutId = setTimeout(() => upstreamController.abort(), 12000);

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cleaned),
            signal: upstreamController.signal,
        });

        const text = await response.text();
        const result = safeParse(text);

        if (!response.ok || !result || result.result !== 'success') {
            console.error('Waitlist upstream error', {
                status: response.status,
                rawBody: text.slice(0, 500),
                parsed: result,
            });
            const message = result && result.message
                ? result.message
                : `Upstream error (status ${response.status}).`;
            return res.status(502).json({ success: false, message });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Waitlist proxy error', error);
        const message = error.name === 'AbortError'
            ? 'The waitlist service timed out.'
            : `Proxy error: ${error.message || 'unknown'}`;
        return res.status(502).json({ success: false, message });
    } finally {
        clearTimeout(timeoutId);
    }
};

function safeParse(value) {
    try {
        return JSON.parse(value);
    } catch (error) {
        return null;
    }
}

function normalizePayload(payload) {
    return {
        firstName: sanitizeCell(payload.firstName),
        lastName: sanitizeCell(payload.lastName),
        email: sanitizeCell(payload.email).toLowerCase(),
        phone: sanitizeCell(payload.phone),
        graduatingClass: sanitizeCell(payload.graduatingClass),
    };
}

function sanitizeCell(value) {
    const text = String(value || '').trim();
    return FORMULA_PREFIX.test(text) ? `'${text}` : text;
}

function validatePayload(payload) {
    if (!payload.firstName || !payload.lastName) {
        return 'Please enter your first and last name.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        return 'Please enter a valid email address.';
    }

    if (payload.phone.replace(/\D/g, '').length < 10) {
        return 'Please enter a valid phone number.';
    }

    if (!payload.graduatingClass) {
        return 'Please select your graduating class.';
    }

    return '';
}
