require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    input: "Say: Brandon's first AI API call worked.",
  });

  console.log(response.output_text);
}

main();