# Concurrent Booking Simulator

A simulator of a concurrent ticket booking system, modeling conditions like race conditions, independent bookings, and more — built entirely in the browser to show what actually happens when multiple requests touch the same seat at once, and how to prevent it correctly.

## What This Is

This isn't a production ticket-booking app. It's a hands-on demonstration project: first it deliberately reproduces a real, common bug — two people booking the same seat at the same time — then fixes it properly, and proves that fixing it doesn't force unrelated seats to wait on each other.

## Features

- Real seat-selection booking flow (login, pick a seat, confirm or reject the booking)
- Three configurable concurrency simulations:
  - **Unsafe (Failed) Race Condition** — reproduces a double-booking on demand, every run
  - **Fixed (Synchronized) Simulation** — same workload, atomic booking, correct result
  - **Independent Seat Concurrency** — proves unrelated seats don't block each other
- A shared, timestamped event log used by both the real booking flow and every simulation
- One shared Reset mechanism that clears simulated state cleanly
- Configurable request count and seat selection for every simulation — no hardcoded test scenarios

## How It Works

1. The app creates one shared block of memory (a `SharedArrayBuffer`) representing every seat's state.
2. Simulations and real bookings spawn Web Workers that read and write into that same memory concurrently.
3. The "unsafe" path deliberately performs a check, then a write, with a gap in between — letting multiple workers slip through and book the same seat.
4. The "fixed" path performs the check-and-write as one uninterruptible operation using `Atomics`, so only one booking can ever succeed per seat.
5. Every step is streamed into a shared event log, so the difference between the two is something you can watch happen, not just something you're told.

## Project Structure

```
concurrent-booking-simulator/
├── public/
│   ├── index.html
│   ├── style.css
│   ├── _headers
│   └── js/
│       ├── main.js
│       ├── core/
│       │   ├── constants.js
│       │   ├── seat-model.js
│       │   ├── shared-state.js
│       │   ├── worker-manager.js
│       │   ├── event-log.js
│       │   ├── booking-engine.js
│       │   └── barrier.js
│       ├── workers/
│       │   └── booking-worker.js
│       ├── simulations/
│       │   ├── validate-config.js
│       │   ├── race-condition.js
│       │   └── independent-seat.js
│       └── ui/
│           └── page-router.js
├── docs/
│   └── SharedArrayBuffer.md
└── README.md
```

## Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 / CSS3 | Application structure and UI |
| Vanilla JavaScript (ES Modules) | Application logic — no frameworks |
| Web Workers | Independent execution contexts for concurrent bookings |
| SharedArrayBuffer + Atomics | Shared memory and atomic synchronization |
| Cloudflare Pages | Static hosting with cross-origin isolation headers |

## Prerequisites

A modern browser supporting SharedArrayBuffer, Atomics, Web Workers, and ES Modules — plus a local server that sends the required cross-origin isolation headers (see below). Opening `index.html` directly as a `file://` URL will not work; SharedArrayBuffer requires a real server context.

## Running Locally

```
npm install -g wrangler   # if not already installed
wrangler pages dev ./public
```

Then open the local URL wrangler prints in your browser.

## Why The Headers Matter

`SharedArrayBuffer` only works on a page that proves it's isolated from other sites. `public/_headers` sets:

```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
```

You can confirm isolation is active by opening DevTools → Console and checking that `crossOriginIsolated` prints `true`.

## Current Scope

This is a learning and portfolio project, not a production booking system:

- No real backend, database, or payment processing
- Login and session handling are simulated for the demo, not production-grade authentication
- One show, one seat grid — no multi-show or multi-theatre support
