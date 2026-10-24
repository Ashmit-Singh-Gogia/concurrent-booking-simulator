
// when main calls the worker
onmessage = (ev) => {
    // const workerInfo = ev.data
    const { seatView, targetSeatIndices, targetSeats, barrierView, workerId } = ev.data;

    // Signal ready to main thread
    postMessage({ status: 'READY', workerId });

    //I need to read the seat state


    Atomics.wait(barrierView, 0, 0);

    for (let i = 0; i < targetSeatIndices.length; i++) {
        const seatIdx = targetSeatIndices[i];
        const seatName = targetSeats[i];
        // simulated fake expensive work to see some difference in all sim ( This code is in all simulations so its not rigged)
        let sum = 0;
        for (let k = 0; k < 10000000; k++) sum += k;


        if (seatView[seatIdx] === 0) {
            seatView[seatIdx] = 1;  // race window: another worker can slip in here
            console.log(`Worker ${workerId}: Booked seat ${seatName} ✅`);
            postMessage({ status: 'BOOKED', workerId, seat: seatName });
        } else {
            console.log(`Worker ${workerId}: Seat ${seatName} already taken ❌`);
            postMessage({ status: 'ALREADY_BOOKED', workerId, seat: seatName });
        }
    }
    postMessage({ status: 'DONE', workerId });  // signal worker finished
}