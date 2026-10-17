/** Alleen een pad binnen deze app, nooit een ander adres (tegen misbruik van de doorverwijzing). */
export const safeNext = (v: string | null) => (v && /^\/[A-Za-z0-9\-_/]*$/.test(v) && !v.startsWith('//') ? v : '/beheer');
