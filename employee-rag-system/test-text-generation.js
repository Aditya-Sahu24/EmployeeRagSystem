import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.HUGGINGFACE_API_KEY;

async function testModel(modelName) {
  console.log(`\n🔄 Testing model: ${modelName}`);

  const url = `https://router.huggingface.co/hf-inference/models/${modelName}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: "Answer: What is the capital of France?",
        parameters: {
          max_new_tokens: 30,
          temperature: 0.1,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ WORKING! Response:`, data);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ FAILED: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testAllModels() {
  const modelsToTest = [
    "gpt2",
    "HuggingFaceH4/zephyr-7b-beta",
    "microsoft/phi-2",
    "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
  ];

  console.log("🔍 Testing which text generation models work...");

  for (const model of modelsToTest) {
    await testModel(model);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

testAllModels();
