/**
 * Format a numeric amount or string to Indonesian Rupiah (Rp).
 */
export function formatRp(num: number | string): string {
    const value = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(value)) return 'Rp 0';

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Format date string (YYYY-MM-DD or ISO) into human-readable Indonesian format.
 * Examples: "Hari ini", "Kemarin", "18 Sep 2026", "18 September 2026"
 */
export function formatDateHuman(
    dateStr: string,
    fullMonth: boolean = false,
): string {
    if (!dateStr) return '-';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    if (isSameDay(date, today)) {
        return 'Hari ini';
    }

    if (isSameDay(date, yesterday)) {
        return 'Kemarin';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: fullMonth ? 'long' : 'short',
        year: 'numeric',
    }).format(date);
}

/**
 * Format date with day name: "Jumat, 18 Sep 2026"
 */
export function formatDateWithDay(dateStr: string): string {
    if (!dateStr) return '-';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}
