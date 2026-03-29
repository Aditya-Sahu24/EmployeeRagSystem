// src/services/llmService.js
import dotenv from "dotenv";

dotenv.config();

class LLMService {
  async getAnswerWithContext(query, employees) {
    const lowerQuery = query.toLowerCase();

    // ============= ANALYTICS & REPORT QUERIES =============
    if (
      lowerQuery.includes("analytics") ||
      lowerQuery.includes("report") ||
      lowerQuery.includes("summary")
    ) {
      return this.generateAnalyticsReport(employees);
    }

    // ============= ALL EMPLOYEES QUERIES =============
    if (
      lowerQuery.includes("all employee") ||
      lowerQuery.includes("everyone") ||
      lowerQuery.includes("list all")
    ) {
      return this.getAllEmployeesDetails(employees);
    }

    // ============= SENIOR/MOST EXPERIENCED QUERIES =============
    if (
      lowerQuery.includes("most senior") ||
      lowerQuery.includes("most experienced") ||
      lowerQuery.includes("oldest")
    ) {
      return this.getMostSeniorEmployee(employees);
    }

    // ============= SPECIFIC SKILL QUERIES =============
    if (
      lowerQuery.includes("skill") &&
      (lowerQuery.includes("of him") ||
        lowerQuery.includes("his skills") ||
        lowerQuery.includes("his skill"))
    ) {
      // Handle "skills of him" type queries
      const lastMentionedEmployee = this.findLastMentionedEmployee(
        query,
        employees,
      );
      if (lastMentionedEmployee) {
        return this.getSkillsInfo(lastMentionedEmployee);
      }
    }

    // Extract specific skill from query (e.g., "who knows React?")
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
      "marketing",
      "recruitment",
    ];
    for (const skill of skillKeywords) {
      if (lowerQuery.includes(skill)) {
        return this.getEmployeesBySkill(employees, skill);
      }
    }

    // ============= SINGLE EMPLOYEE QUERIES =============
    // Check for specific employee name
    for (const emp of employees) {
      if (lowerQuery.includes(emp.name.toLowerCase())) {
        // Check what type of information is requested
        if (lowerQuery.includes("skill")) {
          return this.getSkillsInfo(emp);
        } else if (
          lowerQuery.includes("contact") ||
          lowerQuery.includes("phone") ||
          lowerQuery.includes("email")
        ) {
          return this.getContactInfo(emp);
        } else if (lowerQuery.includes("performance")) {
          return this.getPerformanceInfo(emp);
        } else {
          return this.getCompleteDetails(emp);
        }
      }
    }

    // Check for employee ID
    const empIdMatch = query.match(/EMP\d+/i);
    if (empIdMatch) {
      const emp = employees.find((e) => e.employeeId === empIdMatch[0]);
      if (emp) return this.getCompleteDetails(emp);
    }

    // ============= DEPARTMENT QUERIES =============
    const departments = [
      "engineering",
      "marketing",
      "human resources",
      "hr",
      "sales",
      "finance",
    ];
    for (const dept of departments) {
      if (lowerQuery.includes(dept)) {
        const deptEmployees = employees.filter(
          (e) => e.department && e.department.toLowerCase().includes(dept),
        );
        if (deptEmployees.length > 0) {
          return this.getDepartmentInfo(dept, deptEmployees);
        }
      }
    }

    // ============= GENERAL QUERIES =============
    return this.getGeneralResponse(query, employees);
  }

  // Generate comprehensive analytics report
  generateAnalyticsReport(employees) {
    if (employees.length === 0) {
      return "No employee data available for analytics.";
    }

    const totalEmployees = employees.length;
    const departments = [...new Set(employees.map((e) => e.department))];
    const avgAge = Math.round(
      employees.reduce((sum, e) => sum + (e.age || 0), 0) / totalEmployees,
    );
    const avgSalary =
      employees.reduce((sum, e) => sum + (e.salary || 0), 0) / totalEmployees;

    // Department distribution
    const deptCount = {};
    employees.forEach((e) => {
      deptCount[e.department] = (deptCount[e.department] || 0) + 1;
    });

    // Performance distribution
    const perfCount = {};
    employees.forEach((e) => {
      perfCount[e.performance] = (perfCount[e.performance] || 0) + 1;
    });

    // Skills summary
    const allSkills = [];
    employees.forEach((e) => {
      if (e.skills) allSkills.push(...e.skills);
    });
    const uniqueSkills = [...new Set(allSkills)];

    // Find most senior (oldest joining)
    const sortedByJoining = [...employees].sort(
      (a, b) => new Date(a.joiningDate) - new Date(b.joiningDate),
    );
    const mostSenior = sortedByJoining[0];

    // Find highest paid
    const sortedBySalary = [...employees].sort(
      (a, b) => (b.salary || 0) - (a.salary || 0),
    );
    const highestPaid = sortedBySalary[0];

    let report = `📊 **COMPREHENSIVE EMPLOYEE ANALYTICS REPORT**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 **OVERVIEW STATISTICS**
• Total Employees: ${totalEmployees}
• Departments: ${departments.length}
• Average Age: ${avgAge} years
• Average Salary: ₹${avgSalary.toLocaleString()}
• Total Skills: ${uniqueSkills.length}

🏢 **DEPARTMENT BREAKDOWN**
${Object.entries(deptCount)
  .map(
    ([dept, count]) =>
      `• ${dept}: ${count} employee(s) (${Math.round((count / totalEmployees) * 100)}%)`,
  )
  .join("\n")}

⭐ **PERFORMANCE RATINGS**
${Object.entries(perfCount)
  .map(([perf, count]) => `• ${perf}: ${count} employee(s)`)
  .join("\n")}

💡 **TOP SKILLS IN COMPANY**
${uniqueSkills
  .slice(0, 10)
  .map((skill) => `• ${skill}`)
  .join("\n")}

🏆 **KEY HIGHLIGHTS**
• Most Senior Employee: ${mostSenior?.name} (Joined: ${mostSenior?.joiningDate})
• Highest Paid: ${highestPaid?.name} (₹${highestPaid?.salary?.toLocaleString()})
• Most Skilled: ${this.getMostSkilledEmployee(employees)?.name}

📋 **EMPLOYEE DIRECTORY**
${employees.map((e) => `• ${e.name} - ${e.position} (${e.department})`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For specific employee details, ask "Show details about [employee name]"`;

    return report;
  }

  // Get all employees details in a formatted list
  getAllEmployeesDetails(employees) {
    if (employees.length === 0) {
      return "No employees found in the database.";
    }

    let response = `📋 **ALL EMPLOYEES DIRECTORY** (${employees.length} employees)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    employees.forEach((emp, index) => {
      response += `${index + 1}. **${emp.name}** (${emp.employeeId})
   • Position: ${emp.position}
   • Department: ${emp.department}
   • Email: ${emp.email}
   • Phone: ${emp.phone || "Not provided"}
   • Skills: ${emp.skills?.join(", ") || "No skills listed"}
   • Performance: ${emp.performance}
   • Salary: ₹${emp.salary?.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    });

    response += `\n💡 Tip: Ask "Show details about [employee name]" for more information.`;
    return response;
  }

  // Get most senior employee
  getMostSeniorEmployee(employees) {
    if (employees.length === 0) return "No employees found.";

    // Sort by joining date (oldest first)
    const sorted = [...employees].sort(
      (a, b) => new Date(a.joiningDate) - new Date(b.joiningDate),
    );

    const mostSenior = sorted[0];

    let response = `🏆 **MOST SENIOR EMPLOYEE**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 **${mostSenior.name}**
• Employee ID: ${mostSenior.employeeId}
• Position: ${mostSenior.position}
• Department: ${mostSenior.department}
• Joined: ${mostSenior.joiningDate}
• Experience: ${this.calculateExperience(mostSenior.joiningDate)}
• Performance: ${mostSenior.performance}

💼 **Other Senior Employees:**
${sorted
  .slice(1, 4)
  .map(
    (emp, i) =>
      `${i + 1}. ${emp.name} - ${emp.position} (Joined: ${emp.joiningDate})`,
  )
  .join("\n")}`;

    return response;
  }

  // Get employees by specific skill
  getEmployeesBySkill(employees, skill) {
    const skilledEmployees = employees.filter(
      (e) =>
        e.skills &&
        e.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase())),
    );

    if (skilledEmployees.length === 0) {
      return `No employees found with ${skill} skills.`;
    }

    let response = `💡 **Employees with ${skill.toUpperCase()} Skills**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    skilledEmployees.forEach((emp) => {
      response += `• **${emp.name}** (${emp.position})
   Department: ${emp.department}
   All Skills: ${emp.skills?.join(", ")}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    });

    return response;
  }

  // Get most skilled employee
  getMostSkilledEmployee(employees) {
    return employees.reduce(
      (max, emp) =>
        (emp.skills?.length || 0) > (max.skills?.length || 0) ? emp : max,
      employees[0],
    );
  }

  getContactInfo(emp) {
    return `📞 **Contact Information for ${emp.name}**\n\n📧 Email: ${emp.email}\n📱 Phone: ${emp.phone || "Not provided"}\n📍 Location: ${emp.address || "Not specified"}`;
  }

  getSkillsInfo(emp) {
    const skills = emp.skills || [];
    if (skills.length === 0) {
      return `${emp.name} has no skills listed in the database. Please update their profile with skills.`;
    }
    return `💡 **Skills of ${emp.name}**\n\n${emp.name} (${emp.position}) has expertise in:\n${skills.map((s) => `• ${s}`).join("\n")}`;
  }

  getPerformanceInfo(emp) {
    const performanceEmoji = {
      Outstanding: "🌟",
      Excellent: "⭐",
      Good: "👍",
      Average: "📊",
    };
    const emoji = performanceEmoji[emp.performance] || "📈";
    return `${emoji} **Performance Rating for ${emp.name}**\n\nRating: ${emp.performance}\nPosition: ${emp.position}\nDepartment: ${emp.department}`;
  }

  getCompleteDetails(emp) {
    return `📋 **Complete Employee Details: ${emp.name}**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🆔 **Basic Information**
   • Employee ID: ${emp.employeeId}
   • Name: ${emp.name}
   • Age: ${emp.age} years
   • Location: ${emp.address || "Not specified"}

💼 **Employment Details**
   • Department: ${emp.department}
   • Position: ${emp.position}
   • Joined: ${emp.joiningDate}
   • Experience: ${this.calculateExperience(emp.joiningDate)}

💰 **Compensation**
   • Annual Salary: ₹${emp.salary?.toLocaleString() || "N/A"}
   • Leave Balance: ${emp.leaveBalance} days

🎯 **Skills & Performance**
   • Skills: ${emp.skills?.join(", ") || "No skills listed"}
   • Performance Rating: ${emp.performance}
   • Projects: ${emp.projects?.join(", ") || "No projects assigned"}

📞 **Contact**
   • Email: ${emp.email}
   • Phone: ${emp.phone || "Not provided"}`;
  }

  getDepartmentInfo(department, employees) {
    let response = `🏢 **${department.toUpperCase()} DEPARTMENT**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    response += `Total Employees: ${employees.length}\n\n`;
    response += `**Team Members:**\n`;

    employees.forEach((emp) => {
      response += `• ${emp.name} - ${emp.position}\n`;
      response += `  Skills: ${emp.skills?.join(", ") || "No skills"}\n`;
      response += `  Performance: ${emp.performance}\n\n`;
    });

    return response;
  }

  getGeneralResponse(query, employees) {
    if (employees.length === 0) {
      return "No employees found matching your query. Please try a different question.";
    }

    // Find last mentioned employee for context
    const lastMentioned = this.findLastMentionedEmployee(query, employees);

    if (lastMentioned && (query.includes("him") || query.includes("his"))) {
      return this.getCompleteDetails(lastMentioned);
    }

    let response = `📊 **Found ${employees.length} employee(s)**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    employees.forEach((emp) => {
      response += `**${emp.name}** (${emp.employeeId})
   • Position: ${emp.position}
   • Department: ${emp.department}
   • Email: ${emp.email}
   • Skills: ${emp.skills?.join(", ") || "None"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    });

    response += `\n💡 **Try these queries:**\n`;
    response += `• "Show details about [employee name]"\n`;
    response += `• "What skills does [employee name] have?"\n`;
    response += `• "Generate analytics report"\n`;
    response += `• "List all employees"`;

    return response;
  }

  findLastMentionedEmployee(query, employees) {
    // Look for employee names in the query
    for (const emp of employees) {
      if (query.toLowerCase().includes(emp.name.toLowerCase())) {
        return emp;
      }
    }
    return null;
  }

  calculateExperience(joiningDate) {
    if (!joiningDate) return "N/A";
    const joined = new Date(joiningDate);
    const now = new Date();
    const years = now.getFullYear() - joined.getFullYear();
    const months = now.getMonth() - joined.getMonth();

    if (years === 0) return `${months} months`;
    return `${years} years${months > 0 ? ` and ${months} months` : ""}`;
  }
}

export default new LLMService();

// // src/services/llmService.js
// import dotenv from "dotenv";

// dotenv.config();

// class LLMService {
//   async getAnswerWithContext(query, employees) {
//     const lowerQuery = query.toLowerCase();

//     // Handle single employee queries
//     if (employees.length === 1) {
//       const emp = employees[0];

//       // Employee ID query
//       if (lowerQuery.includes("employee id") || lowerQuery.includes("emp")) {
//         return this.getEmployeeIdInfo(emp);
//       }

//       // Contact information query
//       if (
//         lowerQuery.includes("contact") ||
//         lowerQuery.includes("phone") ||
//         lowerQuery.includes("number") ||
//         lowerQuery.includes("call")
//       ) {
//         return this.getContactInfo(emp);
//       }

//       // Skills query
//       if (
//         lowerQuery.includes("skill") ||
//         lowerQuery.includes("knows") ||
//         lowerQuery.includes("technology") ||
//         lowerQuery.includes("expert")
//       ) {
//         return this.getSkillsInfo(emp);
//       }

//       // Performance query
//       if (
//         lowerQuery.includes("performance") ||
//         lowerQuery.includes("rating") ||
//         lowerQuery.includes("evaluation")
//       ) {
//         return this.getPerformanceInfo(emp);
//       }

//       // Department/position query
//       if (
//         lowerQuery.includes("department") ||
//         lowerQuery.includes("work") ||
//         lowerQuery.includes("role") ||
//         lowerQuery.includes("position")
//       ) {
//         return this.getRoleInfo(emp);
//       }

//       // Complete details query
//       if (
//         lowerQuery.includes("details") ||
//         lowerQuery.includes("information") ||
//         lowerQuery.includes("about") ||
//         lowerQuery.includes("get")
//       ) {
//         return this.getCompleteDetails(emp);
//       }

//       // Default for single employee
//       return this.getCompleteDetails(emp);
//     }

//     // Handle specific employee name in results
//     for (const emp of employees) {
//       if (lowerQuery.includes(emp.name.toLowerCase())) {
//         return this.getCompleteDetails(emp);
//       }
//     }

//     // Handle employee ID query
//     const empIdMatch = query.match(/EMP\d+/i);
//     if (empIdMatch) {
//       const emp = employees.find((e) => e.employeeId === empIdMatch[0]);
//       if (emp) return this.getCompleteDetails(emp);
//     }

//     // Handle phone number query
//     const phoneMatch = query.match(/\d{10}/);
//     if (phoneMatch) {
//       const emp = employees.find((e) => e.phone === phoneMatch[0]);
//       if (emp)
//         return `${emp.name} (${emp.position}) - Contact Number: ${emp.phone}`;
//     }

//     // Handle department queries
//     const departments = [
//       "engineering",
//       "marketing",
//       "human resources",
//       "hr",
//       "sales",
//       "finance",
//       "operations",
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

//     // Handle skills query
//     if (
//       lowerQuery.includes("skill") ||
//       lowerQuery.includes("knows") ||
//       lowerQuery.includes("technology")
//     ) {
//       return this.getSkillsSummary(employees);
//     }

//     // Handle count query
//     if (
//       lowerQuery.includes("how many") ||
//       lowerQuery.includes("count") ||
//       lowerQuery.includes("total")
//     ) {
//       return this.getCountInfo(employees);
//     }

//     // Default summary
//     return this.getSummaryResponse(employees);
//   }

//   getEmployeeIdInfo(emp) {
//     return `🆔 **Employee ID Information**\n\nEmployee: ${emp.name}\nEmployee ID: ${emp.employeeId}\nPosition: ${emp.position}\nDepartment: ${emp.department}`;
//   }

//   getContactInfo(emp) {
//     return `📞 **Contact Information for ${emp.name}**\n\n📧 Email: ${emp.email}\n📱 Phone: ${emp.phone || "Not provided"}\n📍 Location: ${emp.address || "Not specified"}`;
//   }

//   getSkillsInfo(emp) {
//     const skills = emp.skills || [];
//     if (skills.length === 0) {
//       return `${emp.name} has no skills listed in the database.`;
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

//   getRoleInfo(emp) {
//     return `👔 **Role Information for ${emp.name}**\n\nPosition: ${emp.position}\nDepartment: ${emp.department}\nEmployee ID: ${emp.employeeId}`;
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
//     const names = employees
//       .map((e) => `${e.name} (${e.position})`)
//       .join("\n• ");
//     return `🏢 **${department.toUpperCase()} Department**\n\nFound ${employees.length} employee(s):\n• ${names}\n\nTo see details of a specific employee, ask "Show details about [employee name]".`;
//   }

//   getSkillsSummary(employees) {
//     const allSkills = [...new Set(employees.flatMap((e) => e.skills || []))];
//     const skillMap = new Map();

//     employees.forEach((emp) => {
//       (emp.skills || []).forEach((skill) => {
//         if (!skillMap.has(skill)) skillMap.set(skill, []);
//         skillMap.get(skill).push(emp.name);
//       });
//     });

//     let response = `💡 **Skills Overview**\n\n`;
//     response += `Employees have skills in: ${allSkills.join(", ")}\n\n`;
//     response += `**Who knows what?**\n`;

//     const topSkills = Array.from(skillMap.entries()).slice(0, 5);
//     topSkills.forEach(([skill, names]) => {
//       response += `• ${skill}: ${names.join(", ")}\n`;
//     });

//     response += `\nAsk "What skills does [name] have?" for specific employee details.`;
//     return response;
//   }

//   getCountInfo(employees) {
//     const departments = [...new Set(employees.map((e) => e.department))];
//     return `📊 **Employee Summary**\n\nTotal employees found: ${employees.length}\nDepartments represented: ${departments.join(", ")}\n\nTo see more details, ask about specific employees or departments.`;
//   }

//   getSummaryResponse(employees) {
//     if (employees.length === 0) {
//       return "No employees found matching your query. Please try a different question.";
//     }

//     const names = employees.map((e) => e.name).join(", ");
//     const departments = [...new Set(employees.map((e) => e.department))];
//     const skills = [...new Set(employees.flatMap((e) => e.skills || []))].slice(
//       0,
//       5,
//     );

//     let response = `📊 **Found ${employees.length} employee(s)**\n\n`;
//     response += `**Employees:** ${names}\n`;
//     response += `**Departments:** ${departments.join(", ")}\n`;
//     response += `**Key Skills:** ${skills.join(", ")}\n\n`;
//     response += `For specific details, try:\n`;
//     response += `• "Show details about [employee name]"\n`;
//     response += `• "What skills does [employee name] have?"\n`;
//     response += `• "Contact information for [employee name]"`;

//     return response;
//   }
// }

// export default new LLMService();

// // src/services/llmService.js
// import dotenv from "dotenv";

// dotenv.config();

// class LLMService {
//   async getAnswer(query, context) {
//     console.log("🔄 Generating answer from retrieved context...");

//     // Parse the context to extract employee information
//     const employees = this.parseContextToEmployees(context);

//     if (employees.length === 0) {
//       return "No employee information found in the records.";
//     }

//     const lowerQuery = query.toLowerCase();

//     // Handle different types of questions
//     if (lowerQuery.includes("who") || lowerQuery.includes("employee")) {
//       return this.handleEmployeeQuery(lowerQuery, employees);
//     } else if (lowerQuery.includes("skill") || lowerQuery.includes("knows")) {
//       return this.handleSkillQuery(lowerQuery, employees);
//     } else if (
//       lowerQuery.includes("department") ||
//       lowerQuery.includes("team")
//     ) {
//       return this.handleDepartmentQuery(lowerQuery, employees);
//     } else if (
//       lowerQuery.includes("senior") ||
//       lowerQuery.includes("lead") ||
//       lowerQuery.includes("manager")
//     ) {
//       return this.handlePositionQuery(lowerQuery, employees);
//     } else {
//       return this.handleGeneralQuery(query, employees);
//     }
//   }

//   parseContextToEmployees(context) {
//     const employees = [];
//     const records = context.split("---");

//     for (const record of records) {
//       const employee = {};

//       // Extract employee ID
//       const idMatch = record.match(/Employee ID: (\S+)/);
//       if (idMatch) employee.id = idMatch[1];

//       // Extract name and age
//       const nameMatch = record.match(/Name: ([^,]+), Age: (\d+)/);
//       if (nameMatch) {
//         employee.name = nameMatch[1].trim();
//         employee.age = parseInt(nameMatch[2]);
//       }

//       // Extract department
//       const deptMatch = record.match(/Department: (\w+)/);
//       if (deptMatch) employee.department = deptMatch[1];

//       // Extract position
//       const posMatch = record.match(/Position: ([^\n]+)/);
//       if (posMatch) employee.position = posMatch[1].trim();

//       // Extract skills
//       const skillsMatch = record.match(/Skills: ([^\n]+)/);
//       if (skillsMatch) {
//         employee.skills = skillsMatch[1].split(", ").map((s) => s.trim());
//       }

//       // Extract performance
//       const perfMatch = record.match(/Performance Rating: (\w+)/);
//       if (perfMatch) employee.performance = perfMatch[1];

//       if (employee.name) {
//         employees.push(employee);
//       }
//     }

//     return employees;
//   }

//   handleEmployeeQuery(query, employees) {
//     // Check if asking about specific employee
//     for (const emp of employees) {
//       if (query.includes(emp.name.toLowerCase())) {
//         return `${emp.name} (${emp.position}) works in the ${emp.department} department. ${emp.name}'s skills include: ${emp.skills.join(", ")}. Performance rating: ${emp.performance}.`;
//       }
//     }

//     // General list
//     const names = employees.map((e) => `${e.name} (${e.position})`).join(", ");
//     return `Found ${employees.length} employees: ${names}. Each has different skills and roles. For specific details, ask about a particular employee or skill.`;
//   }

//   handleSkillQuery(query, employees) {
//     // Find employees with matching skills
//     const skillKeywords = [
//       "javascript",
//       "react",
//       "node",
//       "python",
//       "java",
//       "aws",
//       "mongodb",
//       "sql",
//       "marketing",
//       "sales",
//       "recruitment",
//       "training",
//       "seo",
//       "content",
//     ];

//     let foundSkill = null;
//     for (const skill of skillKeywords) {
//       if (query.includes(skill)) {
//         foundSkill = skill;
//         break;
//       }
//     }

//     if (foundSkill) {
//       const matched = employees.filter(
//         (e) =>
//           e.skills &&
//           e.skills.some((s) => s.toLowerCase().includes(foundSkill)),
//       );

//       if (matched.length > 0) {
//         return `${matched.length} employee(s) have ${foundSkill} skills: ${matched.map((e) => e.name).join(", ")}.`;
//       }
//     }

//     // List all skills
//     const allSkills = [...new Set(employees.flatMap((e) => e.skills || []))];
//     return `Employees have skills in: ${allSkills.join(", ")}. Ask about specific skills like 'Who knows React?' or 'Who has Python skills?'`;
//   }

//   handleDepartmentQuery(query, employees) {
//     const departments = [...new Set(employees.map((e) => e.department))];

//     for (const dept of departments) {
//       if (query.includes(dept.toLowerCase())) {
//         const deptEmployees = employees.filter((e) => e.department === dept);
//         return `The ${dept} department has ${deptEmployees.length} employee(s): ${deptEmployees.map((e) => e.name).join(", ")}.`;
//       }
//     }

//     return `Departments in the company: ${departments.join(", ")}. Ask about a specific department for more details.`;
//   }

//   handlePositionQuery(query, employees) {
//     const positions = [
//       "senior",
//       "lead",
//       "manager",
//       "director",
//       "engineer",
//       "developer",
//       "analyst",
//     ];

//     for (const pos of positions) {
//       if (query.includes(pos)) {
//         const matched = employees.filter(
//           (e) => e.position && e.position.toLowerCase().includes(pos),
//         );
//         if (matched.length > 0) {
//           return `${matched.length} employee(s) with '${pos}' positions: ${matched.map((e) => `${e.name} (${e.position})`).join(", ")}.`;
//         }
//       }
//     }

//     return `Employees hold various positions. Ask about specific roles like 'Who are the senior engineers?'`;
//   }

//   handleGeneralQuery(query, employees) {
//     // Provide a helpful summary
//     const summary = {
//       total: employees.length,
//       departments: [...new Set(employees.map((e) => e.department))],
//       topSkills: [...new Set(employees.flatMap((e) => e.skills || []))].slice(
//         0,
//         5,
//       ),
//     };

//     return `I found ${summary.total} employee records across ${summary.departments.join(", ")} departments. Key skills include ${summary.topSkills.join(", ")}. Ask me specific questions like "Who works in Engineering?" or "What skills does Amit have?"`;
//   }
// }

// export default new LLMService();
