import { SEAT_STATE } from "./constants.js";
import { waitForGroup } from "./barrier.js";
import { trySetSeatState } from "./shared-state.js";


const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

export function attemptBooking(seatView, seatIndex, mode, report, sync) {
    if (mode == "unsafe") {
        return attemptUnsafe(seatView, seatIndex, report, sync);
    }
    if (mode === "fixed") return attemptFixed(seatView, seatIndex, report, sync);
    throw new Error(`Booking mode ${mode} is not implemented yet`);
}

function attemptUnsafe(seatView, seatIndex, report, sync) {
    // Read
    const observedValue = seatView[seatIndex];
    report("read", observedValue);

    // Check if available
    if (observedValue !== SEAT_STATE.AVAILABLE) {
        return "REJECTED";
    }

    // forcefully causing race condition 
    // by making threads wait for the final thread
    //  to read the seat state so it guarantees race condition
    waitForGroup(sync.barrierView, sync.barrierIndex, sync.expectedCount);

    // Write
    seatView[seatIndex] = SEAT_STATE.BOOKED;
    report("write", SEAT_STATE.BOOKED);
    return "BOOKED";
}


function attemptFixed(seatView, seatIndex, report, sync) {
    const observed = seatView[seatIndex];
    report("read", observed);

    if (observed !== SEAT_STATE.AVAILABLE) return "REJECTED";

    waitForGroup(sync.barrierView, sync.barrierIndex, sync.expectedCount);

    const won = trySetSeatState(seatView, seatIndex, SEAT_STATE.AVAILABLE, SEAT_STATE.BOOKED);

    if (won) {
        report("write", SEAT_STATE.BOOKED);
        return "BOOKED";
    }

    report("write", "lost-race");
    return "REJECTED";
}