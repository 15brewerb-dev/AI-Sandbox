const { buildDemoPlan } = require("./demoBuilder");

async function runDemo() {
  const targetBusiness = `
614 OH HVAC
Columbus, Ohio

Public details:
- Same-day service
- 24-hour emergency response
- Free quotes
- Website quote form

Goal:
Create a simple missed-call and lead-follow-up demo that could be shown to this company without claiming their current system is bad.
`;

  console.log("\n=== BUILDING DEMO PLAN ===\n");

  const demoPlan = await buildDemoPlan(targetBusiness);

  console.log("\n=== DEMO PLAN ===\n");
  console.log(demoPlan);
}

runDemo();