// Global variables
let allData = [];
let filteredData = [];
let charts = {};
const ITEMS_PER_PAGE = 10;
let currentPage = 1;

// DOM Elements
const fileUpload = document.getElementById('fileUpload');
const totalInitiativesEl = document.getElementById('totalInitiatives');
const completedInitiativesEl = document.getElementById('completedInitiatives');
const inProgressInitiativesEl = document.getElementById('inProgressInitiatives');
const completedProgressEl = document.getElementById('completedProgress');
const inProgressProgressEl = document.getElementById('inProgressProgress');
const tableBody = document.getElementById('initiativesTableBody');
const searchInput = document.getElementById('searchInput');

// Pagination Elements
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const showingStartEl = document.getElementById('showingStart');
const showingEndEl = document.getElementById('showingEnd');
const totalEntriesEl = document.getElementById('totalEntries');

// Initialize Charts
function initCharts() {
    // Status Chart (Donut)
    const ctxStatus = document.getElementById('statusChart').getContext('2d');
    charts.status = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: ['#22c55e', '#eab308', '#3b82f6', '#9ca3af'], // Green, Yellow, Blue, Gray
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });

    // Priority Chart (Bar)
    const ctxPriority = document.getElementById('priorityChart').getContext('2d');
    charts.priority = new Chart(ctxPriority, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Iniciativas',
                data: [],
                backgroundColor: ['#8b5cf6', '#ef4444', '#f59e0b', '#3b82f6'], // Purple, Red, Yellow, Blue
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Manager Chart (Horizontal Bar)
    const ctxManager = document.getElementById('managerChart').getContext('2d');
    charts.manager = new Chart(ctxManager, {
        type: 'bar',
        indexAxis: 'y',
        data: {
            labels: [],
            datasets: [{
                label: 'Iniciativas',
                data: [],
                backgroundColor: '#3b82f6',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { beginAtZero: true }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// File Upload Handler
if (fileUpload) {
    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Assume first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert to JSON
            const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

            processData(json);
        };
        reader.readAsArrayBuffer(file);
    });
}

function processData(data) {
    allData = data;
    filteredData = data; // Initial filter is all data
    currentPage = 1;

    updateDashboard();
}

function updateDashboard() {
    updateKPIs();
    updateCharts();
    updateTable();
}

function updateKPIs() {
    const total = filteredData.length;
    let completed = 0;
    let inProgress = 0;

    filteredData.forEach(row => {
        // Normalize status
        const status = (row['STATUS'] || '').toString().trim().toUpperCase();
        if (status === 'FEITO' || status === 'CONCLUÍDO' || status === 'CONCLUIDO') {
            completed++;
        } else if (status === 'EM ANDAMENTO' || status.includes('ANDAMENTO')) {
            inProgress++;
        }
    });

    if (totalInitiativesEl) totalInitiativesEl.innerText = total;
    if (completedInitiativesEl) completedInitiativesEl.innerText = completed;
    if (inProgressInitiativesEl) inProgressInitiativesEl.innerText = inProgress;

    // Update progress bars
    const completedPercent = total > 0 ? (completed / total) * 100 : 0;
    const inProgressPercent = total > 0 ? (inProgress / total) * 100 : 0;

    if (completedProgressEl) completedProgressEl.style.width = `${completedPercent}%`;
    if (inProgressProgressEl) inProgressProgressEl.style.width = `${inProgressPercent}%`;
}

function updateCharts() {
    // Count Statuses
    const statusCounts = {};
    filteredData.forEach(row => {
        let status = (row['STATUS'] || 'Não Definido').toString().trim().toUpperCase();
        // Standardize common statuses
        if (status === 'FEITO') status = 'CONCLUÍDO';

        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    charts.status.data.labels = Object.keys(statusCounts);
    charts.status.data.datasets[0].data = Object.values(statusCounts);
    charts.status.update();

    // Count Priorities
    const priorityCounts = {};
    filteredData.forEach(row => {
        const priority = (row['Prioridade'] || 'Não Definido').toString().trim().toUpperCase();
        priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
    });

    // Sort priorities if possible (Alta, Media, Baixa)
    const priorityOrder = ['ALTA', 'MÉDIA', 'MEDIA', 'BAIXA', 'NÃO DEFINIDO'];
    const sortedPriorities = Object.keys(priorityCounts).sort((a, b) => {
        const idxA = priorityOrder.indexOf(a);
        const idxB = priorityOrder.indexOf(b);
        // If both are known, sort by index. If unknown, put at end.
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    charts.priority.data.labels = sortedPriorities;
    charts.priority.data.datasets[0].data = sortedPriorities.map(p => priorityCounts[p]);
    // Set colors based on priority
    charts.priority.data.datasets[0].backgroundColor = sortedPriorities.map(p => {
        if (p.includes('ALTA')) return '#ef4444'; // Red
        if (p.includes('MÉDIA') || p.includes('MEDIA')) return '#f59e0b'; // Yellow
        if (p.includes('BAIXA')) return '#22c55e'; // Green
        return '#3b82f6'; // Blue default
    });
    charts.priority.update();

    // Count Managers
    const managerCounts = {};
    filteredData.forEach(row => {
        const manager = (row['GERENTE DO PROGRAMA'] || 'Não Definido').toString().trim().toUpperCase();
        managerCounts[manager] = (managerCounts[manager] || 0) + 1;
    });

    // Sort by count desc
    const sortedManagers = Object.keys(managerCounts).sort((a, b) => managerCounts[b] - managerCounts[a]);

    charts.manager.data.labels = sortedManagers;
    charts.manager.data.datasets[0].data = sortedManagers.map(m => managerCounts[m]);
    charts.manager.update();
}

function updateTable() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageData = filteredData.slice(start, end);

    tableBody.innerHTML = '';

    if (pageData.length === 0) {
         tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">Nenhum dado encontrado.</td>
            </tr>
        `;
    } else {
        pageData.forEach(row => {
            const tr = document.createElement('tr');

            // Safe access
            const managerProg = row['GERENTE DO PROGRAMA'] || '';
            const managerProj = row['GERENTE DO PROJETO'] || '';
            const initiative = row['I.E(INICIATIVA ESTRATEGICA)'] || '';
            const status = row['STATUS'] || '';
            const priority = row['Prioridade'] || '';

            // Status Badge Color
            let statusColor = 'bg-gray-100 text-gray-800';
            const s = status.toString().trim().toUpperCase();
            if (s === 'FEITO' || s === 'CONCLUÍDO') statusColor = 'bg-green-100 text-green-800';
            else if (s.includes('ANDAMENTO')) statusColor = 'bg-yellow-100 text-yellow-800';
            else if (s.includes('FAZER')) statusColor = 'bg-blue-100 text-blue-800';

            // Create cells safely
            const tdManagerProg = document.createElement('td');
            tdManagerProg.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-900";
            tdManagerProg.textContent = managerProg;
            tr.appendChild(tdManagerProg);

            const tdManagerProj = document.createElement('td');
            tdManagerProj.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-500";
            tdManagerProj.textContent = managerProj;
            tr.appendChild(tdManagerProj);

            const tdInitiative = document.createElement('td');
            tdInitiative.className = "px-6 py-4 text-sm text-gray-500 truncate max-w-xs";
            tdInitiative.title = initiative;
            tdInitiative.textContent = initiative;
            tr.appendChild(tdInitiative);

            const tdStatus = document.createElement('td');
            tdStatus.className = "px-6 py-4 whitespace-nowrap";
            const spanStatus = document.createElement('span');
            spanStatus.className = `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`;
            spanStatus.textContent = status;
            tdStatus.appendChild(spanStatus);
            tr.appendChild(tdStatus);

            const tdPriority = document.createElement('td');
            tdPriority.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-500";
            tdPriority.textContent = priority;
            tr.appendChild(tdPriority);

            tableBody.appendChild(tr);
        });
    }

    // Update Pagination Info
    if (showingStartEl) showingStartEl.innerText = filteredData.length > 0 ? start + 1 : 0;
    if (showingEndEl) showingEndEl.innerText = Math.min(end, filteredData.length);
    if (totalEntriesEl) totalEntriesEl.innerText = filteredData.length;

    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = end >= filteredData.length;
}

// Pagination Event Listeners
if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateTable();
        }
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        if ((currentPage * ITEMS_PER_PAGE) < filteredData.length) {
            currentPage++;
            updateTable();
        }
    });
}

// Search functionality
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();

        if (term === '') {
            filteredData = allData;
        } else {
            filteredData = allData.filter(row => {
                return Object.values(row).some(val =>
                    String(val).toLowerCase().includes(term)
                );
            });
        }

        currentPage = 1;
        updateDashboard(); // Updates everything based on filter
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initCharts);
