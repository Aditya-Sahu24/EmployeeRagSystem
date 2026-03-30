// src/services/embeddingService.js
import dotenv from "dotenv";

dotenv.config();

class EmbeddingService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.model = "sentence-transformers/all-MiniLM-L6-v2";
    this.apiUrl = `https://router.huggingface.co/hf-inference/models/${this.model}/pipeline/feature-extraction`;
    this.useMockEmbeddings = false; // Will be set to true if API fails
  }

  async getEmbedding(text) {
    try {
      // Check if we have a valid API key (not expired and not default)
      if (
        !this.apiKey ||
        this.apiKey === "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" ||
        this.apiKey.includes("YOUR_NEW_TOKEN")
      ) {
        console.warn(
          "⚠️ No valid Hugging Face API key found. Using mock embeddings.",
        );
        this.useMockEmbeddings = true;
        return this.generateMockEmbedding(text);
      }

      console.log(`🔄 Getting embedding from Hugging Face API...`);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            wait_for_model: true,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        // Check if error is due to expired token
        if (response.status === 401) {
          console.error("❌ Hugging Face API token expired or invalid");
          console.log("🔄 Switching to mock embeddings...");
          this.useMockEmbeddings = true;
          return this.generateMockEmbedding(text);
        }

        throw new Error(
          `Hugging Face API error: ${response.status} - ${errorText}`,
        );
      }

      const embedding = await response.json();

      if (Array.isArray(embedding)) {
        console.log(`✅ Got embedding with ${embedding.length} dimensions`);
        return embedding;
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error getting embedding:", error.message);
      console.log("🔄 Falling back to mock embeddings...");
      this.useMockEmbeddings = true;
      return this.generateMockEmbedding(text);
    }
  }

  generateMockEmbedding(text) {
    // Generate a deterministic mock embedding (384 dimensions for all-MiniLM-L6-v2)
    console.log(`🔧 Generating mock embedding (384 dimensions)`);

    const mockEmbedding = new Array(384);

    // Create a hash of the text to make embeddings somewhat deterministic
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    const normalizedHash = Math.abs(hash) / 2147483647;

    // Generate pseudo-random but deterministic values
    for (let i = 0; i < 384; i++) {
      // Use sine wave with different frequencies to create varied values
      const value = Math.sin(normalizedHash * (i + 1) * 0.1) * 0.5 + 0.3;
      // Clamp between 0 and 1
      mockEmbedding[i] = Math.max(0, Math.min(1, value));
    }

    console.log(
      `✅ Generated mock embedding with ${mockEmbedding.length} dimensions`,
    );
    return mockEmbedding;
  }

  flattenEmployeeRecord(record) {
    const {
      employeeId,
      name,
      age,
      department,
      position,
      email,
      phone,
      joiningDate,
      salary,
      skills = [],
      performance,
      projects = [],
      leaveBalance,
      address,
    } = record;

    const skillsText =
      skills.length > 0 ? skills.join(", ") : "No skills listed";
    const projectsText =
      projects.length > 0 ? projects.join(", ") : "No projects assigned";

    return `
Employee ID: ${employeeId || "N/A"}
Name: ${name}, Age: ${age || "N/A"}
Department: ${department}
Position: ${position}
Contact: ${email} | ${phone || "N/A"}
Joined: ${joiningDate || "N/A"}
Annual Salary: ₹${salary?.toLocaleString() || 0}
Skills: ${skillsText}
Performance Rating: ${performance || "Good"}
Current Projects: ${projectsText}
Leave Balance: ${leaveBalance || 15} days
Location: ${address || "N/A"}
    `.trim();
  }

  async generateEmployeeEmbedding(employeeData) {
    const textRepresentation = this.flattenEmployeeRecord(employeeData);
    console.log(`📝 Generated text representation for ${employeeData.name}`);
    console.log(`📄 Text length: ${textRepresentation.length} characters`);

    const embedding = await this.getEmbedding(textRepresentation);

    console.log(`✅ Successfully generated embedding for ${employeeData.name}`);

    return {
      text: textRepresentation,
      embedding,
    };
  }
}

export default new EmbeddingService();

// // src/services/embeddingService.js
// import dotenv from "dotenv";

// dotenv.config();

// class EmbeddingService {
//   constructor() {
//     this.apiKey = process.env.HUGGINGFACE_API_KEY;
//     this.model = "sentence-transformers/all-MiniLM-L6-v2";
//     this.apiUrl = `https://router.huggingface.co/hf-inference/models/${this.model}/pipeline/feature-extraction`;
//   }

//   async getEmbedding(text) {
//     try {
//       console.log(`🔄 Getting embedding for text...`);

//       const response = await fetch(this.apiUrl, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${this.apiKey}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           inputs: text,
//           parameters: {
//             wait_for_model: true,
//           },
//         }),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(
//           `Hugging Face API error: ${response.status} - ${errorText}`,
//         );
//       }

//       const embedding = await response.json();

//       if (Array.isArray(embedding)) {
//         console.log(`✅ Got embedding with ${embedding.length} dimensions`);
//         return embedding;
//       } else {
//         throw new Error("Unexpected response format");
//       }
//     } catch (error) {
//       console.error("Error getting embedding:", error);
//       throw error;
//     }
//   }

//   flattenEmployeeRecord(record) {
//     const {
//       employeeId,
//       name,
//       age,
//       department,
//       position,
//       email,
//       phone,
//       joiningDate,
//       salary,
//       skills = [],
//       performance,
//       projects = [],
//       leaveBalance,
//       address,
//     } = record;

//     const skillsText =
//       skills.length > 0 ? skills.join(", ") : "No skills listed";
//     const projectsText =
//       projects.length > 0 ? projects.join(", ") : "No projects assigned";

//     return `
//             Employee ID: ${employeeId}
//             Name: ${name}, Age: ${age}
//             Department: ${department}
//             Position: ${position}
//             Contact: ${email} | ${phone}
//             Joined: ${joiningDate}
//             Annual Salary: ₹${salary?.toLocaleString() || 0}
//             Skills: ${skillsText}
//             Performance Rating: ${performance}
//             Current Projects: ${projectsText}
//             Leave Balance: ${leaveBalance} days
//             Location: ${address}
//         `.trim();
//   }

//   async generateEmployeeEmbedding(employeeData) {
//     const textRepresentation = this.flattenEmployeeRecord(employeeData);
//     console.log(`📝 Generated text for ${employeeData.name}`);
//     const embedding = await this.getEmbedding(textRepresentation);
//     return {
//       text: textRepresentation,
//       embedding,
//     };
//   }
// }

// export default new EmbeddingService();
