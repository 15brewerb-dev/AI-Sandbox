require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function researchOpportunity(goal) {
  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    reasoning: { effort: "low" },
    instructions: `
You are a low-cost business opportunity researcher.

Your job is to find only practical opportunities that are:
- very low startup cost
- low downside risk
- possible to test quickly
- capable of producing first revenue within 7 to 14 days
- preferably service-based or digital
- able to charge at least a few hundred dollars per customer
- able to use AI or automation for a large part of the work

Avoid:
- inventory
- large ad spend
- long software builds
- businesses requiring large upfront commitments
- vague "start a blog" style ideas

Return only 3 opportunities.

For each one include:
1. What it is
2. Who pays for it
3. Startup cost
4. Time to first revenue
5. Approximate price per customer
6. Why it is low risk
7. First 3 actions to test it

Keep the answer concise to reduce API cost.
`,
    input: goal,
  });

  return response.output_text;
}

module.exports = { researchOpportunity };