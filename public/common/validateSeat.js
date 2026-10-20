import { ROWS, COLS } from '../constants/constants.js';

export function isValidSeat(seat) {
    if (typeof seat !== 'string' || seat.length < 2) return false;

    const rowChar = seat[0].toUpperCase();
    const row = rowChar.charCodeAt(0) - 65;
    const col = parseInt(seat.slice(1), 10);

    const isPureNumber = String(col) === seat.slice(1);

    const isRowValid = row >= 0 && row < ROWS;
    const isColValid = !isNaN(col) && isPureNumber && col >= 1 && col <= COLS;

    return isRowValid && isColValid;
}


export function isValidSeatIndex(index) {
    return Number.isInteger(index) && index >= 0 && index < ROWS * COLS;
}