export function spawnWorkers(configs, onEvent) {
    const workers = [];

    configs.forEach((config) => {
        const worker = new Worker('./js/workers/booking-worker.js');

        worker.onmessage = (event) => {
            onEvent({ ...config, ...event.data });
        };

        worker.postMessage(config);
        workers.push(worker);
    });
    return workers;
}
