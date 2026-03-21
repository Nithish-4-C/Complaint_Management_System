// ==========================================
// Admin Dashboard Logic
// Tabs, Search, Filter, Sort, Charts, Quick Actions
// ==========================================

let allComplaints = [];
let currentFilter = '';

// On page load: check auth, load stats, load complaints
document.addEventListener('DOMContentLoaded', () => {
  const user = checkAuth('admin');
  if (user) {
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('user-avatar').textContent = initials;
    loadStats();
    loadAllComplaints();
  }
});

// Load summary stats and chart
async function loadStats() {
  try {
    const stats = await fetchAPI('/complaints/stats');
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-progress').textContent = stats.inProgress;
    document.getElementById('stat-resolved').textContent = stats.resolved;
    updateChart(stats);
  } catch (error) {
    console.error('Stats load error:', error);
  }
}

// Update bar chart visualization
function updateChart(stats) {
  const max = Math.max(stats.pending, stats.inProgress, stats.resolved, 1);
  const maxHeight = 120;
  document.getElementById('chart-val-pending').textContent = stats.pending;
  document.getElementById('chart-val-progress').textContent = stats.inProgress;
  document.getElementById('chart-val-resolved').textContent = stats.resolved;
  document.getElementById('chart-bar-pending').style.height = `${(stats.pending / max) * maxHeight}px`;
  document.getElementById('chart-bar-progress').style.height = `${(stats.inProgress / max) * maxHeight}px`;
  document.getElementById('chart-bar-resolved').style.height = `${(stats.resolved / max) * maxHeight}px`;
}

// Badge helpers
function getStatusBadgeClass(status) {
  if (status === 'Pending') return 'badge-pending';
  if (status === 'In Progress') return 'badge-progress';
  if (status === 'Resolved') return 'badge-resolved';
  return '';
}

function getPriorityBadgeClass(priority) {
  if (priority === 'High') return 'badge-priority-high';
  if (priority === 'Medium') return 'badge-priority-medium';
  if (priority === 'Low') return 'badge-priority-low';
  return '';
}

// Fetch complaints from API with current filters
async function loadAllComplaints() {
  const listEl = document.getElementById('admin-complaints-list');
  listEl.innerHTML = '<tr><td colspan="7"><div class="spinner-container"><div class="spinner"></div></div></td></tr>';

  try {
    const search = document.getElementById('search-input').value;
    const category = document.getElementById('filter-category').value;
    const sort = document.getElementById('sort-order').value;

    let params = new URLSearchParams();
    if (search) params.append('search', search);
    if (currentFilter) params.append('status', currentFilter);
    if (category) params.append('category', category);
    if (sort === 'oldest') params.append('sort', 'oldest');

    const queryString = params.toString();
    allComplaints = await fetchAPI(`/complaints${queryString ? '?' + queryString : ''}`);
    renderComplaints();
  } catch (error) {
    showAlert(error.message, 'error');
    listEl.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--danger);">Failed to load complaints</td></tr>';
  }
}

// Render table rows
function renderComplaints() {
  const listEl = document.getElementById('admin-complaints-list');

  if (allComplaints.length === 0) {
    listEl.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-secondary);">📭 No complaints found for this filter.</td></tr>';
    return;
  }

  listEl.innerHTML = allComplaints.map(c => `
    <tr>
      <td>
        <div style="font-weight: 600;">${c.user ? c.user.name : 'Unknown User'}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary);">${c.user ? c.user.email : ''}</div>
      </td>
      <td>
        <div style="font-weight: 600;">${c.title}</div>
        <span class="badge badge-category" style="margin-top:0.25rem;">${c.category}</span>
      </td>
      <td><span class="badge ${getPriorityBadgeClass(c.priority || 'Medium')}">⚡ ${c.priority || 'Medium'}</span></td>
      <td style="max-width: 200px;">${c.description.length > 60 ? c.description.substring(0, 60) + '...' : c.description}</td>
      <td><span class="badge ${getStatusBadgeClass(c.status)}">${c.status}</span></td>
      <td style="font-size: 0.8rem; white-space: nowrap;">${new Date(c.createdAt).toLocaleString()}</td>
      <td>
        <div class="actions-cell">
          ${c.status !== 'In Progress' ? `<button class="btn btn-sm btn-warning" onclick="quickUpdate('${c._id}', 'In Progress')">▶ In Progress</button>` : ''}
          ${c.status !== 'Resolved' ? `<button class="btn btn-sm btn-success" onclick="quickUpdate('${c._id}', 'Resolved')">✅ Resolve</button>` : ''}
          <button class="btn btn-sm btn-danger" onclick="deleteComplaint('${c._id}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Tab Switching
function filterComplaints(status) {
  currentFilter = status;

  // Update active tab
  document.querySelectorAll('.auth-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
  if (status === '') document.getElementById('tab-all').classList.add('active');
  if (status === 'Pending') document.getElementById('tab-pending').classList.add('active');
  if (status === 'In Progress') document.getElementById('tab-progress').classList.add('active');
  if (status === 'Resolved') document.getElementById('tab-resolved').classList.add('active');

  loadAllComplaints();
}

// Search handler (debounced)
let searchTimeout;
function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => loadAllComplaints(), 400);
}

// Filter/Sort handler
function applyFilters() {
  loadAllComplaints();
}

// Quick Action: Update Status
async function quickUpdate(id, newStatus) {
  try {
    await fetchAPI(`/complaints/${id}`, 'PUT', { status: newStatus });
    showAlert(`✅ Status updated to "${newStatus}"`, 'success');
    loadStats();
    loadAllComplaints();
  } catch (error) {
    showAlert('Failed to update: ' + error.message, 'error');
  }
}

// Delete Complaint with confirmation popup
async function deleteComplaint(id) {
  if (!confirm('⚠️ Are you sure you want to permanently delete this complaint? This action cannot be undone.')) return;

  try {
    await fetchAPI(`/complaints/${id}`, 'DELETE');
    showAlert('🗑️ Complaint deleted successfully', 'success');
    loadStats();
    loadAllComplaints();
  } catch (error) {
    showAlert('Failed to delete: ' + error.message, 'error');
  }
}
