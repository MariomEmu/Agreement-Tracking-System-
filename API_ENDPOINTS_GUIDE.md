# API Endpoints Guide for React Frontend

This document outlines all the API endpoints available for the React frontend to replace the Django HTML templates.

## Authentication Endpoints

### Login
- **URL**: `POST /api/accounts/login/`
- **Purpose**: Authenticate user and get session data
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login successful",
    "csrfToken": "csrf_token_here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "department": {
        "id": 1,
        "name": "IT Department"
      },
      "permitted_departments": [...],
      "is_executive": false
    }
  }
  ```

### Logout
- **URL**: `POST /api/accounts/logout/`
- **Purpose**: Logout user and clear session
- **Response**:
  ```json
  {
    "message": "Logged out successfully."
  }
  ```

### Dashboard
- **URL**: `GET /api/accounts/dashboard/`
- **Purpose**: Get dashboard data for authenticated user
- **Response**:
  ```json
  {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "department": {
        "id": 1,
        "name": "IT Department"
      },
      "is_executive": false
    },
    "permissions": {
      "permitted_departments": [...],
      "can_create_agreements": true,
      "can_edit_agreements": true
    }
  }
  ```

## Agreement Endpoints

### Get Agreement List
- **URL**: `GET /api/agreements/`
- **Purpose**: Get list of agreements with user permissions
- **Response**:
  ```json
  {
    "agreements": [
      {
        "id": 1,
        "title": "Service Agreement",
        "agreement_reference": "REF-2024-001",
        "department": 1,
        "party_name": 1,
        "start_date": "2024-01-01",
        "expiry_date": "2024-12-31",
        "reminder_time": "2024-11-30",
        "status": "ongoing",
        "creator": 1,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "departments": [
      {
        "id": 1,
        "name": "IT Department"
      }
    ]
  }
  ```

### Get Agreement Detail
- **URL**: `GET /api/agreements/{id}/`
- **Purpose**: Get detailed information about a specific agreement
- **Response**:
  ```json
  {
    "id": 1,
    "title": "Service Agreement",
    "agreement_reference": "REF-2024-001",
    "department": 1,
    "party_name": 1,
    "start_date": "2024-01-01",
    "expiry_date": "2024-12-31",
    "reminder_time": "2024-11-30",
    "status": "ongoing",
    "creator": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
  ```

### Get Form Data
- **URL**: `GET /api/agreements/add/`
- **Purpose**: Get form data for creating/editing agreements
- **Response**:
  ```json
  {
    "departments": [
      {
        "id": 1,
        "name": "IT Department"
      }
    ],
    "user_info": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "department": {
        "id": 1,
        "name": "IT Department"
      }
    }
  }
  ```

### Submit Agreement
- **URL**: `POST /api/agreements/submit/`
- **Purpose**: Submit agreement from preview
- **Request Body** (FormData):
  ```
  title: "Service Agreement"
  agreement_reference: "REF-2024-001"
  agreement_type: 1
  party_name: 1
  start_date: "2024-01-01"
  expiry_date: "2024-12-31"
  reminder_time: "2024-11-30"
  status: "ongoing"
  attachment: [file]
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Agreement created successfully!",
    "agreement_id": 1
  }
  ```

### Edit Agreement
- **URL**: `GET /api/agreements/edit/{agreement_id}/` (get data)
- **URL**: `PUT /api/agreements/edit/{agreement_id}/` (update)
- **Purpose**: Edit an existing agreement
- **Request Body** (for PUT):
  ```json
  {
    "title": "Updated Service Agreement",
    "status": "expired"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Agreement updated successfully!",
    "agreement": {...}
  }
  ```

## Supporting Endpoints

### Get Vendors
- **URL**: `GET /api/accounts/vendors/`
- **Purpose**: Get list of all vendors
- **Response**:
  ```json
  [
    {
      "id": 1,
      "name": "ABC Company"
    },
    {
      "id": 2,
      "name": "XYZ Corporation"
    }
  ]
  ```

### Get My Departments
- **URL**: `GET /api/accounts/my_departments/`
- **Purpose**: Get departments where user has access
- **Response**:
  ```json
  [
    {
      "id": 1,
      "name": "IT Department"
    }
  ]
  ```

### Get All Departments
- **URL**: `GET /api/accounts/departments/`
- **Purpose**: Get all departments
- **Response**:
  ```json
  [
    {
      "id": 1,
      "name": "IT Department"
    },
    {
      "id": 2,
      "name": "HR Department"
    }
  ]
  ```

## React Integration Examples

### Login Component
```javascript
const handleLogin = async (email, password) => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/accounts/login/', {
      email,
      password
    }, {
      withCredentials: true
    });
    
    // Store user data in context/state
    setUser(response.data.user);
    setCsrfToken(response.data.csrfToken);
    
    // Navigate to dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Agreement List Component
```javascript
const fetchAgreements = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/agreements/', {
      withCredentials: true
    });
    
    setAgreements(response.data.agreements);
    setDepartments(response.data.departments);
  } catch (error) {
    console.error('Error fetching agreements:', error);
  }
};
```

### Agreement Form Component
```javascript
const fetchFormData = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/agreements/add/', {
      withCredentials: true
    });
    
    setDepartments(response.data.departments);
    setUserInfo(response.data.user_info);
  } catch (error) {
    console.error('Error fetching form data:', error);
  }
};
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created (for POST requests)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (no permission)
- `404`: Not Found
- `500`: Internal Server Error

Error responses include:
```json
{
  "error": "Error message",
  "errors": {
    "field_name": ["Field error message"]
  }
}
```

## CSRF Token

For POST/PUT/DELETE requests, include the CSRF token in headers:
```javascript
const headers = {
  'X-CSRFToken': csrfToken,
  'Content-Type': 'application/json'
};
```

## File Uploads

For file uploads, use FormData:
```javascript
const formData = new FormData();
formData.append('title', title);
formData.append('attachment', file);

const response = await axios.post('/api/agreements/submit/', formData, {
  headers: {
    'X-CSRFToken': csrfToken,
    'Content-Type': 'multipart/form-data'
  },
  withCredentials: true
});
``` 