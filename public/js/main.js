import { spawnWorkers } from './core/worker-manager.js';
import { getSharedBuffer } from './core/shared-state.js';
import { seatIdToIndex, seatIndexToId } from "./core/seat-model.js";
import { seatStateName } from "./core/constants.js";
import { initEventLog, logEvent } from "./core/event-log.js";

initEventLog(document.getElementById("log"));


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
        result: typeof event.result === "number" ? seatStateName(event.result) : event.result,
        timestamp: event.timestamp,
    });
});