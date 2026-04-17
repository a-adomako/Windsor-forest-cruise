const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL
    || 'https://script.google.com/macros/s/AKfycbwbP7ViDQXmqLOK8z234p3eJEyx1XaK_VRQaforZM0hNf3qfwoH5wrvhxyo8j68DfgE/exec';

const FORMULA_PREFIX = /^[=+\-@]/;

exports.handler = async (event) => {
    const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8' };

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { ...jsonHeaders, Allow: 'POST' },
            body: JSON.stringify({ success: false, message: 'Method not allowed.' }),
        };
    }

    const payload = safeParse(event.body);
    if (!payload) {
        return {
            statusCode: 400,
            headers: jsonHeaders,
            body: JSON.stringify({ success: false, message: 'Invalid request body.' }),
        };
    }

    if ((payload.company || '').trim()) {
        return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify({ success: true }) };
    }

    const cleaned = normalizePayload(payload);
    const validationError = validatePayload(cleaned);
    if (validationError) {
        return {
            statusCode: 400,
            headers: jsonHeaders,
            body: JSON.stringify({ success: false, message: validationError }),
        };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleaned),
            signal: controller.signal,
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
            return { statusCode: 502, headers: jsonHeaders, body: JSON.stringify({ success: false, message }) };
        }

        return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify({ success: true }) };
    } catch (error) {
        console.error('Waitlist proxy error', error);
        const message = error.name === 'AbortError'
            ? 'The waitlist service timed out.'
            : `Proxy error: ${error.message || 'unknown'}`;
        return { statusCode: 502, headers: jsonHeaders, body: JSON.stringify({ success: false, message }) };
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
