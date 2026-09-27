const SLOT_COUNT = 1;
const BYTES_PER_SLOT = 4;

const sharedBuffer = new SharedArrayBuffer(SLOT_COUNT * BYTES_PER_SLOT);
const sharedView = new Int32Array(sharedBuffer);


console.log("Shared buffer created. Initial value at slot 0: ", sharedView[0]);

const worker = new Worker("./js/workers/booking-worker.js", { type: "module" });
worker.postMessage({ buffer: sharedBuffer })

const statusEl = document.getElementById("status");

worker.onmessage = (event) => {
    if (event.data == "done") {
        const sharedView = new Int32Array(sharedBuffer);
        statusEl.textContent = "Value read from sharedMemory: " + sharedView[0];
    }
};