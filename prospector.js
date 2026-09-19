require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function findProspects(offer) {
  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    tools: [{ type: "web_search" }],
    reasoning: { effort: "low" },

    instructions: `
You are a prospecting agent.

Your job is to find real Columbus, Ohio-area businesses that are strong prospects for the offer provided.

Use live web research.

Return only 5 prospects.

For each prospect include:
1. Business name
2. City/suburb
3. Website URL, or clearly state if no website was found
4. Public phone number or public contact method if available
5. The specific visible problem that makes them a prospect
6. Why this offer could help them
7. Priority: HIGH, MEDIUM, or LOW
8. Source URLs supporting your findings

Rules:
- Do not invent businesses, contact information, or problems.
- Use only information you can verify from current web sources.
- Prefer owner-operated or small local businesses.
- Prefer businesses where the problem is obvious enough to personalize outreach.
- Do not contact anyone.
- Keep the answer concise to control API cost.
`,

    input: offer,
  });

  return response.output_text;
}

module.exports = { findProspects };