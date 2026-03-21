// Base API URL
const API_URL = 'http://localhost:5000/api';

// Utility to handle API calls
async function fetchAPI(endpoint, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong!');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Alert system
function showAlert(message, type = 'success') {
  const container = document.getElementById('alert-container');
  if (!container) return;

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;

  container.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.classList.add('fade-out');
    setTimeout(() => {
      alertDiv.remove();
    }, 500);
  }, 3000);
}

// Check auth state and redirect if needed
function checkAuth(requireRole = null) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user) {
    window.location.href = 'login.html';
    return null;
  }

  if (requireRole && user.role !== requireRole) {
    if (user.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  }
  
  // Set user name in navbar
  const userNameEl = document.getElementById('user-name');
  if (userNameEl) {
    userNameEl.textContent = user.name;
  }

  return user;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}
