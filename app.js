const API = 'http://localhost:3000/api/plants';

// ─── DOM refs ───────────────────────────────────────────────
const form        = document.getElementById('plant-form');
const plantId     = document.getElementById('plant-id');
const fName       = document.getElementById('f-name');
const fSpecies    = document.getElementById('f-species');
const fLocation   = document.getElementById('f-location');
const fStatus     = document.getElementById('f-status');
const fNotes      = document.getElementById('f-notes');
const fAcquired   = document.getElementById('f-acquired');
const panelTitle  = document.getElementById('panel-title');
const btnCancel   = document.getElementById('btn-cancel');
const grid        = document.getElementById('plants-grid');
const toast       = document.getElementById('toast');

// stats
const stTotal    = document.getElementById('st-total');
const stWater    = document.getElementById('st-water');
const stHealthy  = document.getElementById('st-healthy');
const stLocations = document.getElementById('st-locations');

// ─── State ──────────────────────────────────────────────────
let activeFilter = 'all';

// ─── Toast ──────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ─── Form helpers ────────────────────────────────────────────
function clearForm() {
  form.reset();
  plantId.value = '';
  panelTitle.textContent = 'Nova planta';
  btnCancel.classList.add('hidden');
  fAcquired.value = new Date().toISOString().slice(0, 10);
}

function fillForm(plant) {
  plantId.value     = plant._id;
  fName.value       = plant.name;
  fSpecies.value    = plant.species || '';
  fLocation.value   = plant.location;
  fStatus.value     = plant.status;
  fNotes.value      = plant.notes || '';
  fAcquired.value   = plant.acquiredAt
    ? new Date(plant.acquiredAt).toISOString().slice(0, 10)
    : '';
  panelTitle.textContent = 'Editar planta';
  btnCancel.classList.remove('hidden');
}

// ─── Formatação ──────────────────────────────────────────────
const STATUS_LABEL = {
  saudavel:             'Saudável',
  'precisando-de-cuidado': 'Precisando de cuidado',
  dormindo:             'Dormindo',
  falecida:             'Falecida'
};

const STATUS_CLASS = {
  saudavel:             'tag-status-saudavel',
  'precisando-de-cuidado': 'tag-status-precisando',
  dormindo:             'tag-status-dormindo',
  falecida:             'tag-status-falecida'
};

const LOCATION_LABEL = {
  interno:  'Interno',
  externo:  'Externo',
  varanda:  'Varanda',
  horta:    'Horta'
};

function wateringText(plant) {
  if (!plant.nextWatering) return '';
  const next = new Date(plant.nextWatering);
  const now  = new Date();
  const diff = Math.ceil((next - now) / 86400000);
  if (diff < 0)  return `<span class="plant-watering overdue">Rega atrasada há ${Math.abs(diff)} dia(s)</span>`;
  if (diff === 0) return `<span class="plant-watering overdue">Regar hoje</span>`;
  return `<span class="plant-watering">Próxima rega em ${diff} dia(s)</span>`;
}

function lastWateredText(plant) {
  if (!plant.lastWatered) return 'Nunca regada';
  return 'Última rega: ' + new Date(plant.lastWatered).toLocaleDateString('pt-BR');
}

// ─── API calls ───────────────────────────────────────────────
async function api(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  return res.json();
}

async function loadStats() {
  try {
    const data = await api(`${API}/stats/summary`);
    stTotal.textContent    = data.total ?? 0;
    stWater.textContent    = data.needsWater ?? 0;

    const healthy = data.byStatus?.find(s => s._id === 'saudavel')?.count ?? 0;
    stHealthy.textContent  = healthy;

    const locs = data.byLocation?.length ?? 0;
    stLocations.textContent = locs;
  } catch {
    // silencioso se API offline
  }
}

async function loadPlants() {
  try {
    const params = activeFilter !== 'all' ? `?status=${activeFilter}` : '';
    const plants = await api(`${API}${params}`);
    renderPlants(plants);
  } catch {
    grid.innerHTML = '<p style="color:var(--muted);font-size:13px">Não foi possível conectar à API.</p>';
  }
}

async function savePlant(data) {
  const id     = plantId.value;
  const url    = id ? `${API}/${id}` : API;
  const method = id ? 'PUT' : 'POST';
  return api(url, { method, body: JSON.stringify(data) });
}

window.deletePlant = async function (id) {
  if (!confirm('Remover esta planta do canteiro?')) return;
  await api(`${API}/${id}`, { method: 'DELETE' });
  showToast('Planta removida.');
  if (plantId.value === id) clearForm();
  loadPlants();
  loadStats();
};

window.editPlant = async function (id) {
  const plant = await api(`${API}/${id}`);
  fillForm(plant);
  // marcar card
  document.querySelectorAll('.plant-card').forEach(c => c.classList.remove('editing'));
  const card = document.querySelector(`[data-id="${id}"]`);
  if (card) {
    card.classList.add('editing');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  showToast('Editando ' + plant.name);
};

window.waterPlant = async function (id, name) {
  const days = parseInt(prompt(`Intervalo de rega para "${name}" (em dias):`, '3'), 10);
  if (!days || isNaN(days)) return;
  await api(`${API}/${id}/water`, { method: 'PATCH', body: JSON.stringify({ intervalDays: days }) });
  showToast(`${name} regada. Próxima em ${days} dia(s).`);
  loadPlants();
  loadStats();
};

// ─── Render ──────────────────────────────────────────────────
function renderPlants(plants) {
  if (!plants.length) {
    grid.innerHTML = `
      <div class="empty">
        <p>Nenhuma planta por aqui ainda.</p>
      </div>`;
    return;
  }

  grid.innerHTML = plants.map(p => `
    <div class="plant-card" data-id="${p._id}">
      <div>
        <div class="plant-name">${p.name}</div>
        ${p.species ? `<div class="plant-species">${p.species}</div>` : ''}
        <div class="plant-meta">
          <span class="tag ${STATUS_CLASS[p.status]}">${STATUS_LABEL[p.status]}</span>
          <span class="tag tag-location">${LOCATION_LABEL[p.location]}</span>
        </div>
        ${p.notes ? `<div class="plant-notes">${p.notes}</div>` : ''}
        <div style="display:flex;gap:16px;margin-top:6px;font-size:11px;color:var(--muted)">
          <span>${lastWateredText(p)}</span>
        </div>
        ${wateringText(p)}
      </div>
      <div class="card-actions">
        <button class="btn btn-water" onclick="waterPlant('${p._id}','${p.name.replace(/'/g,"\\'")}')">
          Regar
        </button>
        <button class="btn btn-ghost" style="font-size:11px;padding:5px 10px"
          onclick="editPlant('${p._id}')">Editar</button>
        <button class="btn btn-danger" onclick="deletePlant('${p._id}')">Excluir</button>
      </div>
    </div>
  `).join('');
}

// ─── Filtros ─────────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadPlants();
  });
});

// ─── Form submit ─────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    name:       fName.value.trim(),
    species:    fSpecies.value.trim(),
    location:   fLocation.value,
    status:     fStatus.value,
    notes:      fNotes.value.trim(),
    acquiredAt: fAcquired.value || undefined
  };
  const isEdit = !!plantId.value;
  await savePlant(data);
  showToast(isEdit ? `${data.name} atualizada.` : `${data.name} adicionada ao canteiro.`);
  clearForm();
  document.querySelectorAll('.plant-card').forEach(c => c.classList.remove('editing'));
  loadPlants();
  loadStats();
});

btnCancel.addEventListener('click', () => {
  clearForm();
  document.querySelectorAll('.plant-card').forEach(c => c.classList.remove('editing'));
  showToast('Edição cancelada.');
});

// ─── Service Worker ───────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./service-worker.js');
    } catch (err) {
      console.warn('SW não registrado:', err);
    }
  });
}

// ─── Init ────────────────────────────────────────────────────
clearForm();
loadStats();
loadPlants();
