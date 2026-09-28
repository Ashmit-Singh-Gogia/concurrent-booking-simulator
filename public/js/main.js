import { spawnWorkers } from './core/worker-manager.js';
import { getSharedBuffer, setSeatState } from './core/shared-state.js';
import { seatIdToIndex } from './core/seat-model.js';

const logEl = document.getElementById("log");

function logLine(text) {
    const li = document.createElement("li");
    li.textContent = text;
    logEl.appendChild(li);
}



setSeatState(seatIdToIndex("A1"), 2);

const configs = [0, 1, 2].map((requestId) => ({
    requestId,
    seatIndex: seatIdToIndex("A1"),
    mode: "unsafe",
    sharedBuffer: getSharedBuffer(),
    runId: "test-run-1",
}));

spawnWorkers(configs, (event) => {
    logLine(`Request ${event.requestId} read seat ${event.seatIndex} as ${event.result}`);
});