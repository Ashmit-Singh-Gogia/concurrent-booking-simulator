export function waitForGroup(barrierView, index, expectedCount) {
    const arrivalNumber = Atomics.add(barrierView, index, 1) + 1;

    if (arrivalNumber === expectedCount) {
        // only the last thread comes in and wakes other threads
        Atomics.notify(barrierView, index, expectedCount - 1);
        return;
    }

    while (Atomics.load(barrierView, index) < expectedCount) {
        Atomics.wait(barrierView, index, Atomics.load(barrierView, index));
    }
}