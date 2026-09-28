import { SEAT_STATE } from "./constants.js";

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

export async function attemptBooking(seatView, seatIndex, mode, report) {
    if (mode == "unsafe") {
        return attemptUnsafe(seatView, seatIndex, report);
    }
    throw new Error(`Booking mode ${mode} is not implemented yet`);
}

async function attemptUnsafe(seatView, seatIndex, report) {
    // Read
    const observedValue = seatView[seatIndex];
    report("read", observedValue);

    // Check if available
    if (observedValue !== SEAT_STATE.AVAILABLE) {
        return "REJECTED";
    }

    // Simulated Time Gap in between Check and Write
    await sleep(50 + Math.random() * 100);

    // Write
    seatView[seatIndex] = SEAT_STATE.BOOKED;
    report("write", SEAT_STATE.BOOKED);
    return "Booked";
}
