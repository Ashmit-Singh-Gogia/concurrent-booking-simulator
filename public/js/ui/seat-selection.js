const MAX_SELECTABLE = 5;
const selected = new Set();

export function toggleSeatSelection(seatId) {
    if (selected.has(seatId)) {
        selected.delete(seatId);
        return { changed: true };
    }
    if (selected.size >= MAX_SELECTABLE) {
        return { changed: false, reason: `You can select at most ${MAX_SELECTABLE} seats at a time` };
    }
    selected.add(seatId);
    return { changed: true };
}

export function getSelectedSeats() {
    return [...selected];
}

export function clearSelection() {
    selected.clear();
}
