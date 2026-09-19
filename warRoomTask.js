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

async function runWarRoomTask() {
  const id = "T-004";

  console.log("\n=== T-004 STARTED ===\n");
  updateTask(id, {
    status: "working",
    nextAction: "War Room is building the experiment scorecard and stop/scale rules."
  });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    reasoning: { effort: "low" },
    instructions: `
You are the War Room inside a revenue-first AI business operating system.

The user is starting from zero revenue and has roughly $200 of additional API budget available for now. The system must earn the right to spend more.

Create a reusable experiment scorecard for all business experiments.

Track at minimum:
- cash/API/software spend
- time spent
- prospects reached
- replies
- qualified conversations
- demos
- paid pilots/customers
- revenue
- gross profit
- fulfillment difficulty
- evidence quality
- distribution traction

Create:
1. Required scorecard fields.
2. Kill rules.
3. Continue rules.
4. Scale rules.
5. Human approval gates for spending.
6. Default budget caps for research, prototype/demo, and validation.
7. A simple experiment decision formula the Manager can apply.
8. Special rules for experiments with zero replies, weak evidence, or expensive fulfillment.

The system should favor fast, cheap real-world validation and should not keep weak experiments alive because time was already spent on them.

Return:
- SCORECARD
- DEFAULT BUDGETS
- KILL RULES
- CONTINUE RULES
- SCALE RULES
- HUMAN APPROVAL GATES
- MANAGER DECISION RULE

Keep it practical and concise.
`,
    input: "Create the first War Room experiment scorecard."
  });

  const output = response.output_text;
  fs.writeFileSync(path.join(OUTPUT_DIR, "T-004-war-room-scorecard.txt"), output);

  updateTask(id, {
    status: "review",
    nextAction: "Manager is reviewing the War Room scorecard.",
    outputFile: "control/outputs/T-004-war-room-scorecard.txt"
  });

  const review = await client.responses.create({
    model: "gpt-5.6-luna",
    reasoning: { effort: "low" },
    instructions: `
You are the Manager. Review this War Room scorecard.

PASS only if it:
- tracks both money and real-world traction,
- has concrete kill/continue/scale rules,
- includes budget caps and human approval gates,
- protects a roughly $200 total runway,
- avoids sunk-cost thinking,
- is reusable across different business experiments.

First line must be exactly PASS or REJECT.
Then give a concise reason.
`,
    input: output
  });

  const managerReview = review.output_text;
  fs.writeFileSync(path.join(OUTPUT_DIR, "T-004-manager-review.txt"), managerReview);

  const passed = managerReview.trim().toUpperCase().startsWith("PASS");

  updateTask(id, {
    status: passed ? "done" : "inbox",
    nextAction: passed
      ? "Use this scorecard to evaluate every active experiment before additional spend."
      : "Revise the scorecard using the Manager review, then resubmit.",
    managerDecision: passed ? "PASS" : "REJECT",
    reviewFile: "control/outputs/T-004-manager-review.txt"
  });

  console.log("\n=== T-004 " + (passed ? "DONE" : "REJECTED") + " ===\n");
  console.log("Output: control/outputs/T-004-war-room-scorecard.txt");
  console.log("Review: control/outputs/T-004-manager-review.txt\n");
}

runWarRoomTask().catch((err) => {
  console.error("\nTASK RUNNER ERROR\n", err);
  process.exitCode = 1;
});
