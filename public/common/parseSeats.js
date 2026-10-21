import { seatToIndex } from "../seat_model/seat_model.js"

export function getArrayOfSeats(seatString) {
    if (!seatString || typeof seatString !== 'string') return [];
    return seatString
        .split(',')
        .map(s => s.trim().toUpperCase())
        .filter(s => s.length > 0);
}


export function getSeatIndices(seats) {
    const seatIndices = [];
    for (const seat of seats) {
        seatIndices.push(seatToIndex(seat));
    }
    return seatIndices;
}
