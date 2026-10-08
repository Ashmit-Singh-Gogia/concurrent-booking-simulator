import { SIMULATION_LIMITS } from "../core/constants.js";
import { seatIdToIndex } from "../core/seat-model.js";

export function validateConfig({ requestCount, selectedSeatIds }) {
    const errors = [];

    if (!Number.isInteger(requestCount) || requestCount <= 0) {
        errors.push("Request count must be a whole number greater than 0.");
    } else if (requestCount > SIMULATION_LIMITS.MAX_REQUESTS) {
        errors.push(`Request count can't exceed ${SIMULATION_LIMITS.MAX_REQUESTS}.`);
    }

    if (!selectedSeatIds || selectedSeatIds.length === 0) {
        errors.push("Select at least one seat.");
    } else {
        if (new Set(selectedSeatIds).size !== selectedSeatIds.length) {
            errors.push("Duplicate seats aren't allowed.");
        }
        const unknown = selectedSeatIds.filter((id) => seatIdToIndex(id) === undefined);
        if (unknown.length > 0) {
            errors.push(`Unknown seat(s): ${unknown.join(", ")}.`);
        }
    }

    return errors;
}