// User utility functions for managing user data

export const getUserData = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const getUserId = () => {
  return localStorage.getItem('userId');
};

export const getUserFullName = () => {
  return localStorage.getItem('userFullName');
};

export const getUserDepartment = () => {
  return localStorage.getItem('userDepartment');
};

export const getUserDepartmentId = () => {
  return localStorage.getItem('userDepartmentId');
};

export const getUserPermittedDepartments = () => {
  try {
    const permittedDepts = localStorage.getItem('userPermittedDepartments');
    return permittedDepts ? JSON.parse(permittedDepts) : [];
  } catch (error) {
    console.error('Error parsing permitted departments:', error);
    return [];
  }
};

export const isUserExecutive = () => {
  return localStorage.getItem('userIsExecutive') === 'true';
};

export const isUserLoggedIn = () => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

export const canUserAccessDepartment = (departmentId) => {
  const permittedDepts = getUserPermittedDepartments();
  return permittedDepts.some(dept => dept.id === parseInt(departmentId));
};

export const getUserPermissions = () => {
  const userData = getUserData();
  if (!userData) return null;
  
  return {
    isExecutive: userData.is_executive,
    department: userData.department,
    permittedDepartments: userData.permitted_departments,
    canCreateAgreements: userData.permitted_departments.length > 0 || userData.is_executive
  };
};

export const clearUserData = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userData');
  localStorage.removeItem('userId');
  localStorage.removeItem('userFullName');
  localStorage.removeItem('userDepartment');
  localStorage.removeItem('userDepartmentId');
  localStorage.removeItem('userPermittedDepartments');
  localStorage.removeItem('userIsExecutive');
};

export const updateUserData = (newUserData) => {
  localStorage.setItem('userData', JSON.stringify(newUserData));
  // Update individual fields as well
  localStorage.setItem('userId', newUserData.id);
  localStorage.setItem('userFullName', newUserData.full_name);
  localStorage.setItem('userDepartment', newUserData.department ? newUserData.department.name : '');
  localStorage.setItem('userDepartmentId', newUserData.department ? newUserData.department.id : '');
  localStorage.setItem('userPermittedDepartments', JSON.stringify(newUserData.permitted_departments));
  localStorage.setItem('userIsExecutive', newUserData.is_executive);
};

export const logout = async () => {
  try {
    // Call Django logout endpoint
    const response = await fetch('/api/accounts/logout/', {
      method: 'POST',
      credentials: 'include',
    });
    
    if (response.ok) {
      console.log('Logout successful');
    } else {
      console.error('Logout failed');
    }
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    // Clear local storage regardless of server response
    clearUserData();
  }
}; 