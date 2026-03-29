export interface Employee {
  _id?: string;
  employeeId: string;
  name: string;
  age: number;
  department: string;
  position: string;
  email: string;
  phone?: string;
  joiningDate: string;
  salary: number;
  skills: string[];
  performance: "Outstanding" | "Excellent" | "Good" | "Average";
  projects: string[];
  leaveBalance: number;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Message {
  id: number;
  type: "user" | "bot";
  content: string;
  relevantEmployees?: RelevantEmployee[];
}

export interface RelevantEmployee {
  name: string;
  employeeId: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  relevanceScore?: number;
}

export interface Statistics {
  totalEmployees: number;
  departments: Array<{ _id: string; count: number }>;
  averageSalary: number;
  performance: Array<{ _id: string; count: number }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface EmployeesResponse {
  employees: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface RAGResponse {
  success: boolean;
  answer: string;
  relevantEmployees: RelevantEmployee[];
}
