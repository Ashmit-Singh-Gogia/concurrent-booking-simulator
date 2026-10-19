import { ROWS, COLS } from '../constants/constants.js';

const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * ROWS * COLS)
const seatView = new Int32Array(sab);

export function getSeatView() {
    return seatView;
}