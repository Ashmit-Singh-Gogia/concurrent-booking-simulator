var sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 100000); // 100000 primes
var ia = new Int32Array(sab);  // ia.length == 100000

const numOfWorkers = 4;

workers = []

for (let i = 0; i < numOfWorkers; i++) {
    const worker = new Worker("myWorker.js");

    worker.onmessage = (ev) => {
        console.log(ev.data)
    }

    worker.postMessage(ia);
}
