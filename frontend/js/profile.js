// ==========================================
// User Profile Page Logic
// Fetches profile from API and complaint stats
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const user = checkAuth('user');
  if (user) {
    loadProfile();
    loadProfileStats();
  }
});

// Load full profile from API
async function loadProfile() {
  try {
    const profile = await fetchAPI('/auth/profile');

    // Set avatar initials
    const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('p-avatar').textContent = initials;
    document.getElementById('user-avatar').textContent = initials;
    document.getElementById('user-name').textContent = profile.name;

    // Hero section
    document.getElementById('p-name').textContent = profile.name;
    document.getElementById('p-role').textContent = profile.role === 'admin' ? 'Administrator' : 'Student';

    // Details
    document.getElementById('d-name').textContent = profile.name || '—';
    document.getElementById('d-regnum').textContent = profile.registerNumber || '—';
    document.getElementById('d-email').textContent = profile.email || '—';
    document.getElementById('d-phone').textContent = profile.phone || '—';
    document.getElementById('d-dept').textContent = profile.department || '—';
    document.getElementById('d-domain').textContent = profile.domain || '—';
    document.getElementById('d-role').textContent = profile.role === 'admin' ? '🛡️ Administrator' : '🎓 Student';
    document.getElementById('d-joined').textContent = new Date(profile.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  } catch (error) {
    showAlert('Failed to load profile: ' + error.message, 'error');
  }
}

// Load complaint stats for profile
async function loadProfileStats() {
  try {
    const stats = await fetchAPI('/complaints/stats');
    document.getElementById('p-total').textContent = stats.total;
    document.getElementById('p-pending').textContent = stats.pending;
    document.getElementById('p-resolved').textContent = stats.resolved;
  } catch (error) {
    console.error('Stats error:', error);
  }
}
