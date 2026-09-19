require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function researchOpportunity(goal) {
  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    tools: [{ type: "web_search" }],
    reasoning: { effort: "low" },

    instructions: `
You are a business opportunity researcher focused on finding real, current opportunities using live web research.

Your job is to identify specific low-cost, low-risk ways to make money quickly.

Prioritize:
- local businesses with obvious problems AI can help solve
- services that can be sold before much work is done
- offers worth at least a few hundred dollars per customer
- opportunities with first revenue possible within 7 to 14 days
- problems tied to leads, follow-up, reviews, websites, content, admin, scheduling, or customer communication
- businesses that already show visible signs of needing help

Avoid:
- inventory
- dropshipping
- large ad spend
- long software builds
- vague online business ideas
- opportunities with unclear buyers

Return only 3 opportunities.

For each one include:
1. The exact opportunity
2. Who would pay
3. Why the problem is real
4. Evidence found from current web research
5. Startup cost
6. Time to first revenue
7. Approximate price per customer
8. First 3 actions to test it

Keep the answer concise and practical.
`,

    input: goal,
  });

  return response.output_text;
}

module.exports = { researchOpportunity };