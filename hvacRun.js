const { buildOffer } = require("./offerBuilder");
const { findProspects } = require("./prospector");

async function runHVAC() {
  const opportunity = `
Missed-call and estimate-follow-up system for Columbus HVAC companies.

Problem:
HVAC businesses can lose valuable leads when calls go unanswered or estimates are not followed up quickly.

Desired solution:
A simple low-cost system that helps capture missed-call leads, sends a fast follow-up, alerts staff, and helps follow up on estimates.

Keep the offer practical, low-risk, and easy to sell.
`;

  console.log("\n=== BUILDING HVAC OFFER ===\n");

  const offer = await buildOffer(opportunity);

  console.log("\n=== HVAC OFFER ===\n");
  console.log(offer);

  console.log("\n=== FINDING HVAC PROSPECTS ===\n");

  const prospects = await findProspects(offer);

  console.log("\n=== HVAC PROSPECTS ===\n");
  console.log(prospects);
}

runHVAC();