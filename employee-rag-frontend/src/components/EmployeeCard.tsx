import React from 'react';
import { Briefcase, Mail, MapPin, Edit, Trash2 } from 'lucide-react';
import type { Employee } from '../types';

interface EmployeeCardProps {
  employee: Employee;
  onClick: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onClick, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden card-hover">
      <div
        className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 cursor-pointer"
        onClick={() => onClick(employee)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-white font-bold text-lg">{employee.name}</h3>
            <p className="text-blue-100 text-sm">{employee.position}</p>
          </div>
          <div className="bg-white/20 rounded-lg px-2 py-1">
            <span className="text-white text-xs font-medium">{employee.employeeId}</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center text-gray-600">
          <Briefcase className="w-4 h-4 mr-2" />
          <span className="text-sm">{employee.department}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          <span className="text-sm">{employee.email}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="text-sm">{employee.address || 'Not specified'}</span>
        </div>

        {employee.skills && employee.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {employee.skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                {skill}
              </span>
            ))}
            {employee.skills.length > 3 && (
              <span className="text-xs text-gray-500">+{employee.skills.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(employee); }}
            className="flex-1 bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition text-sm flex items-center justify-center gap-1"
          >
            <Edit className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(employee); }}
            className="flex-1 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-sm flex items-center justify-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};