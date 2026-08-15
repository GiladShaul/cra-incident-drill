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
// Calendar month, not 30 days: 72h after 2026-09-11 is 2026-09-14, +1 month = 2026-10-14.
assert.equal(new Date(d.finalIncidentMs).toISOString().slice(0, 10), "2026-10-14");
// Month-end rollover must clamp, never overshoot: 31 Jan + 1 month = 28 Feb, NOT 3 Mar.
// Overshooting would tell a customer their legal deadline is later than it is.
var jan = D.deadlines(Date.UTC(2027, 0, 28, 0, 0, 0)); // +72h = 31 Jan
assert.equal(new Date(jan.notification).toISOString().slice(0, 10), "2027-01-31");
assert.equal(new Date(jan.finalIncidentMs).toISOString().slice(0, 10), "2027-02-28");
// Leap year still clamps to the real last day.
assert.equal(D.addOneMonth(Date.UTC(2028, 0, 31)).toISOString().slice(0, 10), "2028-02-29");
// Ordinary dates are untouched.
assert.equal(D.addOneMonth(Date.UTC(2026, 8, 14)).toISOString().slice(0, 10), "2026-10-14");

console.log("OK — drill logic checks pass");
