let container = null;
let baseline = 0;
const events = [];

export function initEventLog(element) {
    container = element;
    clearEventLog();
}

export function clearEventLog() {
    events.length = 0;
    if (container) {
        container.innerHTML = "";
    }
    baseline = performance.timeOrigin + performance.now();
}

export function logEvent(event) {
    events.push(event);
    if (!container) return;

    const li = document.createElement("li");
    const t = (event.timestamp - baseline).toFixed(2);
    li.textContent = event.message
        ? `[+${t}ms] ${event.message}`
        : `[+${t}ms] Request ${event.requestId} | Seat ${event.seatId} | ${event.action} -> ${event.result}`;
    container.appendChild(li);
}

export function getEvents() {
    return [...events];
}