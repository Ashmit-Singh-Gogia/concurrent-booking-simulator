import { attemptBooking } from "../core/booking-engine.js";

self.onmessage = async (event) => {
    const { seatIndex, sharedBuffer, mode, barrierBuffer, expectedCount } = event.data;
    const seatView = new Int32Array(sharedBuffer);

    const report = (action, result) => {

        self.postMessage({
            action,
            result,
            timestamp: performance.timeOrigin + performance.now(),
        });
    };

    const sync = barrierBuffer
        ? { barrierView: new Int32Array(barrierBuffer), barrierIndex: 0, expectedCount }
        : undefined;
    const outcome = await attemptBooking(seatView, seatIndex, mode, report, sync);
    report("outcome", outcome);
};