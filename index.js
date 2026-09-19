require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const goal =
  "Find 3 realistic ways I could use AI to make money online within 30 days with a small startup budget.";

async function main() {
  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    reasoning: { effort: "low" },
    instructions: `
You are my Opportunity Scout agent.

Your job is to evaluate practical money-making opportunities.

For every idea:
- explain what the opportunity is
- explain who would pay for it
- estimate startup cost
- estimate time to first revenue
- list the first 3 actions to take
- explain the biggest risk
- do not hype weak ideas
- prioritize realistic, low-cost, fast-to-test opportunities

Keep the answer clear and practical.
`,
    input: goal,
  });

  console.log("\n=== OPPORTUNITY SCOUT ===\n");
  console.log(response.output_text);
}

main();