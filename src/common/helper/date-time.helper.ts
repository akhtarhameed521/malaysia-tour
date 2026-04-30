export const formatDate = (dateInput: any): string | null => {
    if (dateInput === undefined || dateInput === null) return null;

    if (dateInput instanceof Date) {
        return dateInput.toISOString().split('T')[0];
    }

    const num = Number(dateInput);
    if (!isNaN(num) && num > 1) {
        const date = new Date(Math.round((num - 25569) * 86400 * 1000));
        return date.toISOString().split('T')[0];
    }

    const s = String(dateInput).trim();
    if (!s || s.toLowerCase() === 'nan') return null;

    const cleaned = s.replace(/(\d+)(st|nd|rd|th)/i, '$1');
    const parsed = new Date(`${cleaned} 2025`);
    if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
    }

    return null;
};

export const formatTime = (timeInput: any): string | null => {
    if (timeInput === undefined || timeInput === null) return null;

    if (timeInput instanceof Date) {
        const h = timeInput.getHours().toString().padStart(2, '0');
        const m = timeInput.getMinutes().toString().padStart(2, '0');
        const s = timeInput.getSeconds().toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    const num = Number(timeInput);
    if (!isNaN(num) && num >= 0 && num < 1) {
        const totalSeconds = Math.round(num * 86400);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    let str = String(timeInput).trim().toLowerCase();
    if (!str || str === 'nan') return null;

    const ampmMatch = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)$/);
    if (ampmMatch) {
        let h = parseInt(ampmMatch[1]);
        const m = ampmMatch[2].padStart(2, '0');
        const s = (ampmMatch[3] || '00').padStart(2, '0');
        const ampm = ampmMatch[4];

        if (ampm === 'pm' && h < 12) h += 12;
        else if (ampm === 'am' && h === 12) h = 0;

        return `${h.toString().padStart(2, '0')}:${m}:${s}`;
    }

    const ampmSimpleMatch = str.match(/^(\d{1,2})\s*(am|pm)$/);
    if (ampmSimpleMatch) {
        let h = parseInt(ampmSimpleMatch[1]);
        const ampm = ampmSimpleMatch[2];

        if (ampm === 'pm' && h < 12) h += 12;
        else if (ampm === 'am' && h === 12) h = 0;

        return `${h.toString().padStart(2, '0')}:00:00`;
    }

    const militaryAmPm = str.match(/^(\d{2})(\d{2})\s*(am|pm)?$/);
    if (militaryAmPm) {
        let h = parseInt(militaryAmPm[1]);
        const m = militaryAmPm[2].padStart(2, '0');
        const ampm = militaryAmPm[3];

        if (ampm === 'pm' && h < 12) h += 12;
        else if (ampm === 'am' && h === 12) h = 0;

        return `${h.toString().padStart(2, '0')}:${m}:00`;
    }

    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
        const parts = str.split(':');
        const h = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const s = (parts[2] || '00').padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    return null;
};
