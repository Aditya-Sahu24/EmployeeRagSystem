// src/models/EmployeeModel.js
import database from "../config/database.js";
import { ObjectId } from "mongodb";

class EmployeeModel {
  constructor() {
    this.collectionName = "employee_embeddings";
  }

  async getCollection() {
    return await database.getCollection(this.collectionName);
  }

  async create(employeeData) {
    const collection = await this.getCollection();

    if (!employeeData.employeeId) {
      const lastEmployee = await collection.findOne(
        {},
        { sort: { employeeId: -1 } },
      );
      const lastId = lastEmployee?.employeeId || "EMP1000";
      const num = parseInt(lastId.replace("EMP", "")) + 1;
      employeeData.employeeId = `EMP${num}`;
    }

    const employee = {
      ...employeeData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(employee);
    return { ...employee, _id: result.insertedId };
  }

  async findAll(filter = {}, page = 1, limit = 10) {
    const collection = await this.getCollection();
    const skip = (page - 1) * limit;

    const employees = await collection
      .find(filter, {
        projection: { embedding: 0, text: 0 },
        skip,
        limit,
        sort: { employeeId: 1 },
      })
      .toArray();

    const total = await collection.countDocuments(filter);

    return {
      employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id) {
    const collection = await this.getCollection();
    let employee;

    if (ObjectId.isValid(id) && id.length === 24) {
      employee = await collection.findOne({ _id: new ObjectId(id) });
    } else {
      employee = await collection.findOne({ employeeId: id });
    }

    if (employee) {
      delete employee.embedding;
      delete employee.text;
    }

    return employee;
  }

  async update(id, updateData) {
    const collection = await this.getCollection();

    const updateDoc = {
      ...updateData,
      updatedAt: new Date(),
    };

    let result;
    if (ObjectId.isValid(id) && id.length === 24) {
      result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateDoc },
      );
    } else {
      result = await collection.updateOne(
        { employeeId: id },
        { $set: updateDoc },
      );
    }

    return result.modifiedCount > 0;
  }

  async delete(id) {
    const collection = await this.getCollection();

    let result;
    if (ObjectId.isValid(id) && id.length === 24) {
      result = await collection.deleteOne({ _id: new ObjectId(id) });
    } else {
      result = await collection.deleteOne({ employeeId: id });
    }

    return result.deletedCount > 0;
  }

  async vectorSearch(queryEmbedding, limit = 5) {
    const collection = await this.getCollection();

    try {
      const pipeline = [
        {
          $vectorSearch: {
            index: "employee_vector_index",
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: limit,
          },
        },
        {
          $project: {
            text: 1,
            name: 1,
            employeeId: 1,
            department: 1,
            position: 1,
            email: 1,
            phone: 1,
            skills: 1,
            performance: 1,
            age: 1,
            salary: 1,
            joiningDate: 1,
            leaveBalance: 1,
            address: 1,
            projects: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ];

      const results = await collection.aggregate(pipeline).toArray();

      if (results.length > 0) {
        console.log(`✅ Vector search found ${results.length} results`);
        return results;
      }
    } catch (error) {
      console.log("Vector search error:", error.message);
    }

    return [];
  }

  async keywordSearch(queryText, limit = 5) {
    const collection = await this.getCollection();

    const lowerQuery = queryText.toLowerCase();
    const searchTerms = lowerQuery.split(" ").filter((k) => k.length > 2);

    // Build search filter
    const searchConditions = [];

    // Search by name
    searchConditions.push({
      name: { $regex: searchTerms.join("|"), $options: "i" },
    });

    // Search by position
    searchConditions.push({
      position: { $regex: searchTerms.join("|"), $options: "i" },
    });

    // Search by department
    searchConditions.push({
      department: { $regex: searchTerms.join("|"), $options: "i" },
    });

    // Search by skills
    searchConditions.push({
      skills: { $in: searchTerms.map((s) => new RegExp(s, "i")) },
    });

    // Search by employee ID
    const empIdMatch = queryText.match(/EMP\d+/i);
    if (empIdMatch) {
      searchConditions.push({ employeeId: empIdMatch[0] });
    }

    // Search by phone number
    const phoneMatch = queryText.match(/\d{10}/);
    if (phoneMatch) {
      searchConditions.push({ phone: phoneMatch[0] });
    }

    // Search by email
    if (queryText.includes("@")) {
      searchConditions.push({ email: { $regex: queryText, $options: "i" } });
    }

    const results = await collection
      .find(
        {
          $or: searchConditions,
        },
        {
          projection: { embedding: 0 },
          limit: limit,
        },
      )
      .toArray();

    console.log(
      `🔍 Keyword search found ${results.length} results for: "${queryText}"`,
    );
    return results;
  }

  async search(criteria) {
    const collection = await this.getCollection();
    let filter = {};

    if (criteria.department) {
      filter.department = criteria.department;
    }

    if (criteria.skill) {
      filter.skills = criteria.skill;
    }

    if (criteria.query) {
      filter.$or = [
        { name: { $regex: criteria.query, $options: "i" } },
        { position: { $regex: criteria.query, $options: "i" } },
        { department: { $regex: criteria.query, $options: "i" } },
      ];
    }

    const employees = await collection
      .find(filter, {
        projection: { embedding: 0, text: 0 },
      })
      .limit(20)
      .toArray();

    return employees;
  }

  async getDepartments() {
    const collection = await this.getCollection();
    return await collection.distinct("department");
  }

  async getStatistics() {
    const collection = await this.getCollection();

    const totalEmployees = await collection.countDocuments();

    const departmentStats = await collection
      .aggregate([{ $group: { _id: "$department", count: { $sum: 1 } } }])
      .toArray();

    const avgSalary = await collection
      .aggregate([{ $group: { _id: null, avg: { $avg: "$salary" } } }])
      .toArray();

    const performanceStats = await collection
      .aggregate([{ $group: { _id: "$performance", count: { $sum: 1 } } }])
      .toArray();

    return {
      totalEmployees,
      departments: departmentStats,
      averageSalary: avgSalary[0]?.avg || 0,
      performance: performanceStats,
    };
  }
}

export default new EmployeeModel();

// import database from "../config/database.js";
// import { ObjectId } from "mongodb";

// class EmployeeModel {
//   constructor() {
//     this.collectionName = "employee_embeddings";
//   }

//   async getCollection() {
//     return await database.getCollection(this.collectionName);
//   }

//   // Create employee
//   async create(employeeData) {
//     const collection = await this.getCollection();

//     // Generate employee ID if not provided
//     if (!employeeData.employeeId) {
//       const lastEmployee = await collection.findOne(
//         {},
//         { sort: { employeeId: -1 } },
//       );
//       const lastId = lastEmployee?.employeeId || "EMP1000";
//       const num = parseInt(lastId.replace("EMP", "")) + 1;
//       employeeData.employeeId = `EMP${num}`;
//     }

//     const employee = {
//       ...employeeData,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };

//     const result = await collection.insertOne(employee);
//     return { ...employee, _id: result.insertedId };
//   }

//   // Find all employees with pagination
//   async findAll(filter = {}, page = 1, limit = 10) {
//     const collection = await this.getCollection();
//     const skip = (page - 1) * limit;

//     const employees = await collection
//       .find(filter, {
//         projection: { embedding: 0, text: 0 },
//         skip,
//         limit,
//         sort: { employeeId: 1 },
//       })
//       .toArray();

//     const total = await collection.countDocuments(filter);

//     return {
//       employees,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     };
//   }

//   // Find one employee by ID or employeeId
//   async findById(id) {
//     const collection = await this.getCollection();
//     let employee;

//     if (ObjectId.isValid(id) && id.length === 24) {
//       employee = await collection.findOne({ _id: new ObjectId(id) });
//     } else {
//       employee = await collection.findOne({ employeeId: id });
//     }

//     if (employee) {
//       delete employee.embedding;
//       delete employee.text;
//     }

//     return employee;
//   }

//   // Update employee
//   async update(id, updateData) {
//     const collection = await this.getCollection();

//     const updateDoc = {
//       ...updateData,
//       updatedAt: new Date(),
//     };

//     let result;
//     if (ObjectId.isValid(id) && id.length === 24) {
//       result = await collection.updateOne(
//         { _id: new ObjectId(id) },
//         { $set: updateDoc },
//       );
//     } else {
//       result = await collection.updateOne(
//         { employeeId: id },
//         { $set: updateDoc },
//       );
//     }

//     return result.modifiedCount > 0;
//   }

//   // Delete employee
//   async delete(id) {
//     const collection = await this.getCollection();

//     let result;
//     if (ObjectId.isValid(id) && id.length === 24) {
//       result = await collection.deleteOne({ _id: new ObjectId(id) });
//     } else {
//       result = await collection.deleteOne({ employeeId: id });
//     }

//     return result.deletedCount > 0;
//   }

//   // Vector search
//   async vectorSearch(queryEmbedding, limit = 5) {
//     const collection = await this.getCollection();

//     const pipeline = [
//       {
//         $vectorSearch: {
//           queryVector: queryEmbedding,
//           path: "embedding",
//           numCandidates: 50,
//           limit: limit,
//           index: "employee_vector_index",
//         },
//       },
//       {
//         $project: {
//           text: 1,
//           name: 1,
//           employeeId: 1,
//           department: 1,
//           position: 1,
//           email: 1,
//           phone: 1,
//           skills: 1,
//           performance: 1,
//           score: { $meta: "vectorSearchScore" },
//         },
//       },
//     ];

//     return await collection.aggregate(pipeline).toArray();
//   }

//   // Get statistics
//   async getStatistics() {
//     const collection = await this.getCollection();

//     const totalEmployees = await collection.countDocuments();

//     const departmentStats = await collection
//       .aggregate([{ $group: { _id: "$department", count: { $sum: 1 } } }])
//       .toArray();

//     const avgSalary = await collection
//       .aggregate([{ $group: { _id: null, avg: { $avg: "$salary" } } }])
//       .toArray();

//     const performanceStats = await collection
//       .aggregate([{ $group: { _id: "$performance", count: { $sum: 1 } } }])
//       .toArray();

//     return {
//       totalEmployees,
//       departments: departmentStats,
//       averageSalary: avgSalary[0]?.avg || 0,
//       performance: performanceStats,
//     };
//   }

//   // Search by criteria
//   async search(criteria) {
//     const collection = await this.getCollection();
//     let filter = {};

//     if (criteria.department) {
//       filter.department = criteria.department;
//     }

//     if (criteria.skill) {
//       filter.skills = criteria.skill;
//     }

//     if (criteria.query) {
//       filter.$or = [
//         { name: { $regex: criteria.query, $options: "i" } },
//         { position: { $regex: criteria.query, $options: "i" } },
//         { department: { $regex: criteria.query, $options: "i" } },
//       ];
//     }

//     const employees = await collection
//       .find(filter, {
//         projection: { embedding: 0, text: 0 },
//       })
//       .limit(20)
//       .toArray();

//     return employees;
//   }

//   // Get distinct departments
//   async getDepartments() {
//     const collection = await this.getCollection();
//     return await collection.distinct("department");
//   }
// }

// export default new EmployeeModel();
