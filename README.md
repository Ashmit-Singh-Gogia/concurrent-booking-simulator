# ⚡ Concurrency Lab: Multithreaded Race Condition Simulator

> **⚠️ Crucial Disclaimer**:  
> **This project is an empirical simulation and educational benchmarking lab, NOT a production ticketing or seat-booking engine.**  
> It uses cinema seat reservations as an intuitive domain model to simulate, visualize, and benchmark high-contention concurrency problems and solutions in real-time.

---

## 📌 1. Project Overview & Target Audience

### What is this Project?
In distributed systems, databases, and multithreaded applications, **concurrency bugs (race conditions, dirty reads, lost updates, and double-allocation)** are notoriously hard to reproduce and debug. 

This project provides an interactive in-browser laboratory that strips away network jitter and database latency to expose raw memory contention. Powered by **Web Workers**, **`SharedArrayBuffer`**, and the **`Atomics` API**, it demonstrates what happens at the hardware and operating-system thread level when multiple concurrent workers contend for shared resources simultaneously.

### The Problem It Simulates: The "Check-Then-Act" Race Condition
Consider two parallel threads attempting to book Seat `A1`:
1. **Thread 1** checks seat status: `seatView[0] === 0` (Available).
2. Before Thread 1 can update the state, **Thread 2** preempts and checks: `seatView[0] === 0` (Available).
3. Both threads proceed to book the seat: `seatView[0] = 1`.
4. **Outcome**: The exact same seat is sold to two different customers (**Double Booking / Data Corruption**).

```
Thread 1: [Read: Free] ------------------------> [Write: Booked] (Success)
Thread 2: ---------> [Read: Free] ------------> [Write: Booked] (Duplicate / Corruption!)
```

### Who Should Use This Lab?
* **Students & Academics**: Exploring Operating System concepts (race conditions, mutual exclusion, critical sections, lock contention, and hardware atomics).
* **Software Engineers & System Designers**: Looking to visualize synchronization overhead, evaluate coarse vs. fine-grained locking, and understand lock-free programming trade-offs.
* **Educators**: Conducting live lecture demonstrations of multithreading bugs and their real-world resolutions.

---

## ⚖️ Concurrency Approaches & Trade-Offs Matrix

The lab implements and benchmarks **four distinct concurrency paradigms**:

| Mode | Strategy | Synchronization Primitive | Correctness | Throughput & Latency | Trade-offs & Real-World Equivalent |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01. Unsafe** | No Synchronization | None (Raw read/write on shared memory) | ❌ **Broken** (Frequent double bookings) | Fast but invalid | Equivalent to an unindexed database query without transactions or locking. Highly dangerous in production. |
| **02. Atomic** | Lock-Free CAS | `Atomics.compareExchange` | ✅ **100% Safe** (Zero duplicates) | 🚀 **Highest** (Sub-millisecond) | Uses hardware-level CPU instructions (Compare-And-Swap). Extremely fast, no thread sleep/wake overhead. Best when state can fit in atomic integers. |
| **03. Global Lock** | Coarse-Grained Mutex | `Atomics.wait` + `Atomics.notify` | ✅ **100% Safe** (Zero duplicates) | 🐌 **Slowest** (Serialized bottleneck) | Single lock protects the entire cinema. Safe, but causes thread starvation: workers wanting seat `A1` block workers wanting seat `J10`. High context-switch latency. |
| **04. Per-Seat Lock** | Fine-Grained Mutex | Individual locks via `lockView[seatIdx]` | ✅ **100% Safe** (Zero duplicates) | ⚡ **High Scalability** under diverse demand | Each seat has its own independent mutex. Only workers competing for the *exact same seat* queue up; workers targeting different seats run in full parallel. |

---

## 🏗️ 2. System Architecture & Folder Structure

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Browser Main Thread (UI)                        │
│  - Interactive 10x10 Seat Map                                          │
│  - Live Microsecond Timestamped Event Logs                             │
│  - Metrics & Comparison Leaderboard (compare.html)                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Spawns & Coordinates
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────────────┐   ┌────────────────────────────┐
│      SharedArrayBuffer (RAM)          │   │   Web Worker Thread Pool   │
├───────────────────────────────────────┤   │ (Independent OS Threads)   │
│ 1. seatView       (Int32Array[100])   │◀──┤  Worker 0 (Seat A1)        │
│ 2. lockView       (Int32Array[100])   │◀──┤  Worker 1 (Seat A1)        │
│ 3. globalLockView (Int32Array[1])     │◀──┤  Worker 2 (Seat B5)        │
│ 4. barrierView    (Int32Array[1])     │◀──┤  ... Worker N              │
└───────────────────────────────────────┘   └────────────────────────────┘
```

### Key Architectural Primitives
1. **True Shared Memory (`SharedArrayBuffer`)**:  
   Unlike traditional JavaScript workers that pass copies of data via `postMessage()`, workers in this lab share a single continuous memory block. Zero serialization overhead.
2. **Microsecond Release Barrier (`barrierView`)**:  
   If workers started sequentially, Worker 0 would always finish before Worker 10 even booted. An atomic barrier holds all workers in sleep state (`Atomics.wait(barrierView, 0, 0)`). Once all workers signal `READY`, the main thread issues `Atomics.notify(barrierView, 0)`, releasing all threads into the race at the exact same microsecond.
3. **Simulated Workload**:  
   Each worker performs an identical CPU compute loop (`for (let k = 0; k < 10000000; k++) sum += k;`) to simulate real business logic (payment verification, database access) inside or outside the critical section.

---

### Folder Structure

```text
Concurrency_Simulator/
├── public/
│   ├── _headers                  # Cross-Origin Isolation headers (COOP/COEP) for SharedArrayBuffer
│   ├── index.html                # Main landing page & architecture overview
│   ├── compare.html              # Multi-engine side-by-side benchmark lab
│   ├── compare.js                # Harness for orchestrating simultaneous comparison runs
│   ├── main.js                   # Main-thread orchestration, buffer allocation, and UI logging
│   ├── styles.css                # Visual dashboard layout and responsive grid styles
│   │
│   ├── simulations/              # Individual experiment interfaces
│   │   ├── unsafe.html           # Mode 1: Unsafe (Race condition demo)
│   │   ├── atomic.html           # Mode 2: Atomic Compare-and-Swap (Lock-free)
│   │   ├── global-lock.html      # Mode 3: Global Coarse Lock
│   │   └── seat-lock.html        # Mode 4: Per-Seat Fine Lock
│   │
│   ├── workers/                  # Dedicated Web Worker thread scripts
│   │   ├── unsafe_worker.js      # Naive check-then-act logic (produces duplicates)
│   │   ├── safe_worker.js        # Lock-free atomic swap via Atomics.compareExchange
│   │   ├── global_worker.js      # Mutex implementation via Atomics.wait / notify on lock index 0
│   │   └── per_seat_lock_worker.js # Mutex array partitioned per seat index
│   │
│   ├── common/                   # Shared validation and parsing utilities
│   │   ├── validateSeat.js       # Input bounds checking (validates row A-J, col 1-10)
│   │   └── parseSeats.js         # Parses comma-separated seat strings into indices
│   │
│   ├── constants/
│   │   └── constants.js          # Shared constants (grid dimensions, limits, error codes)
│   │
│   └── seat_model/
│       └── seat_model.js         # Bidirectional coordinate mapper (A1 <-> 0, B1 <-> 10, etc.)
│
├── Plans.md                      # Feature roadmap and architectural notes
├── Run.md                        # Quick command cheat sheet
└── README.md                     # Project documentation & Viva presentation guide
```

---

## 🚀 3. How to Run & Use the Simulator

### Step 1: Start the Local Development Server
Because `SharedArrayBuffer` allows direct shared memory access between threads, modern browsers enforce strict security boundaries to prevent **Spectre**-style timing attacks. The server **must** return the following headers (configured in `public/_headers`):
* `Cross-Origin-Opener-Policy: same-origin`
* `Cross-Origin-Embedder-Policy: require-corp`

Run using Cloudflare Wrangler (recommended):
```bash
npx wrangler pages dev ./public
```

Alternatively, use any local server configured with custom headers:
```bash
# Example using Python/Node (make sure COOP/COEP headers are enabled)
```
Open **`http://localhost:8787`** in your browser.

---

### Step 2: How to Use the Simulator

#### A. Exploring Individual Simulations
1. Click any simulation card on the homepage (e.g., **Unsafe booking** or **Atomic compare & exchange**).
2. Configure your test scenario:
   * **Target Seat(s)**: Type single or multiple seats (e.g., `A1` or `A1, B2, C3`).
   * **Number of Workers**: Select concurrency volume (e.g., `10`, `50`, or `100` workers).
3. Click **Run Simulation**:
   * Watch the **Seat Grid** update dynamically in real time.
   * Observe the **Live Event Log** showing microsecond timestamps (`+X.XXX ms`), worker IDs, and actions.
   * Review the final summary: **Total Execution Time**, **Successful Bookings**, and **Duplicate Conflicts**.

#### B. Running the "Compare All" Benchmark
1. Navigate to **Compare all** in the top navigation bar.
2. Enter target seats and worker count.
3. Click **Run Comparison**.
4. The system executes all 4 engines under identical parameters and compiles an automated **Live Ranking Leaderboard**, comparing execution time and safety records.