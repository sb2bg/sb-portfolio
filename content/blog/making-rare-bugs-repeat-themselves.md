---
title: "Making Rare Bugs Repeat Themselves"
description: "Why I started Marionette: a Zig deterministic simulation testing library for turning timing bugs into seeds, traces, and replayable failures."
date: "2026-04-22"
---

I started [Marionette](https://github.com/sb2bg/marionette) because I have spent too much time watching bugs hide in timing.

Some bugs are polite. They fail every time, point at the broken line, and let you fix them quickly. Race conditions don't behave that way. They show up once, disappear the moment you add a `printf`, and return three days later on a different machine with no obvious cause.

Being an OS TA has made this concrete. The systems bugs students hit are rarely hard because the underlying idea is obscure. They are hard because the machine is allowed to do things in more than one order. A thread runs a little earlier. An interrupt lands at a bad moment. A lock is held one function too long. A wakeup happens before anyone is asleep. The resulting bug report is "Pintos sometimes hangs," and there is no clean reproduction to work from.

The normal debugging loop for that kind of bug is painful:

1. Run the test.
2. Hope the bad interleaving happens.
3. Add logging.
4. Accidentally change the timing.
5. Run it 200 more times.
6. Start guessing at the scheduler.

The real problem isn't any one step. It's that nothing about it is reproducible.

## The bug report I want

The ideal version of this is boring:

```
seed: 0x8f3a41c2
profile: flaky-network
trace: 7b6e...
failure: replica 2 committed stale value
```

I should be able to run the same seed, under the same profile, and get the same trace until I understand the failure. No hoping, no "try it on my laptop," no sprinkling sleeps around and hoping something sticks.

That is the core idea behind Marionette. It's a deterministic simulation testing library for Zig. You give code a simulated world with explicit time, randomness, tasks, network, and failure injection. Marionette runs scenarios inside that world and records what happened. If the same seed doesn't produce the same trace, that isn't a minor detail. That's the bug.

This is not a new idea. FoundationDB made deterministic simulation famous in database circles. TigerBeetle has written clearly about treating simulation as a first-class engineering practice. Tools like Antithesis, Shuttle, Turmoil, and MadSim all point in the same direction: the fastest way to debug rare distributed bugs is to stop letting them be rare.

Marionette is an attempt to make that shape feel natural in Zig.

## Why Zig

Zig is unusually friendly to this style because it already makes dependencies visible. Allocators are passed around. Randomness can be passed around. Time doesn't have to be global if you choose not to make it global. You can build APIs that accept authority explicitly instead of quietly reaching into the host process for whatever they need.

That matters because deterministic testing is less about one clever scheduler and more about discipline at the boundaries. If code can call the real clock, real network, real filesystem, or real RNG whenever it feels like it, replay is already compromised. You cannot replay what you did not control.

So the bet is not that Marionette can make arbitrary code deterministic. The bet is narrower:

If Zig code is written with explicit authorities, Marionette can provide deterministic ones.

That means a simulated clock instead of wall time. A seeded RNG instead of ambient randomness. Simulated tasks instead of whatever the OS scheduler happens to do today. Eventually, simulated disk and richer failure models too.

## What exists now

Marionette is Phase 0: source-only, unstable API, not production-ready. This post isn't a launch announcement; there isn't a polished framework behind it yet.

The important contract right now is small:

```
same seed + same scenario = same trace
```

That sounds almost too basic, but it's load-bearing. Once it holds, you can start layering on more interesting schedulers, network behavior, failure profiles, trace comparison, and shrinking. Without it, everything else is theater.

The first useful version of Marionette won't prove your distributed system correct. It will make a bad interleaving show up twice.

That alone would have saved a lot of office-hours time.

## A good test is an artifact

The longer I work around systems code, the more I think a good test isn't just a yes/no check. A good test gives you an artifact. For normal bugs, that artifact is an assertion failure and a stack trace. For timing bugs, I want the artifact to be a seed and a trace.

That is why I started Marionette. I want tests that don't just find the bug once. I want tests that pin the bug in place so I can replay it, modify it, and understand it on my own schedule, instead of chasing it across runs.

The project is here: [github.com/sb2bg/marionette](https://github.com/sb2bg/marionette). It's small, rough, and not ready for anyone to depend on yet. But the shape is right enough that I want to keep pulling on it.
