// src/services/embeddingService.js
import dotenv from "dotenv";

dotenv.config();

class EmbeddingService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.model = "sentence-transformers/all-MiniLM-L6-v2";
    this.apiUrl = `https://router.huggingface.co/hf-inference/models/${this.model}/pipeline/feature-extraction`;
  }

  async getEmbedding(text) {
    try {
      console.log(`🔄 Getting embedding for text...`);

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
      console.error("Error getting embedding:", error);
      throw error;
    }
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
            Employee ID: ${employeeId}
            Name: ${name}, Age: ${age}
            Department: ${department}
            Position: ${position}
            Contact: ${email} | ${phone}
            Joined: ${joiningDate}
            Annual Salary: ₹${salary?.toLocaleString() || 0}
            Skills: ${skillsText}
            Performance Rating: ${performance}
            Current Projects: ${projectsText}
            Leave Balance: ${leaveBalance} days
            Location: ${address}
        `.trim();
  }

  async generateEmployeeEmbedding(employeeData) {
    const textRepresentation = this.flattenEmployeeRecord(employeeData);
    console.log(`📝 Generated text for ${employeeData.name}`);
    const embedding = await this.getEmbedding(textRepresentation);
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
//     // ✅ This endpoint is confirmed working
//     this.apiUrl = `https://router.huggingface.co/hf-inference/models/${this.model}/pipeline/feature-extraction`;
//   }

//   async getEmbedding(text) {
//     try {
//       console.log(`🔄 Getting embedding...`);

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
