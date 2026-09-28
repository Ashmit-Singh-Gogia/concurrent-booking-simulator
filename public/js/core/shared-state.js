import { SEAT_COUNT } from "./seat-model.js";

const BYTES_PER_SEAT = 4;
const buffer = new SharedArrayBuffer(SEAT_COUNT * BYTES_PER_SEAT);
const seat_view = new Int32Array(buffer)

export function getSharedBuffer() {
    return buffer;
}
export function getSeatState(index) {
    return seat_view[index];
}

export function setSeatState(index, newState) {
    seat_view[index] = newState;
}


// not working now
export function trySetSeatState(index, expectedState, newState) {
    throw new Error("trySetSeatState isn't implemented until Step 6");
}