import { spawnWorkers } from './core/worker-manager.js';
const logEl = document.getElementById("log");

function logLine(text) {
    const li = document.createElement("li");
    li.textContent = text;
    logEl.appendChild(li);
}

spawnWorkers(5, (event) => {
    logLine(`Worker ${event.workerId} ${event.action} at ${event.timeStamp.toFixed(1)}ms`);
});