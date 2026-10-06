export const ROWS = ['A', 'B', 'C', 'D', 'E'];
export const SEATS_PER_ROW = 10;

// in order: ["A1", "A2", ..., "A10", "B1", ..., "E10"]
const seatIds = [];
for (let r = 0; r < ROWS.length; r++) {
    for (let s = 1; s <= SEATS_PER_ROW; s++) {
        seatIds.push(ROWS[r] + s);   // "A" + 1 → "A1"
    }
}

export const SEAT_IDS = seatIds;

const idToIndex = new Map(SEAT_IDS.map((id, index) => [id, index]));

export function seatIdToIndex(seatId) {
    return idToIndex.get(seatId);
}

export function seatIndexToId(index) {
    return SEAT_IDS[index];
}

export const SEAT_COUNT = SEAT_IDS.length;