import { spawnWorkers } from './core/worker-manager.js';
import { getSharedBuffer, setSeatState } from './core/shared-state.js';
import { seatIdToIndex, seatIndexToId } from "./core/seat-model.js";
import { SEAT_STATE, seatStateName } from "./core/constants.js";
import { initEventLog, logEvent } from "./core/event-log.js";

initEventLog(document.getElementById("log"));



setSeatState(seatIdToIndex("A1"), SEAT_STATE.BOOKED);

const configs = [0, 1, 2].map((requestId) => ({
    requestId,
    seatIndex: seatIdToIndex("A1"),
    mode: "unsafe",
    sharedBuffer: getSharedBuffer(),
    runId: "test-run-1",
}));

spawnWorkers(configs, (event) => {
    logEvent({
        requestId: event.requestId,
        seatId: seatIndexToId(event.seatIndex),
        action: event.action,
        result: seatStateName(event.result),
        timestamp: event.timestamp,
    });
});