
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

        if (seatView[seatIdx] === 0) {
            console.log("Putting Some write delay with logs ");
            console.log("Putting Some write delay with logs ");
            console.log("Putting Some write delay with logs ");
            console.log("Putting Some write delay with logs ");
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