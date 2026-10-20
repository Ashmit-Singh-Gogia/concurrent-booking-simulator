// This file maps the index to Seat Name(A1 , e4 , etc)
// and also maps the other way around (0 to A1 and 1 to A2)

import { ROWS, COLS, ERRORS } from '../constants/constants.js';
import { isValidSeat, isValidSeatIndex } from '../common/validateSeat.js';

export function indexToSeat(index) {
    if (!isValidSeatIndex(index)) {
        throw new Error(ERRORS.INVALID_SEAT);
    }
    const row = Math.floor(index / COLS);
    const col = (index % COLS) + 1;
    const rowChar = String.fromCharCode(65 + row);
    return `${rowChar}${col}`;
}


export function seatToIndex(seat) {
    if (!isValidSeat(seat)) {
        throw new Error(ERRORS.INVALID_SEAT);
    }

    const rowChar = seat[0].toUpperCase();
    const row = rowChar.charCodeAt(0) - 65;
    const col = parseInt(seat.slice(1), 10);

    return row * COLS + (col - 1);
}
