// This file maps the index to Seat Name(A1 , e4 , etc)
// and also maps the other way around (0 to A1 and 1 to A2)

import { ROWS, COLS, ERRORS } from '../constants/constants.js';

export function indexToSeat(index) {
    if (index < 0 || index >= ROWS * COLS) {
        throw new Error(ERRORS.OUT_OF_BOUNDS);
    }
    const row = Math.floor(index / COLS);
    const col = (index % COLS) + 1;
    const rowChar = String.fromCharCode(65 + row); // 65 = 'A'
    return `${rowChar}${col}`;
}

export function seatToIndex(seat) {
    if (typeof seat !== 'string' || seat.length < 2) {
        throw new Error(ERRORS.OUT_OF_BOUNDS);
    }

    const rowChar = seat[0].toUpperCase();
    const row = rowChar.charCodeAt(0) - 65;
    const col = parseInt(seat.slice(1), 10);

    if (row < 0 || row >= ROWS || isNaN(col) || col < 1 || col > COLS) {
        throw new Error(ERRORS.OUT_OF_BOUNDS);
    }

    return row * COLS + (col - 1);
}
