// CRA Incident Drill — core logic. Client-side only; nothing leaves the browser.
// ponytail: plain JS module-less file, works in <script> and Node (for test.js).

var DRILL = (function () {
  var HOUR = 3600 * 1000;
  var DAY = 24 * HOUR;

  // Readiness checklist. Each item: id, question, why it matters (mapped to Art. 14 mechanics).
  var CHECKS = [
    { id: "eulogin1", q: "Does at least one named person in your company have a working EU Login account (ecas.ec.europa.eu)?", why: "Reports are filed manually on ENISA's Single Reporting Platform by a human with an EU Login. No account = you cannot file at all." },
    { id: "eulogin2", q: "Does a second (backup) person also have EU Login access?", why: "ENISA onboarding expects a primary and a backup representative. Your primary will eventually be on a plane, on leave, or asleep." },
    { id: "csirt", q: "Do you know which national CSIRT is your coordinator (CDaC)?", why: "Your report is routed to the CSIRT of your main EU establishment (or your authorised representative's). Finding this out during hour 20 of 24 is a bad plan." },
    { id: "template24", q: "Do you have a pre-filled 24-hour early-warning template with the mandatory fields?", why: "The early warning needs: notification type and level, manufacturer name, product, title — and for incidents, whether unlawful or malicious acts are suspected. Filling a blank form under pressure wastes your shortest deadline." },
    { id: "decider", q: "Is one named role authorised to declare \"we are aware\" and start the clock?", why: "The 24h/72h clocks run from awareness. If nobody owns that call, you either start late (non-compliance risk) or start on every false alarm." },
    { id: "drafter", q: "Is a named person responsible for drafting the notifications?", why: "The 72-hour notification needs the general nature of the vulnerability and exploit, measures taken, and measures available to users. Someone must be able to write that from your incident data." },
    { id: "submitter", q: "Is a named person responsible for actually submitting on the platform?", why: "There is no API. Submission is a manual form. Drafting and submitting are different failure points." },
    { id: "sbom", q: "Do you keep a current SBOM (software bill of materials) for the product?", why: "You can't assess \"is our product affected and how\" within 24 hours without knowing what's inside it." },
    { id: "monitoring", q: "Do you monitor your components against vulnerability feeds (NVD / EUVD)?", why: "\"Awareness\" often starts with a feed match. If you don't watch, your customers or a regulator become your monitoring." },
    { id: "usernotify", q: "Do you have a channel ready to inform impacted users, with mitigation instructions?", why: "Article 14(8): impacted users must be informed in a timely way, where appropriate in machine-readable form. A dusty mailing list is not a channel." },
    { id: "evidence", q: "Do you keep a timestamped evidence/timeline log during incidents?", why: "Every deadline is measured from awareness. Without timestamps you cannot show you filed in time — or defend when awareness actually began." },
    { id: "classified", q: "Have you confirmed whether each of your products is in CRA scope?", why: "Products with digital elements sold in the EU are covered — including products already on the market (the reporting duty applies to the installed base from 11 September 2026)." }
  ];

  // Scope triage — deliberately conservative: this is orientation, not legal advice.
  function scopeVerdict(sellsEU, isCommercial, isDigital) {
    if (sellsEU === "no" || isCommercial === "no" || isDigital === "no") {
      return { verdict: "likely-out", label: "Likely out of scope", detail: "Based on your answers, the CRA manufacturer reporting duty likely does not apply. Re-check if you start selling products with digital elements in the EU — and note importers and distributors have duties of their own." };
    }
    if (sellsEU === "yes" && isCommercial === "yes" && isDigital === "yes") {
      return { verdict: "likely-in", label: "Likely in scope", detail: "A product with digital elements, made available on the EU market commercially: Article 14 reporting duties likely apply to you from 11 September 2026 — including for products you already sold." };
    }
    return { verdict: "unclear", label: "Unclear — assume in scope until verified", detail: "One or more answers were unsure. The safe working assumption is that the duty applies; confirm product classification with counsel." };
  }

  function score(answers) { // answers: {id: true|false}
    var got = 0, gaps = [];
    CHECKS.forEach(function (c) {
      if (answers[c.id]) got++;
      else gaps.push(c);
    });
    var band;
    if (got <= 4) band = "Not ready";
    else if (got <= 8) band = "Partially ready";
    else if (got <= 11) band = "Nearly ready";
    else band = "Drill-ready";
    return { points: got, total: CHECKS.length, band: band, gaps: gaps };
  }

  // Deadline math from a simulated awareness time.
  function deadlines(awareMs) {
    return {
      aware: awareMs,
      earlyWarning: awareMs + 24 * HOUR,
      notification: awareMs + 72 * HOUR,
      finalVuln: "14 days after a corrective or mitigating measure is available",
      finalIncidentMs: awareMs + 72 * HOUR + 30 * DAY // ~1 month after the 72h notification
    };
  }

  return { CHECKS: CHECKS, scopeVerdict: scopeVerdict, score: score, deadlines: deadlines, HOUR: HOUR, DAY: DAY };
})();

if (typeof module !== "undefined") module.exports = DRILL;
