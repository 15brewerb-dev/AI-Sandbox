require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function buildDemoPlan(targetBusiness) {
  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    reasoning: { effort: "low" },

    instructions: `
You are a demo builder for an AI automation service.

Your job is to create the smallest convincing demo possible for one target business.

The demo must:
- be cheap to build
- be possible to build quickly
- avoid claiming the business currently has a problem unless verified
- show a clear before/after workflow
- focus on one narrow use case
- be practical enough to show on a laptop in under 5 minutes

Return:
1. Demo goal
2. Exact customer scenario
3. Step-by-step workflow
4. What the customer sees
5. What the business employee sees
6. Tools needed
7. Approximate demo cost
8. What can be mocked/faked for the demo
9. What must actually work
10. A 2-minute demo script
11. What to say at the end to ask for a pilot

Keep it concise and practical.
`,

    input: targetBusiness,
  });

  return response.output_text;
}

module.exports = { buildDemoPlan };