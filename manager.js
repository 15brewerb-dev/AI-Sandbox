
const fs = require("fs");
const { findProspects } = require("./prospector");
const { researchOpportunity } = require("./researcher");
const { reviewOpportunities } = require("./reviewer");
const { buildOffer } = require("./offerBuilder");
async function runManager() {
  
    const goal =
  "Search the live web for real Columbus, Ohio businesses and business categories showing visible problems I could solve with AI or automation. Prioritize problems involving lead follow-up, missed calls, reviews, Google Business Profiles, websites, customer communication, scheduling, repetitive admin, and content. Find opportunities I can start for under $100, sell for at least a few hundred dollars per customer, and potentially get my first paying customer within 7 to 14 days.";

  console.log("\n=== MANAGER STARTED ===\n");

const research = await researchOpportunity(goal);

console.log("\n=== RESEARCH RESULTS ===\n");
console.log(research);

const review = await reviewOpportunities(research);

console.log("\n=== REVIEWER RESULT ===\n");
console.log(review);

if (!review.trim().toUpperCase().startsWith("PASS")) {
  console.log("\n=== STOPPED: REVIEWER DID NOT PASS THIS OPPORTUNITY ===\n");
  return;
}

const offer = await buildOffer(review);

console.log("\n=== OFFER BUILDER RESULT ===\n");
console.log(offer);
const prospects = await findProspects(offer);

console.log("\n=== PROSPECTOR RESULT ===\n");
console.log(prospects);
const savedResults = `
=== RESEARCH RESULTS ===

${research}

=== REVIEWER RESULT ===

${review}

=== OFFER BUILDER RESULT ===

${offer}

=== PROSPECTOR RESULT ===

${prospects}
`;

fs.writeFileSync("latest-run.txt", savedResults);

console.log("\n=== RESULTS SAVED TO latest-run.txt ===\n");
console.log("\n=== MANAGER FINISHED ===\n");
}

runManager();
