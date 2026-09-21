require("dotenv").config();

const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const TASKS_PATH = path.join(__dirname, "control", "tasks.json");
const OUTPUT_DIR = path.join(__dirname, "control", "outputs");

function loadTasks() {
  return JSON.parse(fs.readFileSync(TASKS_PATH, "utf8"));
}

function saveTasks(data) {
  fs.writeFileSync(TASKS_PATH, JSON.stringify(data, null, 2));
}

function updateTask(id, patch) {
  const data = loadTasks();
  const task = data.tasks.find((t) => t.id === id);
  if (!task) throw new Error("Task not found: " + id);
  Object.assign(task, patch, { updatedAt: new Date().toISOString() });
  saveTasks(data);
  return task;
}

async function ask(instructions, input) {
  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    reasoning: { effort: "low" },
    instructions,
    input
  });
  return response.output_text;
}

async function reviewPackage(pkg) {
  return ask(
    `
You are a strict credibility reviewer for a small B2B service.

First line must be exactly PASS or REJECT.

PASS only if the package:
- looks credible enough for a cold prospect to investigate,
- does not invent proof,
- does not overbuild,
- clearly explains the service,
- includes a concrete pilot structure,
- includes honest contact/identity guidance,
- reduces sketch-factor,
- uses simple professional language,
- can be implemented quickly and cheaply.

After the first line:
1. list the 3 biggest credibility risks,
2. list exact fixes,
3. state whether the package is ready to implement.
`,
    pkg
  );
}

async function runCredibilitySprint() {
  const id = "T-005";
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  updateTask(id, {
    status: "working",
    nextAction: "Manager is delegating brand, website, sender-identity, pilot-offer, and QA work."
  });

  const context = `
ComfortRelay is a Columbus-area HVAC lead-routing and follow-up service.
Current promise: keep urgent requests visible, routine inquiries organized, and follow-up clear without adding busywork.
Current validation status: real cold outreach is already running.
The immediate problem: cold emails from an unknown Gmail address can look sketchy without a credible web/brand footprint.

Known facts:
- Do not claim customers, proven savings, testimonials, measured performance improvements, or traction we do not have.
- We are seeking early Columbus-area HVAC pilot customers.
- Current intended paid pilot price: $199 for 30 days, no long-term contract, with hands-on setup and adjustments during the pilot.
- The prospect should receive a clear description of what is actually delivered.
- Any workflow example must be explicitly labeled SAMPLE / FICTIONAL DATA.
- Contact details must be real and implementable, not placeholders left unexplained.

Constraints:
- Do not overbuild.
- Keep the launch package minimal.
- Keep the tone simple, confident, local, professional, and human.
- The purpose is to increase trust enough to earn replies, demos, and paid pilots.
- Avoid generic AI-agency language.
`;

  const brand = await ask(
    `
You are the Brand Strategist.
Create ONE practical visual direction for ComfortRelay, not three.

Return only:
1. Brand positioning in one sentence.
2. One logo direction detailed enough for an image-generation model or designer.
3. Simple color/typography direction using free/system-safe options.
4. Honest trust signals available now.
5. Trust signals we must NOT fake.
Keep it minimal enough to implement immediately.
`,
    context
  );

  const website = await ask(
    `
You are the Website Copy Builder.
Draft concise copy for ONE simple one-page ComfortRelay website.

Required sections:
- Hero
- What the service does
- Simple 3-step workflow
- Clearly labeled SAMPLE WORKFLOW using fictional HVAC lead data
- 30-day $199 Founding Pilot: exact deliverables, duration, what happens during setup, and no long-term contract
- Honest early-stage statement that we are looking for a small number of Columbus-area HVAC companies to test the workflow
- FAQ
- Contact/CTA

Do not claim proven results, existing customers, savings, or integrations that are not verified.
Do not imply measured operational improvements.
Make it readable in under 2 minutes.
`,
    context + "\n\nBrand direction:\n" + brand
  );

  const identity = await ask(
    `
You are the Sales Identity Specialist.
Create the minimum credible outbound identity for ComfortRelay.

Return only:
1. Recommended sender display name.
2. Recommended sender email strategy, explicitly noting whether the current Gmail is acceptable temporarily and what domain-based address should replace it later.
3. Recommended signature with real-person framing but no fake title inflation.
4. Recommended footer.
5. ONE improved first-touch email.
6. ONE follow-up email.
7. One sentence explaining what would make the message look suspicious and how this package reduces that risk.

Do not invent a fake team, fake office, fake customer count, fake phone number, fake domain, or fake testimonials.
`,
    context
  );

  const pilot = await ask(
    `
You are the Offer Builder.
Define one concrete ComfortRelay founding pilot.

Return only:
- Price
- Duration
- Exact deliverables
- What the customer has to provide
- What setup involves
- What the customer will see/receive
- What is manual vs automated during the pilot
- What is explicitly NOT promised
- The single CTA used after interest

Keep it implementable with the current workflow and honest about the early stage.
`,
    context
  );

  let finalPackage = `
=== BRAND ===

${brand}

=== ONE-PAGE WEBSITE ===

${website}

=== PILOT OFFER ===

${pilot}

=== EMAIL IDENTITY + OUTREACH ===

${identity}
`;

  const firstReview = await reviewPackage(finalPackage);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "T-005-credibility-review-round1.txt"),
    firstReview
  );

  let finalReview = firstReview;

  if (!firstReview.trim().toUpperCase().startsWith("PASS")) {
    const revised = await ask(
      `
You are the Revision Manager.

You are given a draft launch package and a strict reviewer rejection.
Revise the package ONCE using every concrete reviewer fix.

Hard requirements:
- Reduce it to one logo direction, one one-page website, one concrete pilot, one outreach email, and one follow-up.
- Include honest real-world identity/contact guidance.
- State the pilot price, duration, deliverables, and what the prospect actually receives.
- Use an honest early-stage pilot statement instead of implying existing success.
- Include a sample workflow clearly labeled as fictional/sample data.
- Do not imply measured performance improvements.
- Do not invent proof, customers, savings, testimonials, staff, addresses, phone numbers, domains, or integrations.
- Output the complete revised implementation-ready package, not commentary about it.
`,
      "DRAFT PACKAGE:\n" + finalPackage + "\n\nREVIEWER REJECTION:\n" + firstReview
    );

    finalPackage = revised;
    finalReview = await reviewPackage(finalPackage);
  }

  const passed = finalReview.trim().toUpperCase().startsWith("PASS");

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "T-005-comfortrelay-credibility-package.txt"),
    finalPackage
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "T-005-credibility-review.txt"),
    finalReview
  );

  updateTask(id, {
    status: passed ? "done" : "review",
    nextAction: passed
      ? "Implement the reviewer-approved one-page site, logo direction, pilot offer, and sender identity."
      : "Human review required: the automatic revision still did not pass.",
    managerDecision: passed ? "PASS" : "REJECT",
    outputFile: "control/outputs/T-005-comfortrelay-credibility-package.txt",
    reviewFile: "control/outputs/T-005-credibility-review.txt"
  });

  console.log("\n=== T-005 " + (passed ? "DONE" : "NEEDS HUMAN REVISION") + " ===\n");
  console.log("Package: control/outputs/T-005-comfortrelay-credibility-package.txt");
  console.log("Final review: control/outputs/T-005-credibility-review.txt");
  console.log("Round 1 review: control/outputs/T-005-credibility-review-round1.txt");
}

runCredibilitySprint().catch((err) => {
  console.error("\nCREDIBILITY SPRINT ERROR\n", err);
  process.exitCode = 1;
});
