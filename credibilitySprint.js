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
You are a strict launch-readiness reviewer for a small B2B HVAC workflow service.

First line must be exactly PASS or REJECT.

PASS only if the package:
- looks credible enough for a cold prospect to investigate,
- does not invent proof,
- clearly explains the service and operating workflow,
- includes a concrete paid pilot with price, duration, scope, and limits,
- includes real identity/contact details,
- includes a practical booking method,
- includes a customer acceptance/approval step,
- includes a defined payment-selection and payment-confirmation process,
- includes a prospect-source / opt-out / message-approval procedure,
- includes a concrete identity/trust upgrade checklist,
- includes a basic data-handling procedure,
- includes basic pilot commercial terms as a draft requiring human approval before use,
- includes an internal test plan using fictional data,
- includes dry-run checks for workflow access, routing, alerts, data deletion/export, and failure handling,
- reduces sketch-factor,
- can be implemented quickly and cheaply,
- avoids fake claims and overbuilding.

Do NOT reject merely because the business is early-stage if the package is honest about that.

After the first line:
1. list the 3 biggest remaining risks,
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
    nextAction: "Manager is delegating brand, website, pilot, operations, data-handling, sender identity, and QA."
  });

  const context = `
ComfortRelay is a Columbus-area HVAC lead-routing and follow-up service.

REAL IDENTITY / CONTACT FACTS:
- Operator first name: Brandon
- Brand: ComfortRelay
- Current contact email: comfortrelayohio@gmail.com
- Current booking method for early pilots: prospect replies by email and Brandon coordinates the walkthrough manually.
- Do not invent a phone number, domain, office address, team size, customer count, testimonials, measured savings, or existing integrations beyond the actual workflow.

CURRENT WORKFLOW FACTS:
- Outreach pipeline is tracked in Google Sheets.
- Gmail is used for outreach and replies.
- Make workflows handle scheduled follow-ups and reply monitoring.
- Telegram is used for internal reply alerts.
- Human review remains in the loop for consequential customer communication.
- The current system is an early-stage managed service / pilot workflow, not mature SaaS.

PILOT DEFAULT:
- $199
- 30 days
- no long-term contract
- hands-on setup and adjustments during the pilot
- exact scope and commercial terms must be stated clearly
- anything presented as a commercial/legal term must be labeled DRAFT FOR HUMAN APPROVAL before use

DATA-HANDLING PRINCIPLE:
- Collect only information needed to route and follow up on inquiries.
- Access should be limited to the agreed workflow.
- Do not claim a retention/deletion practice is already operational unless the package labels it as a launch procedure to implement before the first customer.
- Avoid handling payment card data, medical data, government IDs, or other unnecessary sensitive data.

GOAL:
Create the minimum credible launch package needed to make a cold HVAC prospect feel comfortable investigating ComfortRelay and considering a paid pilot.

CONSTRAINTS:
- Do not overbuild.
- Be honest about the early stage.
- Keep tone simple, confident, local, professional, and human.
- Avoid generic AI-agency language.
- Use fictional/sample data only when clearly labeled.
`;

  const brand = await ask(
    `
You are the Brand Strategist.
Create ONE minimal visual direction for ComfortRelay.

Return only:
1. Positioning sentence.
2. One logo direction.
3. Free/system-safe color and typography direction.
4. Honest trust signals available now.
5. Trust signals we must NOT fake.
`,
    context
  );

  const pilot = await ask(
    `
You are the Offer Builder.
Define the exact 30-day $199 ComfortRelay founding pilot.

Return:
- buyer
- price
- duration
- exact deliverables
- what setup requires from the customer
- what ComfortRelay configures
- what remains manual
- what is automated
- what the customer receives/sees
- response/escalation expectations
- boundaries / what is NOT promised
- cancellation / end-of-pilot handling
- single CTA after interest

Keep it realistic with the current Gmail + Google Sheets + Make + Telegram workflow.
Do not claim 24/7 human monitoring unless it actually exists.
`,
    context
  );

  const operations = await ask(
    `
You are the Operations Designer.
Create a concrete operating SOP for the founding pilot.

Include:
1. Intake sources we can support initially.
2. How a new inquiry enters the workflow.
3. How urgent vs routine requests are identified.
4. What automation does.
5. What Brandon manually reviews.
6. Expected review cadence.
7. Escalation method for urgent items.
8. What happens if routing or forwarding fails.
9. What gets logged.
10. End-of-day / follow-up process.
11. What is explicitly out of scope.

Do not invent capabilities that are not available through Gmail, Google Sheets, Make, and Telegram.
`,
    context + "\n\nPILOT:\n" + pilot
  );

  const dataPolicy = await ask(
    `
You are the Data Handling Designer.
Write a minimal pre-launch data procedure for ComfortRelay's founding pilot.

It must clearly distinguish CURRENT TOOLS from PROCEDURES TO IMPLEMENT BEFORE FIRST CUSTOMER.

Include:
- data categories allowed
- prohibited/unnecessary sensitive data
- where data may be stored in the current stack
- who may access it
- minimum-access principle
- how access is granted/revoked
- how corrections/exports/deletion requests are handled
- retention/deletion procedure at pilot end
- incident/escalation procedure
- what must be disclosed to a customer

Do not make legal-compliance guarantees.
Keep it practical enough to implement manually.
`,
    context
  );

  const terms = await ask(
    `
You are the Commercial Terms Drafter.
Draft a SIMPLE founding-pilot terms sheet labeled:
"DRAFT — HUMAN APPROVAL REQUIRED BEFORE CUSTOMER USE"

Include:
- service
- $199 price
- 30-day term
- payment timing
- scope
- customer responsibilities
- no guaranteed lead volume/revenue/savings
- confidentiality
- basic data handling reference
- termination/cancellation
- what happens to unused time
- limitation-of-liability placeholder language that explicitly says it should be reviewed by a qualified advisor before customer use

Keep it short. Do not pretend this is legal advice or a final contract.
`,
    context + "\n\nPILOT:\n" + pilot
  );

  const acceptance = await ask(
    `
You are the Pilot Acceptance Designer.
Create a short acceptance form / approval email template for a founding pilot.

It must capture:
- customer legal/business name
- authorized contact name + email
- launch date
- 30-day term
- exact scope
- $199 price
- payment timing
- cancellation/end-of-pilot terms
- approved communication channels
- acknowledgement that the service is an early-stage pilot
- explicit acceptance line the customer can reply with

Label it: DRAFT — HUMAN APPROVAL REQUIRED BEFORE CUSTOMER USE.
Do not invent legal guarantees.
`,
    context + "\n\nPILOT:\n" + pilot + "\n\nTERMS:\n" + terms
  );

  const payment = await ask(
    `
You are the Payment Process Designer.
Create the minimum payment process for the $199 pilot.

Return:
- recommended payment method categories (invoice/payment-link/bank transfer) without inventing an account or processor we do not have
- when payment is due
- what evidence of payment is stored
- who confirms payment
- refund/cancellation handling workflow
- exact manual checklist before activation

If a processor must still be selected, say so explicitly and mark that as a pre-launch task.
`,
    context + "\n\nPILOT:\n" + pilot
  );

  const outreachControls = await ask(
    `
You are the Outreach Compliance and Approval Designer.
Create a written prospect-list and message-approval procedure.

Must include:
- only customer-provided, publicly listed business contacts, or otherwise permissioned business contacts
- record source URL/source type and date collected
- record opt-out/unsubscribe status
- suppress opted-out contacts from future sends
- do not buy or scrape restricted/private contact data
- who approves message templates
- how approval is recorded
- how changes to a template trigger re-approval
- how to stop outreach immediately if there is a complaint or compliance concern

Do not claim legal compliance certification.
`,
    context
  );

  const trustPlan = await ask(
    `
You are the Trust Setup Designer.
Create the minimum identity/trust upgrade plan before the next outreach batch.

Must include:
- current honest identity: Brandon / ComfortRelay / comfortrelayohio@gmail.com
- simple one-page website
- one logo
- a domain and domain-based email as the preferred upgrade, clearly marked as NOT YET ACQUIRED if that is true
- booking method
- privacy/data-handling page or section
- pilot terms link or attachment process
- no fake address, phone, testimonials, client logos, or staff

Return a checklist in implementation order.
`,
    context
  );

  const identity = await ask(
    `
You are the Sales Identity Specialist.

Use the real identity facts:
- Brandon
- ComfortRelay
- comfortrelayohio@gmail.com
- booking by replying to the email for now

Return only:
1. sender display name
2. signature
3. footer
4. one first-touch email
5. one follow-up email
6. one interested-reply message that moves toward the $199 pilot
7. how to transition later to a domain-based email without pretending we already have one

No fake titles, phone numbers, addresses, domains, staff, or testimonials.
`,
    context + "\n\nPILOT:\n" + pilot
  );

  const website = await ask(
    `
You are the Website Copy Builder.
Draft concise copy for ONE one-page ComfortRelay website.

Required:
- Hero
- What ComfortRelay does
- 3-step workflow based on the actual operating SOP
- clearly labeled SAMPLE WORKFLOW using fictional HVAC inquiry data
- 30-day $199 Founding Pilot with exact deliverables
- honest early-stage statement that ComfortRelay is seeking a small number of Columbus-area HVAC pilot customers
- FAQ covering setup, urgent vs routine handling, data, cancellation, and what happens if the workflow fails
- Contact/CTA using comfortrelayohio@gmail.com and "reply/request a walkthrough"

Do not claim existing customers, proven savings, guaranteed results, or capabilities outside the current stack.
`,
    context + "\n\nBRAND:\n" + brand + "\n\nPILOT:\n" + pilot + "\n\nOPERATIONS:\n" + operations + "\n\nDATA:\n" + dataPolicy
  );

  const internalTest = await ask(
    `
You are the QA/Test Designer.
Create a pre-customer internal test using FICTIONAL HVAC data.

Include:
- normal inquiry
- urgent no-heat/no-cool inquiry
- malformed/missing-field inquiry
- duplicate inquiry
- failed forwarding/notification simulation
- expected Google Sheet state
- expected Gmail action
- expected Telegram alert
- pass/fail criteria

The test must be runnable without contacting a real prospect.
`,
    context + "\n\nOPERATIONS:\n" + operations
  );

  let finalPackage = `
=== BRAND ===

${brand}

=== ONE-PAGE WEBSITE ===

${website}

=== FOUNDING PILOT ===

${pilot}

=== OPERATING SOP ===

${operations}

=== DATA HANDLING PROCEDURE ===

${dataPolicy}

=== DRAFT COMMERCIAL TERMS ===

${terms}

=== PILOT ACCEPTANCE ===

${acceptance}

=== PAYMENT PROCESS ===

${payment}

=== OUTREACH CONTROLS ===

${outreachControls}

=== TRUST UPGRADE PLAN ===

${trustPlan}

=== EMAIL IDENTITY + OUTREACH ===

${identity}

=== INTERNAL QA TEST ===

${internalTest}
`;

  const firstReview = await reviewPackage(finalPackage);
  fs.writeFileSync(path.join(OUTPUT_DIR, "T-005-credibility-review-round1.txt"), firstReview);

  let finalReview = firstReview;

  if (!firstReview.trim().toUpperCase().startsWith("PASS")) {
    finalPackage = await ask(
      `
You are the Revision Manager.
Revise the complete package ONCE using every specific reviewer fix.

Rules:
- Preserve the real identity/contact facts.
- Do not invent proof, customers, domains, phone numbers, addresses, testimonials, or performance results.
- Keep commercial terms labeled draft/human-approval-required.
- Keep data procedures operationally realistic.
- Keep the package minimal enough for an early-stage business.
- Output the COMPLETE revised package only.
`,
      "PACKAGE:\n" + finalPackage + "\n\nREVIEW:\n" + firstReview
    );

    finalReview = await reviewPackage(finalPackage);
  }

  const passed = finalReview.trim().toUpperCase().startsWith("PASS");

  fs.writeFileSync(path.join(OUTPUT_DIR, "T-005-comfortrelay-credibility-package.txt"), finalPackage);
  fs.writeFileSync(path.join(OUTPUT_DIR, "T-005-credibility-review.txt"), finalReview);

  updateTask(id, {
    status: passed ? "done" : "review",
    nextAction: passed
      ? "Implement the approved trust checklist, select/document payment method, obtain human/legal review of commercial terms, and run the fictional-data QA checklist before the first pilot."
      : "Human review required: remaining blockers are listed in the final review.",
    managerDecision: passed ? "PASS" : "REJECT",
    outputFile: "control/outputs/T-005-comfortrelay-credibility-package.txt",
    reviewFile: "control/outputs/T-005-credibility-review.txt"
  });

  console.log("\n=== T-005 " + (passed ? "DONE" : "NEEDS HUMAN REVISION") + " ===\n");
  console.log("Package: control/outputs/T-005-comfortrelay-credibility-package.txt");
  console.log("Final review: control/outputs/T-005-credibility-review.txt");
}

runCredibilitySprint().catch((err) => {
  console.error("\nCREDIBILITY SPRINT ERROR\n", err);
  process.exitCode = 1;
});
