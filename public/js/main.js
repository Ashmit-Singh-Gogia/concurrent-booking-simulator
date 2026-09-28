import { spawnWorkers } from './core/worker-manager.js';
import { getSharedBuffer } from './core/shared-state.js';
import { seatIdToIndex, seatIndexToId } from "./core/seat-model.js";
import { seatStateName } from "./core/constants.js";
import { initEventLog, logEvent } from "./core/event-log.js";

initEventLog(document.getElementById("log"));

const REQUEST_COUNT = 5;
const barrierBuffer = new SharedArrayBuffer(4);

const configs = Array.from({ length: REQUEST_COUNT }, (_, requestId) => ({
    requestId,
    seatIndex: seatIdToIndex("A1"),
    mode: "unsafe",
    sharedBuffer: getSharedBuffer(),
    barrierBuffer,
    expectedCount: REQUEST_COUNT,
    runId: "barrier-test",
}));

spawnWorkers(configs, (event) => {
    logEvent({
        requestId: event.requestId,
        seatId: seatIndexToId(event.seatIndex),
        action: event.action,
        result: typeof event.result === "number" ? seatStateName(event.result) : event.result,
        timestamp: event.timestamp,
    });
});