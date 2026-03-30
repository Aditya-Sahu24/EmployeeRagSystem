// import React, { useState, useEffect } from 'react';
// import { X, Plus, Trash2 } from 'lucide-react';
// import type { Employee } from '../types';
// import { employeeAPI } from '../services/api';
// import toast from 'react-hot-toast';

// interface EmployeeFormProps {
//   employee?: Employee | null;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onClose, onSuccess }) => {
//   const [formData, setFormData] = useState<Partial<Employee>>({
//     name: '',
//     age: 0,
//     department: '',
//     position: '',
//     email: '',
//     phone: '',
//     joiningDate: new Date().toISOString().split('T')[0],
//     salary: 0,
//     skills: [],
//     performance: 'Good',
//     projects: [],
//     leaveBalance: 15,
//     address: '',
//   });

//   const [skillInput, setSkillInput] = useState('');
//   const [projectInput, setProjectInput] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (employee) {
//       setFormData(employee);
//     }
//   }, [employee]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
//   };

//   const addSkill = () => {
//     if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         skills: [...(prev.skills || []), skillInput.trim()]
//       }));
//       setSkillInput('');
//     }
//   };

//   const removeSkill = (skill: string) => {
//     setFormData(prev => ({
//       ...prev,
//       skills: prev.skills?.filter(s => s !== skill) || []
//     }));
//   };

//   const addProject = () => {
//     if (projectInput.trim() && !formData.projects?.includes(projectInput.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         projects: [...(prev.projects || []), projectInput.trim()]
//       }));
//       setProjectInput('');
//     }
//   };

//   const removeProject = (project: string) => {
//     setFormData(prev => ({
//       ...prev,
//       projects: prev.projects?.filter(p => p !== project) || []
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       if (employee?._id) {
//         await employeeAPI.updateEmployee(employee.employeeId, formData);
//         toast.success('Employee updated successfully!');
//       } else {
//         await employeeAPI.createEmployee(formData);
//         toast.success('Employee created successfully!');
//       }
//       onSuccess();
//       onClose();
//     } catch (error) {
//       console.error('Error saving employee:', error);
//       toast.error('Failed to save employee. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
//       <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl sticky top-0">
//           <div className="flex justify-between items-center">
//             <h2 className="text-2xl font-bold text-white">
//               {employee ? 'Edit Employee' : 'Add New Employee'}
//             </h2>
//             <button
//               onClick={onClose}
//               className="text-white hover:bg-white/20 rounded-lg p-1 transition"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Basic Information */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Full Name *
//               </label>
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Age *
//               </label>
//               <input
//                 type="number"
//                 name="age"
//                 value={formData.age}
//                 onChange={handleNumberChange}
//                 required
//                 min="18"
//                 max="100"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Department *
//               </label>
//               <input
//                 type="text"
//                 name="department"
//                 value={formData.department}
//                 onChange={handleChange}
//                 required
//                 placeholder="e.g., Engineering, Marketing, HR"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Position *
//               </label>
//               <input
//                 type="text"
//                 name="position"
//                 value={formData.position}
//                 onChange={handleChange}
//                 required
//                 placeholder="e.g., Senior Software Engineer"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email *
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Phone
//               </label>
//               <input
//                 type="tel"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Joining Date *
//               </label>
//               <input
//                 type="date"
//                 name="joiningDate"
//                 value={formData.joiningDate}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Annual Salary (₹) *
//               </label>
//               <input
//                 type="number"
//                 name="salary"
//                 value={formData.salary}
//                 onChange={handleNumberChange}
//                 required
//                 min="0"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Performance Rating *
//               </label>
//               <select
//                 name="performance"
//                 value={formData.performance}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="Outstanding">Outstanding</option>
//                 <option value="Excellent">Excellent</option>
//                 <option value="Good">Good</option>
//                 <option value="Average">Average</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Leave Balance (days) *
//               </label>
//               <input
//                 type="number"
//                 name="leaveBalance"
//                 value={formData.leaveBalance}
//                 onChange={handleNumberChange}
//                 required
//                 min="0"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Address
//               </label>
//               <textarea
//                 name="address"
//                 value={formData.address}
//                 onChange={handleChange}
//                 rows={3}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             {/* Skills */}
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Skills
//               </label>
//               <div className="flex gap-2 mb-2">
//                 <input
//                   type="text"
//                   value={skillInput}
//                   onChange={(e) => setSkillInput(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && addSkill()}
//                   placeholder="Add a skill (e.g., React, Python)"
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <button
//                   type="button"
//                   onClick={addSkill}
//                   className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
//                 >
//                   <Plus className="w-5 h-5" />
//                 </button>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 {formData.skills?.map((skill) => (
//                   <span
//                     key={skill}
//                     className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
//                   >
//                     {skill}
//                     <button
//                       type="button"
//                       onClick={() => removeSkill(skill)}
//                       className="hover:text-red-600"
//                     >
//                       <Trash2 className="w-3 h-3" />
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {/* Projects */}
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Projects
//               </label>
//               <div className="flex gap-2 mb-2">
//                 <input
//                   type="text"
//                   value={projectInput}
//                   onChange={(e) => setProjectInput(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && addProject()}
//                   placeholder="Add a project"
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <button
//                   type="button"
//                   onClick={addProject}
//                   className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
//                 >
//                   <Plus className="w-5 h-5" />
//                 </button>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 {formData.projects?.map((project) => (
//                   <span
//                     key={project}
//                     className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
//                   >
//                     {project}
//                     <button
//                       type="button"
//                       onClick={() => removeProject(project)}
//                       className="hover:text-red-600"
//                     >
//                       <Trash2 className="w-3 h-3" />
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Form Actions */}
//           <div className="flex justify-end gap-3 pt-4 border-t">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
//             >
//               {loading ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };


import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, User, Briefcase, Mail, Phone, Calendar, DollarSign, MapPin } from 'lucide-react';
import type { Employee } from '../types';
import { employeeAPI } from '../services/api';
import toast from 'react-hot-toast';

interface EmployeeFormProps {
  employee?: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '', age: 0, department: '', position: '', email: '', phone: '',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: 0, skills: [], performance: 'Good', projects: [], leaveBalance: 15, address: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [projectInput, setProjectInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    if (employee) setFormData(employee);
  }, [employee]);

  // 🔥 INPUT HANDLERS
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: typeof value === "string" ? value.trimStart() : value
    }));
  };

  const handleNum = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  // 🔥 SKILLS
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  // 🔥 PROJECTS
  const addProject = () => {
    if (projectInput.trim() && !formData.projects?.includes(projectInput.trim())) {
      setFormData(prev => ({
        ...prev,
        projects: [...(prev.projects || []), projectInput.trim()]
      }));
      setProjectInput('');
    }
  };

  // 🔥 VALIDATION FUNCTION
  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.name || formData.name.trim().length < 3) {
      errors.push("Name must be at least 3 characters");
    }

    if (!formData.age || formData.age < 18 || formData.age > 60) {
      errors.push("Age must be between 18 and 60");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.push("Invalid email address");
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      errors.push("Phone must be 10 digits");
    }

    if (!formData.department || formData.department.trim().length < 2) {
      errors.push("Department is required");
    }

    if (!formData.position || formData.position.trim().length < 2) {
      errors.push("Position is required");
    }

    if (!formData.salary || formData.salary < 0) {
      errors.push("Salary must be greater than 0");
    }

    if (formData.salary && formData.salary > 50000000) {
      errors.push("Salary too high (max ₹5Cr)");
    }

    if (formData.joiningDate) {
      const today = new Date();
      const joining = new Date(formData.joiningDate);
      if (joining > today) {
        errors.push("Joining date cannot be in the future");
      }
    }

    return errors;
  };

  // 🔥 SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();

    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
      return;
    }

    if (!formData.skills || formData.skills.length === 0) {
      toast("⚠️ No skills added", { icon: "⚠️" });
    }

    setLoading(true);

    try {
      if (employee?._id) {
        await employeeAPI.updateEmployee(employee.employeeId, formData);
        toast.success('Employee updated!');
      } else {
        await employeeAPI.createEmployee(formData);
        toast.success('Employee created!');
      }

      onSuccess();
      onClose();

    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sections = ['Basic Info', 'Employment', 'Skills & Projects'];

  return (
    <div className="form-backdrop" onClick={onClose}>
      <div className="form-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="form-header">
          <div>
            <h2 className="form-title">{employee ? 'Edit Employee' : 'New Employee'}</h2>
            <p className="form-subtitle">{employee ? `Editing ${employee.name}` : 'Add a new team member'}</p>
          </div>
          <button className="form-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="form-tabs">
          {sections.map((s, i) => (
            <button
              key={s}
              type="button"
              className={`form-tab ${activeSection === i ? 'form-tab-active' : ''}`}
              onClick={() => setActiveSection(i)}
            >
              <span className="form-tab-num">{i + 1}</span>
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-body">

            {/* Section 0 */}
            {activeSection === 0 && (
              <div className="form-section">
                <div className="form-grid">
                  <input name="name" value={formData.name} onChange={handleChange} required className="form-input" placeholder="Full Name" />
                  <input type="number" name="age" value={formData.age} onChange={handleNum} required className="form-input" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-input" />
                  <input name="phone" value={formData.phone} onChange={handleChange} className="form-input" />
                  <textarea name="address" value={formData.address} onChange={handleChange} className="form-input" />
                </div>
              </div>
            )}

            {/* Section 1 */}
            {activeSection === 1 && (
              <div className="form-section">
                <div className="form-grid">
                  <input name="department" value={formData.department} onChange={handleChange} required className="form-input" />
                  <input name="position" value={formData.position} onChange={handleChange} required className="form-input" />
                  <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className="form-input" />
                  <input type="number" name="salary" value={formData.salary} onChange={handleNum} className="form-input" />
                </div>
              </div>
            )}

            {/* Section 2 */}
            {activeSection === 2 && (
              <div className="form-section">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} className="form-input" />
                <button type="button" onClick={addSkill}>Add Skill</button>

                <input value={projectInput} onChange={e => setProjectInput(e.target.value)} className="form-input" />
                <button type="button" onClick={addProject}>Add Project</button>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="form-footer">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Saving..." : employee ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};