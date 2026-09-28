import { SEAT_STATE } from "./constants.js";
import { waitForGroup } from "./barrier.js";

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

export async function attemptBooking(seatView, seatIndex, mode, report, sync) {
    if (mode == "unsafe") {
        return attemptUnsafe(seatView, seatIndex, report, sync);
    }
    throw new Error(`Booking mode ${mode} is not implemented yet`);
}

async function attemptUnsafe(seatView, seatIndex, report, sync) {
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
    return "Booked";
}
