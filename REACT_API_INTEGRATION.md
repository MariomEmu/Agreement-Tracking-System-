# React API Integration - Updated Endpoints

This document shows how the React components are now using the correct API endpoints that match the Django URL patterns.

## ✅ **Updated API Endpoints in React Components**

### **1. AgreementForm.jsx**
```javascript
// Fetch form data for creating/editing agreements
const formDataResponse = await axios.get('http://127.0.0.1:8000/api/agreements/add/', {
  withCredentials: true
});

// Fetch vendors list
const vendorsResponse = await axios.get('http://127.0.0.1:8000/api/accounts/vendors/', {
  withCredentials: true
});
```

**Purpose**: 
- Gets departments and user info for form dropdowns
- Gets vendors list for party selection dropdown

### **2. AgreementList.jsx**
```javascript
// Fetch agreements list with user permissions
const response = await axios.get('http://127.0.0.1:8000/api/agreements/', {
  withCredentials: true
});
```

**Purpose**: 
- Gets list of agreements filtered by user permissions
- Also gets departments for filtering

### **3. AgreementPreview.jsx**
```javascript
// Submit agreement from preview
const response = await axios.post('http://127.0.0.1:8000/api/agreements/submit/', formData, {
  headers: {
    'X-CSRFToken': csrfToken,
    'Content-Type': 'multipart/form-data',
  },
  withCredentials: true
});
```

**Purpose**: 
- Submits the agreement form data to create new agreement
- Handles file uploads and form validation

### **4. PreviewAgreement/index.jsx**
```javascript
// Fetch vendors for preview dropdown
const response = await axios.get('http://127.0.0.1:8000/api/accounts/vendors/', {
  withCredentials: true
});
```

**Purpose**: 
- Gets vendors list for the preview component dropdown

## **API Endpoint Mapping**

| React Component | API Endpoint | Purpose |
|----------------|--------------|---------|
| AgreementForm | `GET /api/agreements/add/` | Get form data (departments, user info) |
| AgreementForm | `GET /api/accounts/vendors/` | Get vendors list |
| AgreementList | `GET /api/agreements/` | Get agreements list |
| AgreementPreview | `POST /api/agreements/submit/` | Submit agreement |
| PreviewAgreement | `GET /api/accounts/vendors/` | Get vendors for preview |

## **Key Features Implemented**

### **1. Proper Error Handling**
```javascript
try {
  const response = await axios.get('http://127.0.0.1:8000/api/agreements/add/', {
    withCredentials: true
  });
  // Handle success
} catch (error) {
  console.error('Error fetching data:', error);
  setErrors({ general: 'Failed to load form data. Please refresh the page.' });
}
```

### **2. CSRF Token Handling**
```javascript
// Automatic CSRF token inclusion via axios interceptors
const response = await axios.post('http://127.0.0.1:8000/api/agreements/submit/', formData, {
  headers: {
    'X-CSRFToken': csrfToken,
    'Content-Type': 'multipart/form-data',
  },
  withCredentials: true
});
```

### **3. Loading States**
```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// In useEffect
setLoading(true);
try {
  // API call
} catch (error) {
  setError('Failed to load agreements');
} finally {
  setLoading(false);
}
```

### **4. Data Handling**
```javascript
// Handle both array and paginated responses
const agreementsData = Array.isArray(response.data) 
  ? response.data 
  : (response.data.agreements || response.data.results || []);

setAgreements(agreementsData);
```

## **Authentication & Security**

### **1. Session-based Authentication**
- All requests include `withCredentials: true`
- CSRF tokens automatically included
- Session cookies handled properly

### **2. User Permissions**
- API endpoints respect user permissions
- Executive users see all agreements but cannot create/edit
- Regular users see only their department's agreements

### **3. Error Responses**
- 403: Permission denied
- 401: Not authenticated
- 400: Validation errors
- 500: Server errors

## **Usage Examples**

### **Creating a New Agreement**
1. User fills form in `AgreementForm`
2. Form data fetched from `/api/agreements/add/`
3. Vendors fetched from `/api/accounts/vendors/`
4. User submits to preview
5. Preview submits to `/api/agreements/submit/`

### **Viewing Agreements List**
1. `AgreementList` fetches from `/api/agreements/`
2. Agreements filtered by user permissions
3. Departments available for filtering

### **Editing Agreement**
1. User clicks edit in `AgreementList`
2. Form data fetched from `/api/agreements/add/`
3. Existing data populated in form
4. Submit to `/api/agreements/submit/`

## **Benefits of This Integration**

✅ **Consistent URL Patterns**: React uses same URLs as Django views
✅ **Proper Authentication**: Session-based auth with CSRF protection
✅ **Error Handling**: Comprehensive error handling and user feedback
✅ **Loading States**: Proper loading indicators for better UX
✅ **Data Validation**: Server-side validation with client-side feedback
✅ **File Uploads**: Proper handling of file attachments
✅ **User Permissions**: Respects Django's permission system

The React frontend is now fully integrated with the Django API endpoints and follows the same URL patterns as the original Django views! 