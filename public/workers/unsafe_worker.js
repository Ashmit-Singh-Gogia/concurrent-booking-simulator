
// when main calls the worker
onmessage = (ev) => {
    const workerInfo = ev.data

    //I need to read the seat state
    const seatView = workerInfo.seatView, targetSeat = workerInfo.targetSeat, seat = workerInfo.seat;

    if (seatView[targetSeat] == 0) {
        console.log(`Worker Id: ${workerInfo.workerId} and targetSeat : ${seat} is AVAILABLE❤️`);
        postMessage({
            status: "READY",
            seat: seat,
            workerId: workerInfo.workerId,
        });
    } else {
        console.log(`Worker Id: ${workerInfo.workerId} and targetSeat : ${seat} is NOT AVAILABLE❌✋`);
        postMessage({
            status: "FAILED",
            reason: 'ALREADY_BOOKED',
            seat: seat,
            workerId: workerInfo.workerId,
        });
        return;
    }

    Atomics.wait(workerInfo.barrierView, 0, 0);
    seatView[targetSeat] = 1;
    console.log(`Worker Id: ${workerInfo.workerId} and targetSeat : ${seat} is BOOKED ✅`);
    postMessage({
        status: "BOOKED",
        seat: seat,
        workerId: workerInfo.workerId,
    });
}