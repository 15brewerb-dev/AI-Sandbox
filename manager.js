const fs = require("fs");
const { researchOpportunity } = require("./researcher");
const { reviewOpportunities } = require("./reviewer");
const { buildOffer } = require("./offerBuilder");
async function runManager() {
  const goal =
    'Find the best low-risk, low-startup-cost business opportunities I can test quickly and realistically monetize within 7 to 14 days.';

  console.log("\n=== MANAGER STARTED ===\n");

const research = await researchOpportunity(goal);

console.log("\n=== RESEARCH RESULTS ===\n");
console.log(research);

const review = await reviewOpportunities(research);

console.log("\n=== REVIEWER RESULT ===\n");
console.log(review);
const offer = await buildOffer(review);

console.log("\n=== OFFER BUILDER RESULT ===\n");
console.log(offer);
const savedResults = `
=== RESEARCH RESULTS ===

${research}

=== REVIEWER RESULT ===

${review}

=== OFFER BUILDER RESULT ===

${offer}
`;

fs.writeFileSync("latest-run.txt", savedResults);

console.log("\n=== RESULTS SAVED TO latest-run.txt ===\n");
console.log("\n=== MANAGER FINISHED ===\n");
}

runManager();
