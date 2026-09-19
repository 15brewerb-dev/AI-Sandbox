require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function buildSalesPlan(prospects) {
  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    reasoning: { effort: "low" },

    instructions: `
You are a sales agent.

Your job is to turn a list of researched prospects into a practical outreach plan.

Choose the 3 strongest prospects.

For each one include:
1. Business name
2. Why they should be contacted first
3. One specific public detail to reference
4. A short personalized text/email message
5. A short phone-call opener
6. The most likely objection
7. A concise response to that objection
8. A simple demo or proof-of-concept idea to show them

Important rules:
- Do not claim the business definitely misses calls or has poor follow-up unless that was verified.
- Do not invent facts.
- Keep outreach natural and not overly salesy.
- Focus on getting a short conversation, not closing the entire sale in the first message.
- Keep the output concise.
`,

    input: prospects,
  });

  return response.output_text;
}

module.exports = { buildSalesPlan };