// api/_lib/phone.js — normaliza telefone BR pra E.164 (+55DDD9XXXXXXXX).
// Aceita formatos: "11999999999", "+5511999999999", "(11) 99999-9999", "11 9 9999-9999".

export function normalizeBRPhone(raw) {
    if (!raw || typeof raw !== 'string') return null;
    const digits = raw.replace(/\D/g, '');

    let national;
    if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
        national = digits.slice(2);
    } else if (digits.length === 10 || digits.length === 11) {
        national = digits;
    } else {
        return null;
    }

    if (national.length < 10 || national.length > 11) return null;

    // Mobile BR (11 dígitos) precisa ter '9' como terceiro dígito.
    if (national.length === 11 && national[2] !== '9') return null;

    const ddd = parseInt(national.slice(0, 2), 10);
    if (ddd < 11 || ddd > 99) return null;

    return `+55${national}`;
}
