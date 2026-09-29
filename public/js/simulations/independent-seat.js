import { spawnWorkers } from "../core/worker-manager.js";
import { getSharedBuffer } from "../core/shared-state.js";
import { seatIdToIndex, seatIndexToId } from "../core/seat-model.js";
import { seatStateName } from "../core/constants.js";
import { logEvent } from "../core/event-log.js";
import { validateConfig } from "./validate-config.js";

export function runIndependentSeatSimulation({ requestCount, selectedSeatIds }, onComplete) {
    const errors = validateConfig({ requestCount, selectedSeatIds });
    if (errors.length > 0) { onComplete({ errors }); return; }

    const outcomes = [];
    let finishedCount = 0;

    const configs = Array.from({ length: requestCount }, (_, requestId) => {
        const seatId = selectedSeatIds[requestId % selectedSeatIds.length];
        return {
            requestId,
            seatIndex: seatIdToIndex(seatId),
            mode: "fixed",
            sharedBuffer: getSharedBuffer(),
            runId: "independent-run",
        };
    });

    spawnWorkers(configs, (event) => {
        logEvent({
            requestId: event.requestId,
            seatId: seatIndexToId(event.seatIndex),
            action: event.action,
            result: typeof event.result === "number" ? seatStateName(event.result) : event.result,
            timestamp: event.timestamp,
        });

        if (event.action === "outcome") {
            outcomes.push({ seatId: seatIndexToId(event.seatIndex), outcome: event.result });
            finishedCount++;
            if (finishedCount === requestCount) {
                onComplete({ metrics: computeMetrics(outcomes, requestCount, selectedSeatIds) });
            }
        }
    });
}


function computeMetrics(outcomes, requestCount, selectedSeatIds) {
    const perSeat = Object.fromEntries(
        selectedSeatIds.map((id) => [id, { successes: 0, rejected: 0 }])
    );

    outcomes.forEach(({ seatId, outcome }) => {
        if (outcome === "BOOKED") perSeat[seatId].successes++;
        else perSeat[seatId].rejected++;
    });

    return { totalRequests: requestCount, perSeat };
}