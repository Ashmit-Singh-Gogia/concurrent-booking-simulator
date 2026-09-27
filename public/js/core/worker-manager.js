export function spawnWorkers(count, onEvent) {
    const workers = [];

    for (let workerId = 1; workerId <= count; workerId++) {
        const worker = new Worker("./js/workers/booking-worker.js", { type: "module" });
        worker.onmessage = (event) => {
            onEvent({ workerId, ...event.data });
        }
        worker.postMessage({ workerId });

        workers.push(worker);
    }
    return workers;
}

