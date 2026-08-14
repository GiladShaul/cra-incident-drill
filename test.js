// Run: node test.js — the one check that fails if drill logic breaks.
var assert = require("assert");
var D = require("./drill.js");

// scope
assert.equal(D.scopeVerdict("yes", "yes", "yes").verdict, "likely-in");
assert.equal(D.scopeVerdict("no", "yes", "yes").verdict, "likely-out");
assert.equal(D.scopeVerdict("yes", "unsure", "yes").verdict, "unclear");

// scoring bands
var all = {}, none = {};
D.CHECKS.forEach(function (c) { all[c.id] = true; none[c.id] = false; });
assert.equal(D.score(all).band, "Drill-ready");
assert.equal(D.score(all).points, 12);
assert.equal(D.score(none).band, "Not ready");
assert.equal(D.score(none).gaps.length, 12);

// deadline math
var t0 = Date.UTC(2026, 8, 11, 0, 0, 0); // 2026-09-11T00:00Z
var d = D.deadlines(t0);
assert.equal(d.earlyWarning - t0, 24 * 3600 * 1000);
assert.equal(d.notification - t0, 72 * 3600 * 1000);
assert.ok(d.finalIncidentMs > d.notification);

console.log("OK — drill logic checks pass");
