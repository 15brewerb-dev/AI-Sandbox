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

async function ask(role, instructions, input) {
  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    reasoning: { effort: "low" },
    instructions,
    input
  });
  return response.output_text;
}

async function runCredibilitySprint() {
  const id = "T-005";
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  updateTask(id, {
    status: "working",
    nextAction: "Manager is delegating brand, website, sender-identity, and QA work."
  });

  const context = `
ComfortRelay is a Columbus-area HVAC lead-routing and follow-up service.
Current promise: keep urgent requests visible, routine inquiries organized, and follow-up clear without adding busywork.
Current validation status: real cold outreach is already running.
The immediate problem: cold emails from an unknown Gmail address can look sketchy without a credible web/brand footprint.
Constraints:
- Do not overbuild.
- Do not invent customer claims, logos, testimonials, savings, or traction.
- Keep the tone simple, confident, local, professional, and human.
- The purpose is to increase trust enough to earn replies, demos, and paid pilots.
- We need a minimal credible footprint, not a full SaaS product.
- Avoid generic AI-agency language.
`;

  const brand = await ask(
    "Brand Strategist",
    `
You are the Brand Strategist. Create the minimum credible brand direction for ComfortRelay.
Return:
1. Brand positioning in one sentence.
2. 3 visual directions, then choose one.
3. Logo brief detailed enough for an image-generation model or designer.
4. Color/typography direction described generically without requiring paid fonts.
5. Trust signals we can honestly use right now.
6. Trust signals we must NOT fake.
Keep this practical and minimal.
`,
    context
  );

  const website = await ask(
    "Website Copy Builder",
    `
You are the Website Copy Builder. Draft copy for a one-page ComfortRelay website.
Required sections:
- Hero
- What ComfortRelay does
- How it works
- Who it is for
- Why it is useful
- Founding pilot
- FAQ
- CTA/contact
Do not claim proven results, customers, savings, or integrations that are not verified.
Make it readable in under 3 minutes.
`,
    context + "\n\nBrand direction:\n" + brand
  );

  const identity = await ask(
    "Sales Identity Specialist",
    `
You are the Sales Identity Specialist. Improve the credibility of ComfortRelay cold outreach without changing the core offer.
Return:
1. Recommended sender display name.
2. Recommended signature.
3. Recommended email-footer language.
4. A tighter first-touch email template.
5. A tighter follow-up template.
6. What makes the current unknown-Gmail approach look suspicious and how to reduce that risk cheaply.
Do not recommend fake personas or false claims.
`,
    context
  );

  const draftPackage = `
=== BRAND STRATEGY ===

${brand}

=== ONE-PAGE WEBSITE COPY ===

${website}

=== EMAIL IDENTITY + OUTREACH ===

${identity}
`;

  const review = await ask(
    "Credibility Reviewer",
    `
You are a strict credibility reviewer for a small B2B service.

First line must be exactly PASS or REJECT.

PASS only if the package:
- looks credible enough for a cold prospect to investigate,
- does not invent proof,
- does not overbuild,
- clearly explains the offer,
- reduces sketch-factor,
- uses simple professional language,
- can be implemented quickly and cheaply.

After the first line:
1. list the 3 biggest credibility risks,
2. list exact fixes,
3. state whether the package is ready to implement.
`,
    draftPackage
  );

  const passed = review.trim().toUpperCase().startsWith("PASS");

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "T-005-comfortrelay-credibility-package.txt"),
    draftPackage
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "T-005-credibility-review.txt"),
    review
  );

  updateTask(id, {
    status: passed ? "done" : "review",
    nextAction: passed
      ? "Implement the approved logo direction, one-page site, and sender identity."
      : "Revise the package using the reviewer feedback before implementation.",
    managerDecision: passed ? "PASS" : "REJECT",
    outputFile: "control/outputs/T-005-comfortrelay-credibility-package.txt",
    reviewFile: "control/outputs/T-005-credibility-review.txt"
  });

  console.log("\n=== T-005 " + (passed ? "DONE" : "NEEDS REVISION") + " ===\n");
  console.log("Package: control/outputs/T-005-comfortrelay-credibility-package.txt");
  console.log("Review: control/outputs/T-005-credibility-review.txt");
}

runCredibilitySprint().catch((err) => {
  console.error("\nCREDIBILITY SPRINT ERROR\n", err);
  process.exitCode = 1;
});
