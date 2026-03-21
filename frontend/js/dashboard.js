// ==========================================
// User Dashboard Logic
// Search, Filter, Sort, Charts, Spinner, Profile
// ==========================================

let allComplaints = [];

// On page load: check auth, load profile, stats, complaints
document.addEventListener('DOMContentLoaded', () => {
  const user = checkAuth('user');
  if (user) {
    setupProfile(user);
    loadStats();
    loadComplaints();
  }
});

// Setup User Profile Section
function setupProfile(user) {
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  document.getElementById('profile-avatar').textContent = initials;
  document.getElementById('user-avatar').textContent = initials;
  document.getElementById('profile-name').textContent = user.name;
  document.getElementById('profile-email').textContent = user.email;
}

// Load summary stats
async function loadStats() {
  try {
    const stats = await fetchAPI('/complaints/stats');
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-progress').textContent = stats.inProgress;
    document.getElementById('stat-resolved').textContent = stats.resolved;
    document.getElementById('profile-total').textContent = `${stats.total} complaints submitted`;
    updateChart(stats);
  } catch (error) {
    console.error('Stats load error:', error);
  }
}

// Update bar chart
function updateChart(stats) {
  const max = Math.max(stats.pending, stats.inProgress, stats.resolved, 1);
  const maxHeight = 120; // px

  document.getElementById('chart-val-pending').textContent = stats.pending;
  document.getElementById('chart-val-progress').textContent = stats.inProgress;
  document.getElementById('chart-val-resolved').textContent = stats.resolved;

  document.getElementById('chart-bar-pending').style.height = `${(stats.pending / max) * maxHeight}px`;
  document.getElementById('chart-bar-progress').style.height = `${(stats.inProgress / max) * maxHeight}px`;
  document.getElementById('chart-bar-resolved').style.height = `${(stats.resolved / max) * maxHeight}px`;
}

// Status badge helper
function getStatusBadgeClass(status) {
  if (status === 'Pending') return 'badge-pending';
  if (status === 'In Progress') return 'badge-progress';
  if (status === 'Resolved') return 'badge-resolved';
  return '';
}

// Priority badge helper
function getPriorityBadgeClass(priority) {
  if (priority === 'High') return 'badge-priority-high';
  if (priority === 'Medium') return 'badge-priority-medium';
  if (priority === 'Low') return 'badge-priority-low';
  return '';
}

// Load complaints with current query params
async function loadComplaints() {
  const listEl = document.getElementById('complaints-list');
  listEl.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';

  try {
    // Build query params from toolbar
    const search = document.getElementById('search-input').value;
    const status = document.getElementById('filter-status').value;
    const category = document.getElementById('filter-category').value;
    const sort = document.getElementById('sort-order').value;

    let params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    if (sort === 'oldest') params.append('sort', 'oldest');

    const queryString = params.toString();
    allComplaints = await fetchAPI(`/complaints${queryString ? '?' + queryString : ''}`);
    renderComplaints();
  } catch (error) {
    showAlert(error.message, 'error');
    listEl.innerHTML = '<div class="complaint-card" style="text-align:center;color:var(--danger);">Failed to load complaints</div>';
  }
}

// Render card-based complaints
function renderComplaints() {
  const listEl = document.getElementById('complaints-list');

  if (allComplaints.length === 0) {
    listEl.innerHTML = `
      <div class="complaint-card" style="text-align:center; padding: 2rem;">
        <p style="font-size:1.1rem; color:var(--text-secondary);">📭 No complaints found</p>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.5rem;">Submit your first complaint using the button above!</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = allComplaints.map((c, index) => `
    <div class="complaint-card priority-${(c.priority || 'medium').toLowerCase()}" style="animation-delay: ${index * 0.05}s">
      <div class="complaint-card-header">
        <div class="complaint-title">${c.title}</div>
        <span class="badge ${getStatusBadgeClass(c.status)}">${c.status}</span>
      </div>
      <div class="complaint-meta">
        <span class="badge badge-category">${c.category}</span>
        <span class="badge ${getPriorityBadgeClass(c.priority || 'Medium')}">⚡ ${c.priority || 'Medium'}</span>
      </div>
      <div class="complaint-desc">${c.description}</div>
      <div class="complaint-footer">
        <span class="complaint-date">📅 ${new Date(c.createdAt).toLocaleString()}</span>
      </div>
    </div>
  `).join('');
}

// Search handler (debounced)
let searchTimeout;
function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadComplaints();
  }, 400);
}

// Filter/Sort handler
function handleFilter() {
  loadComplaints();
}

// Modal Logic
function openModal() {
  document.getElementById('complaint-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('complaint-modal').style.display = 'none';
  document.getElementById('create-complaint-form').reset();
}

// Submit Complaint
document.getElementById('create-complaint-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('comp-title').value;
  const category = document.getElementById('comp-category').value;
  const priority = document.getElementById('comp-priority').value;
  const description = document.getElementById('comp-desc').value;

  try {
    await fetchAPI('/complaints', 'POST', { title, category, priority, description });
    showAlert('✅ Complaint submitted successfully!', 'success');
    closeModal();
    loadStats();
    loadComplaints();
  } catch (error) {
    showAlert(error.message, 'error');
  }
});
