import { runIndependentSeatSimulation } from "./simulations/independent-seat.js";
import { initEventLog } from "./core/event-log.js";

initEventLog(document.getElementById("log"));

runIndependentSeatSimulation(
    { requestCount: 300, selectedSeatIds: ["A1", "A2", "A3"] },
    (result) => console.log("Simulation result:", result)
);