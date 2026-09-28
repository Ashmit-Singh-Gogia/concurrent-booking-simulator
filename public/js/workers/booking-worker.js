import { attemptBooking } from "../core/booking-engine.js";

self.onmessage = async (event) => {
    const { seatIndex, sharedBuffer, mode } = event.data;
    const seatView = new Int32Array(sharedBuffer);

    const report = (action, result) => {

        self.postMessage({
            action,
            result,
            timestamp: performance.timeOrigin + performance.now(),
        });
    };

    const outcome = await attemptBooking(seatView, seatIndex, mode, report);
    report("outcome", outcome);
};