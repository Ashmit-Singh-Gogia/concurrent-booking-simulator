import { runRaceConditionSimulation } from "./simulations/race-condition.js";
import { initEventLog } from "./core/event-log.js";

initEventLog(document.getElementById("log"));

const mode = "fixed";
runRaceConditionSimulation(
    { requestCount: 30, selectedSeatIds: ["A1"], mode },
    (result) => console.log("Simulation result:", result)
);