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

async function createScorecard(feedback = "") {
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
2. Concrete numeric/default kill rules.
3. Concrete numeric/default continue rules.
4. Concrete numeric/default scale rules.
5. Human approval gates for spending.
6. Default budget caps for research, prototype/demo, and validation.
7. A simple experiment decision formula the Manager can apply.
8. Special rules for zero replies, weak evidence, and expensive fulfillment.
9. A runway rule that explicitly protects the roughly $200 total remaining budget.

The system should favor fast, cheap real-world validation and should not keep weak experiments alive because time was already spent on them.

If reviewer feedback is provided, fix every issue it identifies.

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
    input: feedback
      ? "Revise the War Room scorecard using this Manager feedback:\n\n" + feedback
      : "Create the first War Room experiment scorecard."
  });
  return response.output_text;
}

async function reviewScorecard(output) {
  const review = await client.responses.create({
    model: "gpt-5.6-luna",
    reasoning: { effort: "low" },
    instructions: `
You are the Manager. Review this War Room scorecard.

PASS only if it:
- tracks both money and real-world traction,
- has concrete kill/continue/scale rules,
- includes budget caps and human approval gates,
- explicitly protects a roughly $200 total runway,
- avoids sunk-cost thinking,
- is reusable across different business experiments.

First line must be exactly PASS or REJECT.
Then give a concise reason naming every missing requirement.
`,
    input: output
  });
  return review.output_text;
}

async function runWarRoomTask() {
  const id = "T-004";
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("\n=== T-004 STARTED ===\n");
  updateTask(id, {
    status: "working",
    nextAction: "War Room is building and self-revising the experiment scorecard."
  });

  let output = "";
  let managerReview = "";
  let passed = false;

  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log("Attempt " + attempt + "...");
    output = await createScorecard(attempt === 1 ? "" : managerReview);

    fs.writeFileSync(
      path.join(OUTPUT_DIR, "T-004-war-room-scorecard.txt"),
      output
    );

    updateTask(id, {
      status: "review",
      nextAction: "Manager is reviewing War Room scorecard attempt " + attempt + ".",
      outputFile: "control/outputs/T-004-war-room-scorecard.txt"
    });

    managerReview = await reviewScorecard(output);

    fs.writeFileSync(
      path.join(OUTPUT_DIR, "T-004-manager-review.txt"),
      managerReview
    );

    passed = managerReview.trim().toUpperCase().startsWith("PASS");

    if (passed) break;

    if (attempt < 3) {
      updateTask(id, {
        status: "working",
        nextAction: "War Room is revising the scorecard from Manager feedback."
      });
    }
  }

  updateTask(id, {
    status: passed ? "done" : "inbox",
    nextAction: passed
      ? "Use this scorecard to evaluate every active experiment before additional spend."
      : "Needs human review after three automatic revision attempts.",
    managerDecision: passed ? "PASS" : "REJECT",
    reviewFile: "control/outputs/T-004-manager-review.txt"
  });

  console.log("\n=== T-004 " + (passed ? "DONE" : "NEEDS HUMAN REVIEW") + " ===\n");
}

runWarRoomTask().catch((err) => {
  console.error("\nTASK RUNNER ERROR\n", err);
  process.exitCode = 1;
});
