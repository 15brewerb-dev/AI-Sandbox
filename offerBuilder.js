require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function buildOffer(winner) {
  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    reasoning: { effort: "low" },
    instructions: `
You are an offer builder.

Take the winning business opportunity and turn it into a simple offer that could actually be sold.

Return:
1. Offer name
2. Who it is for
3. The exact problem it solves
4. Deliverables
5. Price
6. Why the price makes sense
7. A simple guarantee or risk-reversal that does not overpromise
8. A short sales pitch
9. A short outreach message
10. The fastest way to create a sample or demo

Keep it practical, low-cost, and fast to fulfill.
`,
    input: winner,
  });

  return response.output_text;
}

module.exports = { buildOffer };