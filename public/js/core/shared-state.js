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



export function trySetSeatState(seatView, index, expectedState, newState) {
    const previous = Atomics.compareExchange(seatView, index, expectedState, newState);
    return previous === expectedState;    // expected state is 0 
}