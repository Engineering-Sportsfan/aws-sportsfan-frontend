import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatActiveCount,
  getDisplayedAvatars,
  shouldRenderActiveFansStack,
  type DisplayFan,
} from "./activeFansStack.contract";

const f = (uid: string): DisplayFan => ({ uid, username: `u_${uid}`, avatarUrl: null });

// --- formatActiveCount ---

test("formatActiveCount: small numbers pass through unchanged", () => {
  assert.equal(formatActiveCount(0), "0");
  assert.equal(formatActiveCount(3), "3");
  assert.equal(formatActiveCount(999), "999");
});

test("formatActiveCount: abbreviates thousands", () => {
  assert.equal(formatActiveCount(1000), "1.0k");
  assert.equal(formatActiveCount(1500), "1.5k");
  assert.equal(formatActiveCount(12345), "12.3k");
});

// --- getDisplayedAvatars: the core invariant ---

test("getDisplayedAvatars: never shows more avatars than count, even with stale oversized fans array", () => {
  // Regression case: a slow GET response could carry more fans entries
  // than the freshest heartbeat's count. Avatars must never exceed count.
  const fans = [f("a"), f("b"), f("c"), f("d"), f("e")];
  const displayed = getDisplayedAvatars(fans, 1);
  assert.equal(displayed.length, 1);
  assert.deepEqual(displayed.map(x => x.uid), ["a"]);
});

test("getDisplayedAvatars: caps at max (3) even when count is larger", () => {
  const fans = [f("a"), f("b"), f("c"), f("d")];
  const displayed = getDisplayedAvatars(fans, 10);
  assert.equal(displayed.length, 3);
});

test("getDisplayedAvatars: count of 0 shows no avatars regardless of fans array", () => {
  const fans = [f("a"), f("b")];
  assert.deepEqual(getDisplayedAvatars(fans, 0), []);
});

test("getDisplayedAvatars: negative count is treated as 0, not underflowed", () => {
  const fans = [f("a"), f("b")];
  assert.deepEqual(getDisplayedAvatars(fans, -5), []);
});

test("getDisplayedAvatars: fans array shorter than count just returns what's available", () => {
  const fans = [f("a")];
  const displayed = getDisplayedAvatars(fans, 5);
  assert.equal(displayed.length, 1);
});

test("getDisplayedAvatars: respects custom max", () => {
  const fans = [f("a"), f("b"), f("c"), f("d")];
  assert.equal(getDisplayedAvatars(fans, 10, 2).length, 2);
});

// --- shouldRenderActiveFansStack ---

test("shouldRenderActiveFansStack: renders when count > 0", () => {
  assert.equal(shouldRenderActiveFansStack(1, 0), true);
});

test("shouldRenderActiveFansStack: renders when totalJoinCount is truthy even if count is 0", () => {
  assert.equal(shouldRenderActiveFansStack(0, 50), true);
});

test("shouldRenderActiveFansStack: hides when both are 0/undefined", () => {
  assert.equal(shouldRenderActiveFansStack(0, 0), false);
  assert.equal(shouldRenderActiveFansStack(0, undefined), false);
});