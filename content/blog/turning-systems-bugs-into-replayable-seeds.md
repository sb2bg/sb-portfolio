---
title: "Turning Impossible-to-Reproduce Systems Bugs Into Replayable Seeds"
description: "How deterministic simulation testing turned two real Zig HTTP bugs into replayable seeds—and the std.Io interface that made it possible."
date: "2026-07-16"
projectUrl: "https://github.com/sb2bg/marionette"
projectLabel: "Marionette on GitHub"
---

A client makes one keep-alive HTTP request against dusty, a small HTTP/1.1
client/server library for Zig. The request succeeds and the connection goes
back into the client's pool. Then the server process dies. From that moment
the client is bricked: every fetch fails with `WriteFailed`, retries fail,
and even restarting the server does not help. The client never dials a new
connection. It keeps pulling the same corpse out of its pool.

In production this is the worst kind of bug report: "sometimes after a
deploy, some clients never recover." It depends on a server restart landing
between two requests on a pooled connection. Good luck reproducing that on
demand.

Under Marionette it is a trace and a number:

```text
seed=12648430
dusty_pool_crash.client.first_fetch status=200
process.kill node=0
dusty_pool_crash.client.attempt attempt=1 outcome=WriteFailed
dusty_pool_crash.client.attempt attempt=2 outcome=WriteFailed
dusty_pool_crash.client.attempt attempt=3 outcome=WriteFailed
process.restart node=0
dusty_pool_crash.client.post_restart outcome=WriteFailed
io.net.connect count=1
```

One dial in the entire trace, from the healthy first fetch. Everything after
the kill reuses the dead connection, including the attempt made after the
server was provably back. Run the scenario again with seed 12648430 and you
get the same bytes. Hand the seed to someone else and they get the same
bytes. The bug is not flaky anymore; it is a value you can put in a commit
message. This is DUSTY-001, one of two confirmed bugs Marionette found in
dusty 0.1.0, both since fixed upstream.

## The whole trick is `std.Io`

Zig 0.16 routes I/O through an interface, `std.Io`, the same way allocators
have always been passed around in Zig. Production code accepts `std.Io` as a
parameter. In production it gets the real one. In tests, Marionette hands it
an implementation where the clock is virtual, randomness is seeded, and
files, network streams, and task scheduling are all simulated in a single
thread driven by one PRNG.

Because the substitution happens at the interface, the same unmodified code
can run against:

- virtual time
- simulated files with crash and torn-write faults
- deterministic allocation failures
- network partitions, latency, and packet loss
- cooperative deterministic task scheduling
- process kill and restart

The failure ordering that took a specific server restart at a specific
moment is now just one point in a seed space you can sweep.

## Same code, different universe

There is no "simulator version" of your code. A server that takes `std.Io`:

```zig
fn runServer(io: std.Io) !void {
    // ordinary production code: listen, accept, serve
}
```

runs in production against the host I/O:

```zig
try runServer(host_io);
```

and in a test against a simulated node:

```zig
var world = try mar.World.init(allocator, .{ .seed = 12648430 });
const sim = try world.simulate(.{ .network = .{ .nodes = 2 } });

try runServer((try sim.envForNode(0)).io());
```

Faults are injected from outside, through a control surface the application
never sees:

```zig
try sim.control.network.partition(&server_side, &client_side);
try sim.killProcess(0);
try sim.restartProcess(0);
```

That is the entire magic trick. Everything else in Marionette exists to
support it: the trace format, the fault models, the replay checks that run
every scenario twice and assert the traces are byte-identical.

## What it has actually found

Marionette runs pinned, unmodified third-party Zig libraries as validation
targets: dusty's real accept loop, router, and connection pool over
simulated TCP; the xitdb storage engine over the simulated disk; the mailbox
and beanstalkz concurrency and queue-client libraries on the cooperative
scheduler. No forks, no patches.

Against dusty it found two confirmed bugs, each reproducible from a seed:

- **DUSTY-001**, the poisoned pool above. The client's error path released
  dead connections back into the pool, and nothing on the write-failure path
  ever marked them closing, so LIFO acquisition returned the same dead
  connection forever.
- **DUSTY-002**, a graceful-shutdown drain that busy-spins. The drain waited
  on a latched `std.Io.Event` that was never reset, so once any connection
  had ever closed, the "wait" returned immediately and the loop spun hot. On
  preemptive threads the OS rescues it and shutdown just burns a core; under
  a cooperative scheduler the spin starves the handler it is waiting for and
  the world freezes. The bug had never once worked; preemption was hiding it.

Both are written up with root causes in the repo's
[FOUND_BUGS.md](https://github.com/sb2bg/marionette/blob/main/FOUND_BUGS.md),
alongside earlier storage findings, and both are fixed upstream.

Just as important is what the sweeps did not find. The scenario I most
wanted to catch dusty on is the classic truncated-body lie: the server sends
a 64 KiB chunked response, the connection is partitioned at a chunk
boundary, and the client reports success with a short body. Marionette cuts
the link at every one of the fifteen possible chunk boundaries, not one
hand-picked case, and asserts the client either returns the exact body or an
error. dusty passed: every cut surfaced `error.Timeout`, and after healing
the partition a retry produced the byte-exact body. A clean result across a
full sweep is evidence too, and the findings ledger records negative and
boundary results with the same care as the trophies.

## Honest boundaries

Deterministic simulation testing invites specific skeptical questions, so
here are the answers up front.

**Is this testing OS threads?** No. Marionette models cooperative `std.Io`
concurrency: tasks, futex waits, `Mutex`/`Condition` code written against
the interface. It does not model preemptive thread interleavings or
memory-model races. Code that depends on those needs separate testing.

**Is it just mocked I/O?** The library code under test is real and
unmodified; dusty's actual llhttp parser and pool run over the simulated
streams, and a stock `std.http.Client` works against simulated servers. But
the transport underneath is a model, not a kernel: it does partial reads and
writes, latency, loss, partitions, and resets, not TCP's full state machine.

**Does production run through Marionette?** No. Production code takes
`std.Io` and gets the host implementation. Marionette is a test-time
substitution, which is precisely why it can stay a library instead of an
architecture.

**How is network behavior modeled?** Simulated streams with deterministic
latency, send-time loss, delivery-time partitions, healing, and
process-crash resets. Host lookup is literal-only: localhost URLs work, real
DNS does not.

**How are interleavings selected?** A seeded PRNG drives the scheduler, and
sweeps explore the space: seed sweeps for orderings (opt-in task start
jitter widens them, catching things like connect-before-listen races) and
parameter sweeps for fault placement, like the fifteen chunk boundaries
above. This is randomized exploration with replay, not exhaustive model
checking.

**What is deterministic and what is not?** Everything inside the simulated
`std.Io` surface replays byte-identically from its seed; every scenario in
the repo is run twice and its traces compared to enforce that. Code that
steps outside that surface, into real syscalls or real threads, is outside
the guarantee, and the docs draw the exact boundary. The typed
`Endpoint(Message)` modeling layer is experimental and says so.

Marionette is early, alpha, Zig 0.16 only. But the core loop already works
end to end: unmodified third-party code, a fault schedule no one could
reproduce by hand, and a failure you can hand to a maintainer as a seed.
That is the trade I want to make every time: weeks of "cannot reproduce"
for one integer.
