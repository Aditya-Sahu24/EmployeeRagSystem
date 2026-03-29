import dotenv from "dotenv";
dotenv.config();

async function testEmbedding() {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const model = "sentence-transformers/all-MiniLM-L6-v2";

  console.log("🔄 Testing Hugging Face Embedding API...");
  console.log(`Model: ${model}`);

  // ✅ CORRECT URL for feature extraction
  const url = `https://router.huggingface.co/hf-inference/models/${model}/pipeline/feature-extraction`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: "Test employee: John works in engineering",
    }),
  });

  if (response.ok) {
    const embedding = await response.json();
    console.log("✅ Embedding API is working!");
    console.log(`📊 Embedding dimensions: ${embedding.length}`);
  } else {
    const error = await response.text();
    console.error("❌ API Error:", response.status, error);
  }
}

async function testTextGeneration() {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const model = "google/flan-t5-large";

  console.log("\n🔄 Testing Hugging Face Text Generation API...");

  const url = `https://router.huggingface.co/hf-inference/models/${model}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: "Answer: What is 2+2?",
      parameters: {
        max_new_tokens: 20,
      },
    }),
  });

  if (response.ok) {
    const result = await response.json();
    console.log("✅ Text Generation API is working!");
    console.log(`Response: ${JSON.stringify(result)}`);
  } else {
    const error = await response.text();
    console.error("❌ API Error:", response.status, error);
  }
}

async function testAll() {
  await testEmbedding();
  await testTextGeneration();
}

testAll();
