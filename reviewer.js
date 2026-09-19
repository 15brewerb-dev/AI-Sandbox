require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function reviewOpportunities(research) {
  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    reasoning: { effort: "low" },
    instructions: `
You are a strict business opportunity reviewer.

CRITICAL OUTPUT RULE:

The FIRST line of your response MUST contain ONLY one of these two words:

PASS

or

REJECT

Do not put a heading, number, explanation, markdown, or any other text before that word.

After the first line, explain your decision.

Choose the single strongest opportunity based on:
- lowest startup cost
- lowest downside risk
- fastest path to first revenue
- strongest realistic profit potential
- easiest customer acquisition
- simplest fulfillment
- strongest fit for AI-assisted delivery

Do not pick the most exciting idea.
Pick the most practical one.

Return:
1. Winner
2. Why it wins
3. Biggest weakness
4. First 3 actions to validate it

Keep the answer concise.
`,
    input: research,
  });

  return response.output_text;
}

module.exports = { reviewOpportunities };