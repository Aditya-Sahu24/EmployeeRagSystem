import axios from "axios";
import type {
  Employee,
  EmployeesResponse,
  RAGResponse,
  Statistics,
  ApiResponse,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const employeeAPI = {
  // Get all employees
  getEmployees: async (
    page?: number,
    limit?: number,
  ): Promise<EmployeesResponse> => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    const response = await api.get(
      `/employees${params.toString() ? `?${params}` : ""}`,
    );
    return response.data;
  },

  // Search employees
  searchEmployees: async (query: string): Promise<{ data: Employee[] }> => {
    const response = await api.get(
      `/employees/search?q=${encodeURIComponent(query)}`,
    );
    return response.data;
  },

  // Get employee by ID
  getEmployeeById: async (id: string): Promise<{ data: Employee }> => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Create employee
  createEmployee: async (
    employee: Partial<Employee>,
  ): Promise<{ data: Employee }> => {
    const response = await api.post("/employees", employee);
    return response.data;
  },

  // Update employee
  updateEmployee: async (
    id: string,
    employee: Partial<Employee>,
  ): Promise<{ data: Employee }> => {
    const response = await api.put(`/employees/${id}`, employee);
    return response.data;
  },

  // Delete employee
  deleteEmployee: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async (): Promise<{ data: Statistics }> => {
    const response = await api.get("/employees/statistics");
    return response.data;
  },

  // Get departments
  getDepartments: async (): Promise<{ data: string[] }> => {
    const response = await api.get("/employees/departments");
    return response.data;
  },

  // RAG question answering
  askQuestion: async (query: string): Promise<RAGResponse> => {
    const response = await api.post("/rag/ask", { query });
    return response.data;
  },
};

export default api;
