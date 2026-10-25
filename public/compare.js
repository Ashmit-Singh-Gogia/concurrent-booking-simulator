import {
    runUnsafeSimulation,
    runSafeSimulation,
    runGlobalLockSimulation,
    runSeatLockSimulation
} from "./main.js";

const completed = {};

function updateLeaderboard() {
    const sorted = Object.values(completed).sort((a, b) => a.time - b.time);
    const rows = document.querySelectorAll(".ranking .rank");
    rows.forEach((row, i) => {
        if (sorted[i]) {
            row.querySelector("strong").textContent = sorted[i].name;
            row.querySelector(".time").textContent = `${sorted[i].time.toFixed(1)} ms`;
            row.querySelector(".muted").textContent = sorted[i].correctness;
        } else {
            row.querySelector("strong").textContent = "—";
            row.querySelector(".time").textContent = "— ms";
            row.querySelector(".muted").textContent = "—";
        }
    });
}

function setResult(id, time, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.querySelector("b").textContent = `${time.toFixed(1)} ms`;
    el.querySelector("span").textContent = text;
}

document.getElementById("btn-compare-all")?.addEventListener("click", () => {
    const count = parseInt(document.getElementById("compare-workers")?.value, 10) || 10;
    const seats = document.getElementById("compare-seats")?.value || "A1, B1, C1";

    // Reset current results
    for (const k in completed) delete completed[k];
    document.querySelectorAll(".compare-result b").forEach(el => el.textContent = "Running...");
    document.querySelectorAll(".compare-result span").forEach(el => el.textContent = "Processing");

    // 1. Unsafe
    runUnsafeSimulation({
        count, seats,
        onFinish: ({ time, bookedCount, duplicates }) => {
            const correctness = duplicates > 0 ? `❌ ${duplicates} duplicate bookings` : "⚠️ Race won";
            setResult("res-unsafe", time, `${bookedCount} booked (${duplicates} dupes)`);
            completed["unsafe"] = { name: "Unsafe booking", time, correctness };
            updateLeaderboard();
        }
    });

    // 2. Atomic
    runSafeSimulation({
        count, seats,
        onFinish: ({ time, bookedCount }) => {
            setResult("res-atomic", time, `${bookedCount} booked (0 duplicates)`);
            completed["atomic"] = { name: "Atomic compare", time, correctness: "✅ Safe (Lock-free)" };
            updateLeaderboard();
        }
    });

    // 3. Global Lock
    runGlobalLockSimulation({
        count, seats,
        onFinish: ({ time, bookedCount }) => {
            setResult("res-global", time, `${bookedCount} booked (Serialized queue)`);
            completed["global"] = { name: "Global lock", time, correctness: "⚠️ Safe (Slow queue)" };
            updateLeaderboard();
        }
    });

    // 4. Per-Seat Lock
    runSeatLockSimulation({
        count, seats,
        onFinish: ({ time, bookedCount }) => {
            setResult("res-seat", time, `${bookedCount} booked (Parallel keys)`);
            completed["seat"] = { name: "Per-seat lock", time, correctness: "✅ Safe (Parallel)" };
            updateLeaderboard();
        }
    });
});

document.getElementById("btn-compare-reset")?.addEventListener("click", () => {
    for (const k in completed) delete completed[k];
    document.querySelectorAll(".compare-result b").forEach(el => el.textContent = "— ms");
    document.querySelectorAll(".compare-result span").forEach(el => el.textContent = "Waiting to run");
    updateLeaderboard();
});
