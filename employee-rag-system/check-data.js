import database from "./src/config/database.js";

async function checkData() {
  await database.connect();
  const collection = await database.getCollection("employee_embeddings");

  // Check if any documents exist
  const count = await collection.countDocuments();
  console.log(`📊 Total documents: ${count}`);

  if (count > 0) {
    // Check one document to see if it has embedding
    const sample = await collection.findOne();
    console.log("📝 Sample document:", {
      name: sample.name,
      hasEmbedding: !!sample.embedding,
      embeddingLength: sample.embedding?.length,
      textPreview: sample.text?.substring(0, 200),
    });

    // Check if vector search index exists
    const indexes = await collection.listIndexes().toArray();
    const vectorIndex = indexes.find(
      (idx) => idx.name === "employee_vector_index",
    );
    console.log("🔍 Vector index exists:", !!vectorIndex);
  }

  await database.disconnect();
}

checkData();
