// src/services/llmService.js
import dotenv from "dotenv";
dotenv.config();

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Use HF Router — current supported endpoint
const HF_MODEL = "meta-llama/Llama-3.1-8B-Instruct:cerebras";
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";

class LLMService {
  // ─── Build structured employee context string ────────────────────────────────
  buildEmployeeContext(employees) {
    if (!employees || employees.length === 0)
      return "No employee records available.";

    return employees
      .map((emp, i) => {
        const salary = emp.salary
          ? `₹${Number(emp.salary).toLocaleString("en-IN")}`
          : "Not disclosed";
        const skills = emp.skills?.join(", ") || "None listed";
        const projects = emp.projects?.join(", ") || "None assigned";

        return [
          `[Employee ${i + 1}]`,
          `ID: ${emp.employeeId || "N/A"} | Name: ${emp.name || "N/A"} | Age: ${emp.age ?? "N/A"}`,
          `Department: ${emp.department || "N/A"} | Position: ${emp.position || "N/A"}`,
          `Email: ${emp.email || "N/A"} | Phone: ${emp.phone || "N/A"}`,
          `Address: ${emp.address || "N/A"}`,
          `Joining Date: ${emp.joiningDate || "N/A"}`,
          `Annual Salary: ${salary}`,
          `Skills: ${skills}`,
          `Performance: ${emp.performance || "N/A"}`,
          `Projects: ${projects}`,
          `Leave Balance: ${emp.leaveBalance ?? "N/A"} days`,
        ].join("\n");
      })
      .join("\n\n");
  }

  // ─── Pre-compute analytics so LLM uses exact numbers, not hallucinated ones ──
  buildAnalyticsSummary(employees) {
    if (!employees || employees.length === 0) return "";

    const total = employees.length;

    // Department distribution
    const deptMap = {};
    employees.forEach((e) => {
      if (e.department)
        deptMap[e.department] = (deptMap[e.department] || 0) + 1;
    });

    // Performance distribution
    const perfMap = {};
    employees.forEach((e) => {
      if (e.performance)
        perfMap[e.performance] = (perfMap[e.performance] || 0) + 1;
    });

    // Salary stats
    const salaries = employees
      .map((e) => Number(e.salary) || 0)
      .filter((s) => s > 0);
    const avgSalary = salaries.length
      ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
      : 0;
    const maxSalary = salaries.length ? Math.max(...salaries) : 0;
    const minSalary = salaries.length ? Math.min(...salaries) : 0;
    const totalPayroll = salaries.reduce((a, b) => a + b, 0);
    const highestPaid = employees.find((e) => Number(e.salary) === maxSalary);
    const lowestPaid = employees.find((e) => Number(e.salary) === minSalary);

    // Seniority
    const withDates = employees.filter((e) => e.joiningDate);
    const sortedByDate = [...withDates].sort(
      (a, b) => new Date(a.joiningDate) - new Date(b.joiningDate),
    );
    const mostSenior = sortedByDate[0];
    const newest = sortedByDate[sortedByDate.length - 1];

    // Skills frequency
    const skillFreq = {};
    employees.forEach((e) =>
      (e.skills || []).forEach((s) => (skillFreq[s] = (skillFreq[s] || 0) + 1)),
    );
    const topSkills = Object.entries(skillFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => `${skill}(${count})`)
      .join(", ");

    // Leave stats
    const leaveValues = employees.map((e) => e.leaveBalance ?? 0);
    const avgLeave = Math.round(leaveValues.reduce((a, b) => a + b, 0) / total);
    const minLeave = Math.min(...leaveValues);
    const maxLeave = Math.max(...leaveValues);

    // Age stats
    const ages = employees.map((e) => e.age || 0).filter((a) => a > 0);
    const avgAge = ages.length
      ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length)
      : 0;

    return `
=== PRE-COMPUTED ANALYTICS (use these exact numbers — do NOT recalculate) ===
Total Employees       : ${total}
Departments           : ${Object.keys(deptMap).join(", ")}
Department Breakdown  : ${Object.entries(deptMap)
      .map(([d, c]) => `${d}: ${c}`)
      .join(" | ")}
Performance Breakdown : ${Object.entries(perfMap)
      .map(([p, c]) => `${p}: ${c}`)
      .join(" | ")}
Average Age           : ${avgAge} years
Average Annual Salary : ₹${avgSalary.toLocaleString("en-IN")}
Highest Salary        : ₹${maxSalary.toLocaleString("en-IN")} — ${highestPaid?.name || "N/A"}
Lowest Salary         : ₹${minSalary.toLocaleString("en-IN")} — ${lowestPaid?.name || "N/A"}
Total Annual Payroll  : ₹${totalPayroll.toLocaleString("en-IN")}
Total Monthly Payroll : ₹${Math.round(totalPayroll / 12).toLocaleString("en-IN")}
Most Senior Employee  : ${mostSenior?.name || "N/A"} (Joined: ${mostSenior?.joiningDate || "N/A"})
Newest Employee       : ${newest?.name || "N/A"} (Joined: ${newest?.joiningDate || "N/A"})
Top Skills            : ${topSkills}
Avg Leave Balance     : ${avgLeave} days | Min: ${minLeave} | Max: ${maxLeave}
=============================================================================
`.trim();
  }

  // ─── Call Hugging Face Inference API (OpenAI-compatible chat completions) ────
  async callHuggingFaceAPI(messages, maxTokens = 1200) {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature: 0.2, // Low = factual, consistent
        top_p: 0.9,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Hugging Face API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from Hugging Face API");
    return content.trim();
  }

  // ─── Main entry point — called by RAGController ──────────────────────────────
  async getAnswerWithContext(query, employees) {
    const employeeContext = this.buildEmployeeContext(employees);
    const analyticsSummary = this.buildAnalyticsSummary(employees);

    const systemPrompt = `You are an expert HR Assistant and People Analytics specialist.
You have full access to the company's employee database. Answer all HR, management, payroll, and analytics questions accurately.

STRICT RULES:
- Use ONLY the data provided below. Never invent or estimate any value.
- For analytics/summary queries, use the PRE-COMPUTED ANALYTICS section — do NOT recalculate.
- For salary questions: always state the exact salary in ₹ Indian Rupee format with commas (e.g. ₹7,50,000).
- For individual employee queries: show all relevant fields (salary, leave, performance, skills, contact, projects).
- For department queries: list all employees in that department with their salary, performance, and skills.
- For skill queries: list every employee who has that skill.
- For payroll/budget queries: use the pre-computed total payroll figures.
- Format responses clearly — use bullet points, sections, or tables where helpful.
- Keep the tone professional and concise.

${analyticsSummary}

EMPLOYEE RECORDS:
${employeeContext}`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: query },
    ];

    try {
      console.log(`🤖 Sending to HF LLM: "${query}"`);
      const answer = await this.callHuggingFaceAPI(messages);
      console.log("✅ LLM response received");
      return answer;
    } catch (error) {
      console.error(
        "❌ HF LLM failed, using rule-based fallback:",
        error.message,
      );
      return this.fallbackResponse(query, employees);
    }
  }

  // ─── Rule-based fallback (only used when HF API is unavailable) ─────────────
  fallbackResponse(query, employees) {
    const q = query.toLowerCase();

    // Analytics / report
    if (
      q.includes("analytics") ||
      q.includes("report") ||
      q.includes("summary") ||
      q.includes("statistics")
    ) {
      return this.fallbackAnalytics(employees);
    }

    // Salary
    if (
      q.includes("salary") ||
      q.includes("pay") ||
      q.includes("ctc") ||
      q.includes("payroll")
    ) {
      return this.fallbackSalaryReport(employees, q);
    }

    // Leave
    if (q.includes("leave") || q.includes("balance")) {
      return this.fallbackLeaveReport(employees);
    }

    // Department
    const depts = [
      ...new Set(employees.map((e) => e.department).filter(Boolean)),
    ];
    for (const dept of depts) {
      if (q.includes(dept.toLowerCase())) {
        return this.getDepartmentInfo(
          dept,
          employees.filter(
            (e) => e.department?.toLowerCase() === dept.toLowerCase(),
          ),
        );
      }
    }

    // Specific employee by name
    for (const emp of employees) {
      if (emp.name && q.includes(emp.name.toLowerCase())) {
        return this.getCompleteDetails(emp);
      }
    }

    // Specific employee by ID
    const empIdMatch = query.match(/EMP\d+/i);
    if (empIdMatch) {
      const emp = employees.find(
        (e) => e.employeeId?.toUpperCase() === empIdMatch[0].toUpperCase(),
      );
      if (emp) return this.getCompleteDetails(emp);
    }

    // Skills
    const skillKeywords = [
      "react",
      "node",
      "python",
      "javascript",
      "mongodb",
      "sql",
      "aws",
      "docker",
      "seo",
      "java",
      "typescript",
      "figma",
      "flutter",
    ];
    for (const skill of skillKeywords) {
      if (q.includes(skill)) {
        const skilled = employees.filter((e) =>
          e.skills?.some((s) => s.toLowerCase().includes(skill)),
        );
        if (skilled.length > 0) {
          return (
            `**Employees with ${skill.toUpperCase()} skill (${skilled.length}):**\n\n` +
            skilled
              .map(
                (e) =>
                  `• **${e.name}** — ${e.position} (${e.department})\n  Skills: ${e.skills?.join(", ")}\n  Salary: ₹${Number(e.salary).toLocaleString("en-IN")}`,
              )
              .join("\n\n")
          );
        }
        return `No employees found with ${skill} skill.`;
      }
    }

    // All employees
    if (
      q.includes("all employee") ||
      q.includes("list all") ||
      q.includes("everyone")
    ) {
      return this.getAllEmployeesDetails(employees);
    }

    return this.getGeneralResponse(employees);
  }

  // ─── Fallback formatters ─────────────────────────────────────────────────────

  fallbackAnalytics(employees) {
    const summary = this.buildAnalyticsSummary(employees);
    const dir = employees
      .map(
        (e) =>
          `• ${e.name} — ${e.position} (${e.department}) | ₹${Number(e.salary).toLocaleString("en-IN")} | ${e.performance}`,
      )
      .join("\n");
    return `📊 **EMPLOYEE ANALYTICS REPORT**\n\n${summary}\n\n**Employee Directory:**\n${dir}`;
  }

  fallbackSalaryReport(employees, q) {
    const sorted = [...employees].sort(
      (a, b) => (Number(b.salary) || 0) - (Number(a.salary) || 0),
    );
    const salaries = employees
      .map((e) => Number(e.salary) || 0)
      .filter((s) => s > 0);
    const avg = Math.round(
      salaries.reduce((a, b) => a + b, 0) / (salaries.length || 1),
    );
    const total = salaries.reduce((a, b) => a + b, 0);

    let response = `💰 **SALARY REPORT**\n\n`;
    if (q.includes("highest") || q.includes("top")) {
      response += `**Top 5 Highest Paid:**\n`;
      sorted
        .slice(0, 5)
        .forEach(
          (e, i) =>
            (response += `${i + 1}. ${e.name} — ₹${Number(e.salary).toLocaleString("en-IN")} (${e.position})\n`),
        );
    } else if (q.includes("lowest") || q.includes("least")) {
      response += `**5 Lowest Paid:**\n`;
      sorted
        .slice(-5)
        .reverse()
        .forEach(
          (e, i) =>
            (response += `${i + 1}. ${e.name} — ₹${Number(e.salary).toLocaleString("en-IN")} (${e.position})\n`),
        );
    } else {
      sorted.forEach(
        (e) =>
          (response += `• ${e.name} (${e.department}) — ₹${Number(e.salary).toLocaleString("en-IN")}\n`),
      );
      response += `\n**Average:** ₹${avg.toLocaleString("en-IN")}`;
      response += `\n**Total Annual Payroll:** ₹${total.toLocaleString("en-IN")}`;
      response += `\n**Total Monthly Payroll:** ₹${Math.round(total / 12).toLocaleString("en-IN")}`;
    }
    return response;
  }

  fallbackLeaveReport(employees) {
    const sorted = [...employees].sort(
      (a, b) => (b.leaveBalance ?? 0) - (a.leaveBalance ?? 0),
    );
    return (
      `🏖️ **LEAVE BALANCE REPORT**\n\n` +
      sorted
        .map(
          (e) =>
            `• ${e.name} (${e.department}) — ${e.leaveBalance ?? 0} days remaining`,
        )
        .join("\n")
    );
  }

  getAllEmployeesDetails(employees) {
    return (
      `📋 **ALL EMPLOYEES (${employees.length} total)**\n\n` +
      employees
        .map(
          (emp, i) =>
            `${i + 1}. **${emp.name}** (${emp.employeeId})\n` +
            `   ${emp.position} | ${emp.department}\n` +
            `   Salary: ₹${Number(emp.salary).toLocaleString("en-IN")} | Performance: ${emp.performance}\n` +
            `   Leave: ${emp.leaveBalance} days | Skills: ${emp.skills?.join(", ") || "None"}\n` +
            `   Email: ${emp.email} | Phone: ${emp.phone || "N/A"}`,
        )
        .join("\n\n")
    );
  }

  getCompleteDetails(emp) {
    return `📋 **${emp.name}** (${emp.employeeId})

🏢 Department  : ${emp.department}
💼 Position    : ${emp.position}
📅 Joined      : ${emp.joiningDate} | Experience: ${this.calculateExperience(emp.joiningDate)}
💰 Salary      : ₹${Number(emp.salary).toLocaleString("en-IN")} per annum
⭐ Performance  : ${emp.performance}
🏖️ Leave Left   : ${emp.leaveBalance ?? "N/A"} days
🛠️ Skills       : ${emp.skills?.join(", ") || "None listed"}
📁 Projects    : ${emp.projects?.join(", ") || "None assigned"}
📧 Email       : ${emp.email}
📱 Phone       : ${emp.phone || "N/A"}
📍 Address     : ${emp.address || "N/A"}
🎂 Age         : ${emp.age ?? "N/A"} years`;
  }

  getDepartmentInfo(department, employees) {
    const salaries = employees
      .map((e) => Number(e.salary) || 0)
      .filter((s) => s > 0);
    const avgSalary = salaries.length
      ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
      : 0;
    const totalSalary = salaries.reduce((a, b) => a + b, 0);

    return (
      `🏢 **${department.toUpperCase()} DEPARTMENT** (${employees.length} employees)\n` +
      `Avg Salary: ₹${avgSalary.toLocaleString("en-IN")} | Total Payroll: ₹${totalSalary.toLocaleString("en-IN")}\n\n` +
      employees
        .map(
          (emp) =>
            `• **${emp.name}** — ${emp.position}\n` +
            `  Salary: ₹${Number(emp.salary).toLocaleString("en-IN")} | Performance: ${emp.performance}\n` +
            `  Skills: ${emp.skills?.join(", ") || "None"} | Leave: ${emp.leaveBalance} days`,
        )
        .join("\n\n")
    );
  }

  getGeneralResponse(employees) {
    return (
      `Found ${employees.length} employee(s). Try asking:\n` +
      `• "Show salary report" or "Who has the highest salary?"\n` +
      `• "Generate analytics report"\n` +
      `• "List all employees"\n` +
      `• "Who works in Engineering?"\n` +
      `• "Who knows Python?"\n` +
      `• "Show leave balances"\n` +
      `• "Show details for [employee name]"`
    );
  }

  calculateExperience(joiningDate) {
    if (!joiningDate) return "N/A";
    const joined = new Date(joiningDate);
    const now = new Date();
    let years = now.getFullYear() - joined.getFullYear();
    let months = now.getMonth() - joined.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years === 0) return `${months} month${months !== 1 ? "s" : ""}`;
    return `${years} year${years !== 1 ? "s" : ""}${months > 0 ? ` ${months} month${months !== 1 ? "s" : ""}` : ""}`;
  }
}

export default new LLMService();

// // src/services/llmService.js
// import dotenv from "dotenv";

// dotenv.config();

// class LLMService {
//   async getAnswerWithContext(query, employees) {
//     const lowerQuery = query.toLowerCase();

//     // ============= ANALYTICS & REPORT QUERIES =============
//     if (
//       lowerQuery.includes("analytics") ||
//       lowerQuery.includes("report") ||
//       lowerQuery.includes("summary")
//     ) {
//       return this.generateAnalyticsReport(employees);
//     }

//     // ============= ALL EMPLOYEES QUERIES =============
//     if (
//       lowerQuery.includes("all employee") ||
//       lowerQuery.includes("everyone") ||
//       lowerQuery.includes("list all")
//     ) {
//       return this.getAllEmployeesDetails(employees);
//     }

//     // ============= SENIOR/MOST EXPERIENCED QUERIES =============
//     if (
//       lowerQuery.includes("most senior") ||
//       lowerQuery.includes("most experienced") ||
//       lowerQuery.includes("oldest")
//     ) {
//       return this.getMostSeniorEmployee(employees);
//     }

//     // ============= SPECIFIC SKILL QUERIES =============
//     if (
//       lowerQuery.includes("skill") &&
//       (lowerQuery.includes("of him") ||
//         lowerQuery.includes("his skills") ||
//         lowerQuery.includes("his skill"))
//     ) {
//       // Handle "skills of him" type queries
//       const lastMentionedEmployee = this.findLastMentionedEmployee(
//         query,
//         employees,
//       );
//       if (lastMentionedEmployee) {
//         return this.getSkillsInfo(lastMentionedEmployee);
//       }
//     }

//     // Extract specific skill from query (e.g., "who knows React?")
//     const skillKeywords = [
//       "react",
//       "node",
//       "python",
//       "javascript",
//       "mongodb",
//       "sql",
//       "aws",
//       "docker",
//       "seo",
//       "marketing",
//       "recruitment",
//     ];
//     for (const skill of skillKeywords) {
//       if (lowerQuery.includes(skill)) {
//         return this.getEmployeesBySkill(employees, skill);
//       }
//     }

//     // ============= SINGLE EMPLOYEE QUERIES =============
//     // Check for specific employee name
//     for (const emp of employees) {
//       if (lowerQuery.includes(emp.name.toLowerCase())) {
//         // Check what type of information is requested
//         if (lowerQuery.includes("skill")) {
//           return this.getSkillsInfo(emp);
//         } else if (
//           lowerQuery.includes("contact") ||
//           lowerQuery.includes("phone") ||
//           lowerQuery.includes("email")
//         ) {
//           return this.getContactInfo(emp);
//         } else if (lowerQuery.includes("performance")) {
//           return this.getPerformanceInfo(emp);
//         } else {
//           return this.getCompleteDetails(emp);
//         }
//       }
//     }

//     // Check for employee ID
//     const empIdMatch = query.match(/EMP\d+/i);
//     if (empIdMatch) {
//       const emp = employees.find((e) => e.employeeId === empIdMatch[0]);
//       if (emp) return this.getCompleteDetails(emp);
//     }

//     // ============= DEPARTMENT QUERIES =============
//     const departments = [
//       "engineering",
//       "marketing",
//       "human resources",
//       "hr",
//       "sales",
//       "finance",
//     ];
//     for (const dept of departments) {
//       if (lowerQuery.includes(dept)) {
//         const deptEmployees = employees.filter(
//           (e) => e.department && e.department.toLowerCase().includes(dept),
//         );
//         if (deptEmployees.length > 0) {
//           return this.getDepartmentInfo(dept, deptEmployees);
//         }
//       }
//     }

//     // ============= GENERAL QUERIES =============
//     return this.getGeneralResponse(query, employees);
//   }

//   // Generate comprehensive analytics report
//   generateAnalyticsReport(employees) {
//     if (employees.length === 0) {
//       return "No employee data available for analytics.";
//     }

//     const totalEmployees = employees.length;
//     const departments = [...new Set(employees.map((e) => e.department))];
//     const avgAge = Math.round(
//       employees.reduce((sum, e) => sum + (e.age || 0), 0) / totalEmployees,
//     );
//     const avgSalary =
//       employees.reduce((sum, e) => sum + (e.salary || 0), 0) / totalEmployees;

//     // Department distribution
//     const deptCount = {};
//     employees.forEach((e) => {
//       deptCount[e.department] = (deptCount[e.department] || 0) + 1;
//     });

//     // Performance distribution
//     const perfCount = {};
//     employees.forEach((e) => {
//       perfCount[e.performance] = (perfCount[e.performance] || 0) + 1;
//     });

//     // Skills summary
//     const allSkills = [];
//     employees.forEach((e) => {
//       if (e.skills) allSkills.push(...e.skills);
//     });
//     const uniqueSkills = [...new Set(allSkills)];

//     // Find most senior (oldest joining)
//     const sortedByJoining = [...employees].sort(
//       (a, b) => new Date(a.joiningDate) - new Date(b.joiningDate),
//     );
//     const mostSenior = sortedByJoining[0];

//     // Find highest paid
//     const sortedBySalary = [...employees].sort(
//       (a, b) => (b.salary || 0) - (a.salary || 0),
//     );
//     const highestPaid = sortedBySalary[0];

//     let report = `📊 **COMPREHENSIVE EMPLOYEE ANALYTICS REPORT**
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 📈 **OVERVIEW STATISTICS**
// • Total Employees: ${totalEmployees}
// • Departments: ${departments.length}
// • Average Age: ${avgAge} years
// • Average Salary: ₹${avgSalary.toLocaleString()}
// • Total Skills: ${uniqueSkills.length}

// 🏢 **DEPARTMENT BREAKDOWN**
// ${Object.entries(deptCount)
//   .map(
//     ([dept, count]) =>
//       `• ${dept}: ${count} employee(s) (${Math.round((count / totalEmployees) * 100)}%)`,
//   )
//   .join("\n")}

// ⭐ **PERFORMANCE RATINGS**
// ${Object.entries(perfCount)
//   .map(([perf, count]) => `• ${perf}: ${count} employee(s)`)
//   .join("\n")}

// 💡 **TOP SKILLS IN COMPANY**
// ${uniqueSkills
//   .slice(0, 10)
//   .map((skill) => `• ${skill}`)
//   .join("\n")}

// 🏆 **KEY HIGHLIGHTS**
// • Most Senior Employee: ${mostSenior?.name} (Joined: ${mostSenior?.joiningDate})
// • Highest Paid: ${highestPaid?.name} (₹${highestPaid?.salary?.toLocaleString()})
// • Most Skilled: ${this.getMostSkilledEmployee(employees)?.name}

// 📋 **EMPLOYEE DIRECTORY**
// ${employees.map((e) => `• ${e.name} - ${e.position} (${e.department})`).join("\n")}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// For specific employee details, ask "Show details about [employee name]"`;

//     return report;
//   }

//   // Get all employees details in a formatted list
//   getAllEmployeesDetails(employees) {
//     if (employees.length === 0) {
//       return "No employees found in the database.";
//     }

//     let response = `📋 **ALL EMPLOYEES DIRECTORY** (${employees.length} employees)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

//     employees.forEach((emp, index) => {
//       response += `${index + 1}. **${emp.name}** (${emp.employeeId})
//    • Position: ${emp.position}
//    • Department: ${emp.department}
//    • Email: ${emp.email}
//    • Phone: ${emp.phone || "Not provided"}
//    • Skills: ${emp.skills?.join(", ") || "No skills listed"}
//    • Performance: ${emp.performance}
//    • Salary: ₹${emp.salary?.toLocaleString()}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
//     });

//     response += `\n💡 Tip: Ask "Show details about [employee name]" for more information.`;
//     return response;
//   }

//   // Get most senior employee
//   getMostSeniorEmployee(employees) {
//     if (employees.length === 0) return "No employees found.";

//     // Sort by joining date (oldest first)
//     const sorted = [...employees].sort(
//       (a, b) => new Date(a.joiningDate) - new Date(b.joiningDate),
//     );

//     const mostSenior = sorted[0];

//     let response = `🏆 **MOST SENIOR EMPLOYEE**
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 👤 **${mostSenior.name}**
// • Employee ID: ${mostSenior.employeeId}
// • Position: ${mostSenior.position}
// • Department: ${mostSenior.department}
// • Joined: ${mostSenior.joiningDate}
// • Experience: ${this.calculateExperience(mostSenior.joiningDate)}
// • Performance: ${mostSenior.performance}

// 💼 **Other Senior Employees:**
// ${sorted
//   .slice(1, 4)
//   .map(
//     (emp, i) =>
//       `${i + 1}. ${emp.name} - ${emp.position} (Joined: ${emp.joiningDate})`,
//   )
//   .join("\n")}`;

//     return response;
//   }

//   // Get employees by specific skill
//   getEmployeesBySkill(employees, skill) {
//     const skilledEmployees = employees.filter(
//       (e) =>
//         e.skills &&
//         e.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase())),
//     );

//     if (skilledEmployees.length === 0) {
//       return `No employees found with ${skill} skills.`;
//     }

//     let response = `💡 **Employees with ${skill.toUpperCase()} Skills**
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

//     skilledEmployees.forEach((emp) => {
//       response += `• **${emp.name}** (${emp.position})
//    Department: ${emp.department}
//    All Skills: ${emp.skills?.join(", ")}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
//     });

//     return response;
//   }

//   // Get most skilled employee
//   getMostSkilledEmployee(employees) {
//     return employees.reduce(
//       (max, emp) =>
//         (emp.skills?.length || 0) > (max.skills?.length || 0) ? emp : max,
//       employees[0],
//     );
//   }

//   getContactInfo(emp) {
//     return `📞 **Contact Information for ${emp.name}**\n\n📧 Email: ${emp.email}\n📱 Phone: ${emp.phone || "Not provided"}\n📍 Location: ${emp.address || "Not specified"}`;
//   }

//   getSkillsInfo(emp) {
//     const skills = emp.skills || [];
//     if (skills.length === 0) {
//       return `${emp.name} has no skills listed in the database. Please update their profile with skills.`;
//     }
//     return `💡 **Skills of ${emp.name}**\n\n${emp.name} (${emp.position}) has expertise in:\n${skills.map((s) => `• ${s}`).join("\n")}`;
//   }

//   getPerformanceInfo(emp) {
//     const performanceEmoji = {
//       Outstanding: "🌟",
//       Excellent: "⭐",
//       Good: "👍",
//       Average: "📊",
//     };
//     const emoji = performanceEmoji[emp.performance] || "📈";
//     return `${emoji} **Performance Rating for ${emp.name}**\n\nRating: ${emp.performance}\nPosition: ${emp.position}\nDepartment: ${emp.department}`;
//   }

//   getCompleteDetails(emp) {
//     return `📋 **Complete Employee Details: ${emp.name}**
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 🆔 **Basic Information**
//    • Employee ID: ${emp.employeeId}
//    • Name: ${emp.name}
//    • Age: ${emp.age} years
//    • Location: ${emp.address || "Not specified"}

// 💼 **Employment Details**
//    • Department: ${emp.department}
//    • Position: ${emp.position}
//    • Joined: ${emp.joiningDate}
//    • Experience: ${this.calculateExperience(emp.joiningDate)}

// 💰 **Compensation**
//    • Annual Salary: ₹${emp.salary?.toLocaleString() || "N/A"}
//    • Leave Balance: ${emp.leaveBalance} days

// 🎯 **Skills & Performance**
//    • Skills: ${emp.skills?.join(", ") || "No skills listed"}
//    • Performance Rating: ${emp.performance}
//    • Projects: ${emp.projects?.join(", ") || "No projects assigned"}

// 📞 **Contact**
//    • Email: ${emp.email}
//    • Phone: ${emp.phone || "Not provided"}`;
//   }

//   getDepartmentInfo(department, employees) {
//     let response = `🏢 **${department.toUpperCase()} DEPARTMENT**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
//     response += `Total Employees: ${employees.length}\n\n`;
//     response += `**Team Members:**\n`;

//     employees.forEach((emp) => {
//       response += `• ${emp.name} - ${emp.position}\n`;
//       response += `  Skills: ${emp.skills?.join(", ") || "No skills"}\n`;
//       response += `  Performance: ${emp.performance}\n\n`;
//     });

//     return response;
//   }

//   getGeneralResponse(query, employees) {
//     if (employees.length === 0) {
//       return "No employees found matching your query. Please try a different question.";
//     }

//     // Find last mentioned employee for context
//     const lastMentioned = this.findLastMentionedEmployee(query, employees);

//     if (lastMentioned && (query.includes("him") || query.includes("his"))) {
//       return this.getCompleteDetails(lastMentioned);
//     }

//     let response = `📊 **Found ${employees.length} employee(s)**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

//     employees.forEach((emp) => {
//       response += `**${emp.name}** (${emp.employeeId})
//    • Position: ${emp.position}
//    • Department: ${emp.department}
//    • Email: ${emp.email}
//    • Skills: ${emp.skills?.join(", ") || "None"}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
//     });

//     response += `\n💡 **Try these queries:**\n`;
//     response += `• "Show details about [employee name]"\n`;
//     response += `• "What skills does [employee name] have?"\n`;
//     response += `• "Generate analytics report"\n`;
//     response += `• "List all employees"`;

//     return response;
//   }

//   findLastMentionedEmployee(query, employees) {
//     // Look for employee names in the query
//     for (const emp of employees) {
//       if (query.toLowerCase().includes(emp.name.toLowerCase())) {
//         return emp;
//       }
//     }
//     return null;
//   }

//   calculateExperience(joiningDate) {
//     if (!joiningDate) return "N/A";
//     const joined = new Date(joiningDate);
//     const now = new Date();
//     const years = now.getFullYear() - joined.getFullYear();
//     const months = now.getMonth() - joined.getMonth();

//     if (years === 0) return `${months} months`;
//     return `${years} years${months > 0 ? ` and ${months} months` : ""}`;
//   }
// }

// export default new LLMService();
