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

async function runMarketEvidenceTask() {
  const id = "T-002";

  console.log("\n=== T-002 STARTED ===\n");
  updateTask(id, {
    status: "working",
    nextAction: "Evidence Reviewer is building the measurable rubric now."
  });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    reasoning: { effort: "low" },
    instructions: `
You are the Market Evidence Reviewer inside a business-opportunity operating system.

Build a strict, measurable rubric that prevents the Researcher from passing exciting-sounding but weak business ideas.

The system's operating philosophy:
- Find proven demand rather than brainstorm randomly.
- Prefer practical businesses where people are visibly paying now.
- Startup cost should usually be low.
- Prefer workflows AI/automation can materially reduce or fulfill.
- Distribution/customer acquisition must be observable and realistically testable.
- Avoid opportunities whose success depends on speculative trading or beating institutions.
- Do not rely on copying protected branding, artwork, code, or other intellectual property.
- The goal is fast real-world validation and eventually repeatable profitable revenue.

Create:
1. PASS/REJECT gates with measurable thresholds.
2. Required evidence for demand.
3. Required evidence for pricing and buyer willingness.
4. Required evidence for fulfillment feasibility.
5. Required evidence for distribution.
6. Disqualifiers.
7. A 100-point scorecard.
8. A final machine-readable decision rule the Researcher/Manager can follow.

Make the rubric practical enough to use immediately on the next opportunity.
Do not pad the answer with motivational language.
`,
    input: "Create the first Market Evidence Rubric for this system."
  });

  const output = response.output_text;
  const outputPath = path.join(OUTPUT_DIR, "T-002-market-evidence-rubric.txt");
  fs.writeFileSync(outputPath, output);

  updateTask(id, {
    status: "review",
    nextAction: "Manager is checking the rubric against the task success condition.",
    outputFile: "control/outputs/T-002-market-evidence-rubric.txt"
  });

  const review = await client.responses.create({
    model: "gpt-5.6-luna",
    reasoning: { effort: "low" },
    instructions: `
You are the Manager. Review the Market Evidence Rubric below.

PASS only if it:
- uses measurable evidence instead of vague judgments,
- includes clear rejection gates,
- checks demand, pricing, fulfillment, and distribution,
- includes explicit disqualifiers,
- gives a usable scoring or decision rule,
- is practical enough for the Researcher to use on the next opportunity.

First line must be exactly PASS or REJECT.
Then give a concise reason.
`,
    input: output
  });

  const managerReview = review.output_text;
  fs.writeFileSync(path.join(OUTPUT_DIR, "T-002-manager-review.txt"), managerReview);

  const passed = managerReview.trim().toUpperCase().startsWith("PASS");

  updateTask(id, {
    status: passed ? "done" : "inbox",
    nextAction: passed
      ? "Use this rubric as the quality gate for future opportunity research."
      : "Revise the rubric using the Manager review, then resubmit.",
    managerDecision: passed ? "PASS" : "REJECT",
    reviewFile: "control/outputs/T-002-manager-review.txt"
  });

  console.log("\n=== T-002 " + (passed ? "DONE" : "REJECTED") + " ===\n");
  console.log("Rubric: control/outputs/T-002-market-evidence-rubric.txt");
  console.log("Review: control/outputs/T-002-manager-review.txt\n");
}

runMarketEvidenceTask().catch((err) => {
  console.error("\nTASK RUNNER ERROR\n", err);
  process.exitCode = 1;
});
