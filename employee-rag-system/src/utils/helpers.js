export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const formatPhoneNumber = (phone) => {
  return phone.replace(/(\d{5})(\d{5})/, "$1-$2");
};

export const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const generateEmployeeId = async (collection) => {
  const lastEmployee = await collection.findOne(
    {},
    { sort: { employeeId: -1 } },
  );
  const lastId = lastEmployee?.employeeId || "EMP1000";
  const num = parseInt(lastId.replace("EMP", "")) + 1;
  return `EMP${num}`;
};
