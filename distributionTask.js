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
}

async function runDistributionTask() {
  const id = "T-003";

  console.log("\n=== T-003 STARTED ===\n");
  updateTask(id, {
    status: "working",
    nextAction: "Distribution Agent is defining the customer-acquisition research stage."
  });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    reasoning: { effort: "low" },
    instructions: `
You are the Distribution Analyst inside a revenue-first AI business operating system.

Design a strict Distribution Analysis stage that runs only AFTER an opportunity passes Market Evidence review.

The system is starting from zero revenue and has a limited API/software runway. The user is willing to spend roughly $200 more total for now, so distribution tests must be cheap, fast, and tied to real-world validation.

Create a reusable distribution research specification that answers:
1. Where competitors appear to acquire customers.
2. Which channels are observable and verifiable.
3. Which channel can be tested cheapest and fastest.
4. What exact first test should be run.
5. What assets/messages are needed.
6. What metric determines whether the test continues or stops.
7. Maximum recommended test spend before requiring human approval.
8. What evidence must be collected before scaling.

Prefer direct outreach, organic/local channels, marketplaces, existing communities, referrals, and other low-cost tests before paid ads.

Do not invent competitor channels. Distinguish verified evidence from hypotheses.

Return:
- REQUIRED INPUTS
- RESEARCH STEPS
- OUTPUT SCHEMA
- TEST RULES
- KILL / CONTINUE / SCALE RULES
- HUMAN APPROVAL GATES

Keep it practical and reusable.
`,
    input: "Create the Distribution Analysis stage for the system."
  });

  const output = response.output_text;
  fs.writeFileSync(path.join(OUTPUT_DIR, "T-003-distribution-stage.txt"), output);

  updateTask(id, {
    status: "review",
    nextAction: "Manager is checking the Distribution Analysis stage.",
    outputFile: "control/outputs/T-003-distribution-stage.txt"
  });

  const review = await client.responses.create({
    model: "gpt-5.6-luna",
    reasoning: { effort: "low" },
    instructions: `
You are the Manager. Review this Distribution Analysis stage.

PASS only if it:
- requires observable evidence,
- clearly separates facts from hypotheses,
- prioritizes low-cost validation,
- contains a concrete first distribution test,
- defines measurable kill/continue/scale rules,
- includes spend/approval guardrails,
- can be reused across different businesses.

First line must be exactly PASS or REJECT.
Then give a concise reason.
`,
    input: output
  });

  const managerReview = review.output_text;
  fs.writeFileSync(path.join(OUTPUT_DIR, "T-003-manager-review.txt"), managerReview);

  const passed = managerReview.trim().toUpperCase().startsWith("PASS");

  updateTask(id, {
    status: passed ? "done" : "inbox",
    nextAction: passed
      ? "Attach this Distribution Analysis stage to future validated opportunities."
      : "Revise the stage using the Manager review, then resubmit.",
    managerDecision: passed ? "PASS" : "REJECT",
    reviewFile: "control/outputs/T-003-manager-review.txt"
  });

  console.log("\n=== T-003 " + (passed ? "DONE" : "REJECTED") + " ===\n");
  console.log("Output: control/outputs/T-003-distribution-stage.txt");
  console.log("Review: control/outputs/T-003-manager-review.txt\n");
}

runDistributionTask().catch((err) => {
  console.error("\nTASK RUNNER ERROR\n", err);
  process.exitCode = 1;
});
