// import React, { useState, useEffect } from 'react';
// import { MessageCircle, Users, BarChart3, Send, Plus, Search, X } from 'lucide-react';
// import { Toaster, toast } from 'react-hot-toast';
// import { ChatMessage } from './components/ChatMessage';
// import { EmployeeCard } from './components/EmployeeCard';
// import { EmployeeForm } from './components/EmployeeForm';
// import { employeeAPI } from './services/api';
// import type { Employee, Message } from './types';

// type TabType = 'chat' | 'employees' | 'analytics';

// function App() {
//   const [activeTab, setActiveTab] = useState<TabType>('chat');
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: 1,
//       type: 'bot',
//       content: '👋 Hello! I\'m your HR Assistant. Ask me anything about employees - their skills, departments, positions, or performance!'
//     }
//   ]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
//   const [showEmployeeForm, setShowEmployeeForm] = useState(false);
//   const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
//   const [statistics, setStatistics] = useState<any>(null);
//   const [departments, setDepartments] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);

//   // Fetch data on load
//   useEffect(() => {
//     fetchEmployees();
//     fetchStatistics();
//     fetchDepartments();
//   }, []);

//   const fetchEmployees = async () => {
//     setLoading(true);
//     try {
//       const response = await employeeAPI.getEmployees();
//       setEmployees(response.employees);
//     } catch (error) {
//       console.error('Error fetching employees:', error);
//       toast.error('Failed to fetch employees');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchStatistics = async () => {
//     try {
//       const response = await employeeAPI.getStatistics();
//       setStatistics(response.data);
//     } catch (error) {
//       console.error('Error fetching statistics:', error);
//     }
//   };

//   const fetchDepartments = async () => {
//     try {
//       const response = await employeeAPI.getDepartments();
//       setDepartments(response.data);
//     } catch (error) {
//       console.error('Error fetching departments:', error);
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!inputMessage.trim()) return;

//     const userMessage: Message = {
//       id: Date.now(),
//       type: 'user',
//       content: inputMessage
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setInputMessage('');
//     setIsLoading(true);

//     try {
//       const response = await employeeAPI.askQuestion(inputMessage);

//       const botMessage: Message = {
//         id: Date.now() + 1,
//         type: 'bot',
//         content: response.answer,
//         relevantEmployees: response.relevantEmployees
//       };

//       setMessages(prev => [...prev, botMessage]);
//     } catch (error) {
//       console.error('Error sending message:', error);
//       toast.error('Failed to get response. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const handleSearch = async () => {
//     if (!searchQuery.trim()) {
//       await fetchEmployees();
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await employeeAPI.searchEmployees(searchQuery);
//       setEmployees(response.data);
//     } catch (error) {
//       console.error('Error searching employees:', error);
//       toast.error('Search failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteEmployee = async (employee: Employee) => {
//     if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
//       try {
//         await employeeAPI.deleteEmployee(employee.employeeId);
//         toast.success('Employee deleted successfully!');
//         fetchEmployees();
//         fetchStatistics();
//       } catch (error) {
//         console.error('Error deleting employee:', error);
//         toast.error('Failed to delete employee');
//       }
//     }
//   };

//   const handleFormSuccess = () => {
//     fetchEmployees();
//     fetchStatistics();
//     fetchDepartments();
//   };

//   return (
//     <div className="min-h-screen">
//       <Toaster position="top-right" />

//       {/* Header */}
//       <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
//                 <MessageCircle className="text-white w-6 h-6" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//                   Employee RAG System
//                 </h1>
//                 <p className="text-sm text-gray-500">AI-Powered HR Management</p>
//               </div>
//             </div>

//             <div className="flex space-x-2">
//               {['chat', 'employees', 'analytics'].map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab as TabType)}
//                   className={`px-4 py-2 rounded-lg transition-all capitalize ${activeTab === tab
//                     ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
//                     : 'text-gray-600 hover:bg-gray-100'
//                     }`}
//                 >
//                   {tab === 'chat' && <MessageCircle className="inline w-4 h-4 mr-2" />}
//                   {tab === 'employees' && <Users className="inline w-4 h-4 mr-2" />}
//                   {tab === 'analytics' && <BarChart3 className="inline w-4 h-4 mr-2" />}
//                   {tab}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="container mx-auto px-4 py-8">
//         {/* Chat Tab */}
//         {activeTab === 'chat' && (
//           <div className="max-w-6xl mx-auto">
//             <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//               <div className="h-[600px] overflow-y-auto p-6 space-y-4">
//                 {messages.map((message) => (
//                   <ChatMessage key={message.id} message={message} />
//                 ))}

//                 {isLoading && (
//                   <div className="flex justify-start">
//                     <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
//                       <div className="flex space-x-2">
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="border-t border-gray-200 p-4 bg-gray-50">
//                 <div className="flex space-x-2">
//                   <textarea
//                     value={inputMessage}
//                     onChange={(e) => setInputMessage(e.target.value)}
//                     onKeyPress={handleKeyPress}
//                     placeholder="Ask me anything about employees... (e.g., 'Who works in Engineering?', 'What skills does Amit have?')"
//                     className="flex-1 resize-none rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     rows={2}
//                   />
//                   <button
//                     onClick={handleSendMessage}
//                     disabled={isLoading || !inputMessage.trim()}
//                     className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     <Send className="w-5 h-5" />
//                   </button>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-2">
//                   💡 Try: "Who has React skills?" or "Show me senior engineers" or "Employees in Marketing department"
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Employees Tab */}
//         {activeTab === 'employees' && (
//           <div className="space-y-6">
//             {/* Search and Add Bar */}
//             <div className="bg-white rounded-xl shadow-md p-4">
//               <div className="flex gap-2">
//                 <div className="flex-1 relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="text"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//                     placeholder="Search by name, position, or department..."
//                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//                 <button
//                   onClick={handleSearch}
//                   className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
//                 >
//                   Search
//                 </button>
//                 <button
//                   onClick={() => {
//                     setEditingEmployee(null);
//                     setShowEmployeeForm(true);
//                   }}
//                   className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition flex items-center gap-2"
//                 >
//                   <Plus className="w-5 h-5" />
//                   Add Employee
//                 </button>
//               </div>
//             </div>

//             {/* Employee Cards */}
//             {loading ? (
//               <div className="text-center py-12">
//                 <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {employees.map((employee) => (
//                   <EmployeeCard
//                     key={employee._id}
//                     employee={employee}
//                     onClick={setSelectedEmployee}
//                     onEdit={(emp) => {
//                       setEditingEmployee(emp);
//                       setShowEmployeeForm(true);
//                     }}
//                     onDelete={handleDeleteEmployee}
//                   />
//                 ))}
//               </div>
//             )}

//             {employees.length === 0 && !loading && (
//               <div className="text-center py-12">
//                 <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                 <p className="text-gray-500">No employees found</p>
//                 <button
//                   onClick={() => {
//                     setEditingEmployee(null);
//                     setShowEmployeeForm(true);
//                   }}
//                   className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
//                 >
//                   Add Your First Employee
//                 </button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Analytics Tab */}
//         {activeTab === 'analytics' && statistics && (
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//               <div className="bg-white rounded-xl shadow-md p-6 card-hover">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-gray-500 text-sm">Total Employees</p>
//                     <p className="text-3xl font-bold text-gray-800">{statistics.totalEmployees}</p>
//                   </div>
//                   <div className="bg-blue-100 p-3 rounded-full">
//                     <Users className="w-6 h-6 text-blue-600" />
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-md p-6 card-hover">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-gray-500 text-sm">Average Salary</p>
//                     <p className="text-3xl font-bold text-gray-800">
//                       ₹{(statistics.averageSalary / 100000).toFixed(1)}L
//                     </p>
//                   </div>
//                   <div className="bg-green-100 p-3 rounded-full">
//                     <BarChart3 className="w-6 h-6 text-green-600" />
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-md p-6 card-hover">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-gray-500 text-sm">Departments</p>
//                     <p className="text-3xl font-bold text-gray-800">{departments.length}</p>
//                   </div>
//                   <div className="bg-purple-100 p-3 rounded-full">
//                     <Users className="w-6 h-6 text-purple-600" />
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-md p-6 card-hover">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-gray-500 text-sm">Performance</p>
//                     <p className="text-3xl font-bold text-gray-800">{statistics.performance?.length || 0}</p>
//                   </div>
//                   <div className="bg-yellow-100 p-3 rounded-full">
//                     <BarChart3 className="w-6 h-6 text-yellow-600" />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-xl shadow-md p-6">
//               <h3 className="text-lg font-bold mb-4">Department Distribution</h3>
//               <div className="space-y-3">
//                 {statistics.departments?.map((dept: any, idx: any) => (
//                   <div key={idx}>
//                     <div className="flex justify-between text-sm mb-1">
//                       <span className="font-medium">{dept._id}</span>
//                       <span className="text-gray-500">{dept.count} employees</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div
//                         className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
//                         style={{ width: `${(dept.count / statistics.totalEmployees) * 100}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="bg-white rounded-xl shadow-md p-6">
//               <h3 className="text-lg font-bold mb-4">Performance Ratings</h3>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {statistics.performance?.map((perf: any, idx: any) => (
//                   <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg">
//                     <p className="text-2xl font-bold text-gray-800">{perf.count}</p>
//                     <p className="text-sm text-gray-600">{perf._id}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}
//       </main>

//       {/* Employee Detail Modal */}
//       {selectedEmployee && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
//           <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h2 className="text-2xl font-bold text-white">{selectedEmployee.name}</h2>
//                   <p className="text-blue-100">{selectedEmployee.position}</p>
//                 </div>
//                 <button
//                   onClick={() => setSelectedEmployee(null)}
//                   className="text-white hover:bg-white/20 rounded-lg p-1 transition"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>
//             </div>

//             <div className="p-6 space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-xs text-gray-500">Employee ID</p>
//                   <p className="font-medium">{selectedEmployee.employeeId}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500">Department</p>
//                   <p className="font-medium">{selectedEmployee.department}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500">Email</p>
//                   <p className="font-medium">{selectedEmployee.email}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500">Phone</p>
//                   <p className="font-medium">{selectedEmployee.phone || 'Not provided'}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500">Age</p>
//                   <p className="font-medium">{selectedEmployee.age} years</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500">Joined</p>
//                   <p className="font-medium">{selectedEmployee.joiningDate}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500">Annual Salary</p>
//                   <p className="font-medium">₹{selectedEmployee.salary.toLocaleString()}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500">Leave Balance</p>
//                   <p className="font-medium">{selectedEmployee.leaveBalance} days</p>
//                 </div>
//               </div>

//               {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
//                 <div>
//                   <p className="text-sm font-semibold mb-2">Skills</p>
//                   <div className="flex flex-wrap gap-2">
//                     {selectedEmployee.skills.map((skill, idx) => (
//                       <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
//                         {skill}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {selectedEmployee.projects && selectedEmployee.projects.length > 0 && (
//                 <div>
//                   <p className="text-sm font-semibold mb-2">Projects</p>
//                   <div className="flex flex-wrap gap-2">
//                     {selectedEmployee.projects.map((project, idx) => (
//                       <span key={idx} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
//                         {project}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {selectedEmployee.address && (
//                 <div>
//                   <p className="text-sm font-semibold mb-2">Address</p>
//                   <p className="text-gray-600">{selectedEmployee.address}</p>
//                 </div>
//               )}

//               <div className="bg-gray-50 rounded-lg p-4">
//                 <p className="text-sm font-semibold mb-2">Performance Rating</p>
//                 <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedEmployee.performance === 'Outstanding' ? 'bg-green-100 text-green-700' :
//                   selectedEmployee.performance === 'Excellent' ? 'bg-blue-100 text-blue-700' :
//                     'bg-yellow-100 text-yellow-700'
//                   }`}>
//                   {selectedEmployee.performance}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Employee Form Modal */}
//       {showEmployeeForm && (
//         <EmployeeForm
//           employee={editingEmployee}
//           onClose={() => {
//             setShowEmployeeForm(false);
//             setEditingEmployee(null);
//           }}
//           onSuccess={handleFormSuccess}
//         />
//       )}
//     </div>
//   );
// }

// export default App;




import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Users, BarChart3, Send, Plus, Search, X, Sparkles } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { ChatMessage } from './components/ChatMessage';
import { EmployeeCard } from './components/EmployeeCard';
import { EmployeeForm } from './components/EmployeeForm';
import { employeeAPI } from './services/api';
import type { Employee, Message } from './types';

type TabType = 'chat' | 'employees' | 'analytics';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: "👋 Hello! I'm your AI-powered HR Assistant. Ask me anything about your workforce — skills, salaries, performance, departments, or analytics.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEmployees();
    fetchStatistics();
    fetchDepartments();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeAPI.getEmployees();
      setEmployees(response.employees);
    } catch {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await employeeAPI.getStatistics();
      setStatistics(response.data);
    } catch { }
  };

  const fetchDepartments = async () => {
    try {
      const response = await employeeAPI.getDepartments();
      setDepartments(response.data);
    } catch { }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage: Message = { id: Date.now(), type: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    try {
      const response = await employeeAPI.askQuestion(inputMessage);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: response.answer,
        relevantEmployees: response.relevantEmployees,
      }]);
    } catch {
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { await fetchEmployees(); return; }
    setLoading(true);
    try {
      const response = await employeeAPI.searchEmployees(searchQuery);
      setEmployees(response.data);
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (window.confirm(`Delete ${employee.name}?`)) {
      try {
        await employeeAPI.deleteEmployee(employee.employeeId);
        toast.success('Employee removed');
        fetchEmployees(); fetchStatistics();
      } catch {
        toast.error('Failed to delete employee');
      }
    }
  };

  const handleFormSuccess = () => { fetchEmployees(); fetchStatistics(); fetchDepartments(); };

  const suggestions = [
    'Who has the highest salary?',
    'Show analytics report',
    'List all employees',
    'Who knows React?',
  ];

  return (
    <div className="app-root">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e1e2e', color: '#cdd6f4', border: '1px solid #313244', borderRadius: '12px' },
      }} />

      {/* Ambient background */}
      <div className="ambient-bg" />

      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className="brand-title">PeopleIQ</h1>
              <p className="brand-sub">AI-Powered HR Intelligence</p>
            </div>
          </div>

          <nav className="tab-nav">
            {([['chat', MessageCircle, 'Chat'], ['employees', Users, 'Employees'], ['analytics', BarChart3, 'Analytics']] as const).map(
              ([tab, Icon, label]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`tab-btn ${activeTab === tab ? 'tab-active' : ''}`}
                >
                  <Icon size={15} />
                  {label}
                  {tab === 'employees' && employees.length > 0 && (
                    <span className="tab-badge">{employees.length}</span>
                  )}
                </button>
              )
            )}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="app-main">

        {/* ── CHAT TAB ── */}
        {activeTab === 'chat' && (
          <div className="chat-layout">
            <div className="chat-panel">
              {/* Messages */}
              <div className="chat-messages">
                {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                {isLoading && (
                  <div className="typing-indicator">
                    <div className="typing-avatar"><Sparkles size={12} /></div>
                    <div className="typing-dots">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions */}
              {messages.length === 1 && (
                <div className="suggestions">
                  {suggestions.map(s => (
                    <button key={s} className="suggestion-chip" onClick={() => setInputMessage(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="chat-input-area">
                <div className="chat-input-wrap">
                  <textarea
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything about your workforce..."
                    className="chat-textarea"
                    rows={1}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="send-btn"
                  >
                    <Send size={16} />
                  </button>
                </div>
                <p className="input-hint">Press Enter to send · Shift+Enter for new line</p>
              </div>
            </div>
          </div>
        )}

        {/* ── EMPLOYEES TAB ── */}
        {activeTab === 'employees' && (
          <div className="employees-layout">
            <div className="employees-toolbar">
              <div className="search-wrap">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by name, role, department..."
                  className="search-input"
                />
                {searchQuery && (
                  <button className="search-clear" onClick={() => { setSearchQuery(''); fetchEmployees(); }}>
                    <X size={14} />
                  </button>
                )}
              </div>
              <button onClick={handleSearch} className="btn-secondary">Search</button>
              <button onClick={() => { setEditingEmployee(null); setShowEmployeeForm(true); }} className="btn-primary">
                <Plus size={15} /> Add Employee
              </button>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Loading employees...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Users size={32} /></div>
                <h3>No employees yet</h3>
                <p>Add your first team member to get started</p>
                <button className="btn-primary" onClick={() => { setEditingEmployee(null); setShowEmployeeForm(true); }}>
                  <Plus size={15} /> Add First Employee
                </button>
              </div>
            ) : (
              <div className="employee-grid">
                {employees.map(emp => (
                  <EmployeeCard
                    key={emp._id}
                    employee={emp}
                    onClick={setSelectedEmployee}
                    onEdit={e => { setEditingEmployee(e); setShowEmployeeForm(true); }}
                    onDelete={handleDeleteEmployee}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && statistics && (
          <div className="analytics-layout">
            {/* KPI Cards */}
            <div className="kpi-grid">
              {[
                { label: 'Total Employees', value: statistics.totalEmployees, icon: Users, color: 'blue' },
                { label: 'Avg. Annual Salary', value: `₹${(statistics.averageSalary / 100000).toFixed(1)}L`, icon: BarChart3, color: 'emerald' },
                { label: 'Departments', value: departments.length, icon: Sparkles, color: 'violet' },
                { label: 'Rating Levels', value: statistics.performance?.length || 0, icon: MessageCircle, color: 'amber' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className={`kpi-card kpi-${color}`}>
                  <div className="kpi-icon"><Icon size={20} /></div>
                  <div>
                    <p className="kpi-label">{label}</p>
                    <p className="kpi-value">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="analytics-grid">
              {/* Department Distribution */}
              <div className="analytics-card">
                <h3 className="analytics-title">Department Distribution</h3>
                <div className="dept-list">
                  {statistics.departments?.map((dept: any, idx: number) => {
                    const pct = Math.round((dept.count / statistics.totalEmployees) * 100);
                    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
                    return (
                      <div key={idx} className="dept-row">
                        <div className="dept-info">
                          <span className="dept-dot" style={{ background: colors[idx % colors.length] }} />
                          <span className="dept-name">{dept._id}</span>
                          <span className="dept-count">{dept.count}</span>
                        </div>
                        <div className="dept-bar-track">
                          <div
                            className="dept-bar-fill"
                            style={{ width: `${pct}%`, background: colors[idx % colors.length] }}
                          />
                        </div>
                        <span className="dept-pct">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Performance Ratings */}
              <div className="analytics-card">
                <h3 className="analytics-title">Performance Ratings</h3>
                <div className="perf-grid">
                  {statistics.performance?.map((perf: any, idx: number) => {
                    const emoji: Record<string, string> = { Outstanding: '🌟', Excellent: '⭐', Good: '👍', Average: '📊' };
                    const colors = ['#10b981', '#6366f1', '#f59e0b', '#94a3b8'];
                    return (
                      <div key={idx} className="perf-card" style={{ borderColor: colors[idx % colors.length] + '40', background: colors[idx % colors.length] + '10' }}>
                        <span className="perf-emoji">{emoji[perf._id] || '📈'}</span>
                        <p className="perf-count" style={{ color: colors[idx % colors.length] }}>{perf.count}</p>
                        <p className="perf-label">{perf._id}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="modal-backdrop" onClick={() => setSelectedEmployee(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-avatar">
                {selectedEmployee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h2 className="modal-name">{selectedEmployee.name}</h2>
                <p className="modal-role">{selectedEmployee.position} · {selectedEmployee.department}</p>
              </div>
              <button className="modal-close" onClick={() => setSelectedEmployee(null)}><X size={18} /></button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                {[
                  ['Employee ID', selectedEmployee.employeeId],
                  ['Email', selectedEmployee.email],
                  ['Phone', selectedEmployee.phone || '—'],
                  ['Age', `${selectedEmployee.age} years`],
                  ['Joined', selectedEmployee.joiningDate],
                  ['Annual Salary', `₹${selectedEmployee.salary.toLocaleString('en-IN')}`],
                  ['Leave Balance', `${selectedEmployee.leaveBalance} days`],
                  ['Performance', selectedEmployee.performance],
                ].map(([label, val]) => (
                  <div key={label} className="detail-item">
                    <p className="detail-label">{label}</p>
                    <p className={`detail-value ${label === 'Performance' ? `perf-badge perf-${val?.toString().toLowerCase()}` : ''}`}>{val}</p>
                  </div>
                ))}
              </div>

              {selectedEmployee.skills?.length > 0 && (
                <div className="detail-section">
                  <p className="detail-section-title">Skills</p>
                  <div className="tag-list">
                    {selectedEmployee.skills.map((s, i) => <span key={i} className="tag tag-blue">{s}</span>)}
                  </div>
                </div>
              )}
              {selectedEmployee.projects?.length > 0 && (
                <div className="detail-section">
                  <p className="detail-section-title">Projects</p>
                  <div className="tag-list">
                    {selectedEmployee.projects.map((p, i) => <span key={i} className="tag tag-green">{p}</span>)}
                  </div>
                </div>
              )}
              {selectedEmployee.address && (
                <div className="detail-section">
                  <p className="detail-section-title">Address</p>
                  <p className="detail-address">{selectedEmployee.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Employee Form Modal */}
      {showEmployeeForm && (
        <EmployeeForm
          employee={editingEmployee}
          onClose={() => { setShowEmployeeForm(false); setEditingEmployee(null); }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

export default App;