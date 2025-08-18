import axios from 'axios';

export function getCSRFToken() {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

export async function ensureCSRFToken() {
  let csrfToken = getCSRFToken();
  
  if (!csrfToken) {
    try {
      await axios.get('http://127.0.0.1:8000/api/get-csrf/', {
        withCredentials: true
      });
      csrfToken = getCSRFToken();
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      throw new Error('Unable to get CSRF token');
    }
  }
  
  return csrfToken;
}
