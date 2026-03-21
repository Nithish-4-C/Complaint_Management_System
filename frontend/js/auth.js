// Check if already logged in
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (token && user) {
    if (user.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  }
});

// Tab switching
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active-form'));

  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`${tab}-form`).classList.add('active-form');
}

// Login Form Handling
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const data = await fetchAPI('/auth/login', 'POST', { email, password });
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showAlert('✅ Login successful!', 'success');

    setTimeout(() => {
      if (data.user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    }, 1000);
  } catch (error) {
    showAlert(error.message, 'error');
  }
});

// Register Form Handling (Enhanced with new fields)
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('reg-name').value;
  const registerNumber = document.getElementById('reg-register-number').value;
  const phone = document.getElementById('reg-phone').value;
  const email = document.getElementById('reg-email').value;
  const department = document.getElementById('reg-department').value;
  const domain = document.getElementById('reg-domain').value;
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;

  // Basic client-side validation
  if (!name || !registerNumber || !phone || !email || !department || !domain || !password) {
    showAlert('Please fill in all fields', 'error');
    return;
  }

  // Phone number validation (10 digits)
  if (!/^\d{10}$/.test(phone)) {
    showAlert('Phone number must be exactly 10 digits', 'error');
    return;
  }

  try {
    const data = await fetchAPI('/auth/register', 'POST', {
      name, registerNumber, phone, email, department, domain, password, role
    });
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showAlert('✅ Registration successful!', 'success');

    setTimeout(() => {
      if (data.user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    }, 1000);
  } catch (error) {
    showAlert(error.message, 'error');
  }
});
