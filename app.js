// 1. Логика переключения вкладок
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// --- ЧЕК-ЛИСТ (Шаг 4) ---
const CHECKLIST_RULES = {
  forest: [
    { id: 'water', text: 'Запас воды на 2 литра на человека' },
    { id: 'repellent', text: 'Репеллент от насекомых' },
    { id: 'map', text: 'Бумажная карта местности' },
    { id: 'firstaid', text: 'Аптечка' }
  ],
  city: [
    { id: 'water', text: 'Бутылка воды' },
    { id: 'charger', text: 'Павербанк для телефона' },
    { id: 'firstaid', text: 'Аптечка' }
  ],
  industrial: [
    { id: 'mask', text: 'Респиратор / маска' },
    { id: 'gloves', text: 'Защитные перчатки' },
    { id: 'firstaid', text: 'Аптечка' },
    { id: 'water', text: 'Запас воды' }
  ]
};

let currentChecklistState = {};

// Функция, которая рисует чек-лист на основе выбранных условий
function renderChecklist() {
  const cond = document.getElementById('plan-conditions').value;
  const items = CHECKLIST_RULES[cond] || [];
  const container = document.getElementById('checklist');
  container.innerHTML = '';
  
  items.forEach(item => {
    const isChecked = currentChecklistState[item.id] ? 'checked' : '';
    container.insertAdjacentHTML('beforeend', `
      <div style="margin-bottom: 8px;">
        <label>
          <input type="checkbox" data-id="${item.id}" ${isChecked}>
          ${item.text}
        </label>
      </div>
    `);
  });

  // Сохраняем галочки в память
  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', (e) => {
      currentChecklistState[e.target.dataset.id] = e.target.checked;
    });
  });
}

// Обновляем чек-лист при смене условий
document.getElementById('plan-conditions').addEventListener('change', renderChecklist);


// --- СОХРАНЕНИЕ ПЛАНА (Шаг 3) ---
const STORAGE_KEY = 'safetyPlans';
let currentPlanId = localStorage.getItem('lastOpenedPlanId') || null;

function loadPlans() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function savePlans(plans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

function generateId() {
  return crypto.randomUUID ? crypto.randomUUID()
    : 'plan-' + Date.now() + '-' + Math.random().toString(36).slice(2);
}

document.getElementById('save-plan').addEventListener('click', () => {
  const plan = {
    id: currentPlanId || generateId(),
    name: document.getElementById('plan-name').value,
    location: document.getElementById('plan-location').value,
    date: document.getElementById('plan-date').value,
    work: document.getElementById('plan-work').value,
    conditions: document.getElementById('plan-conditions').value,
    checklist: currentChecklistState, // <-- Добавили сохранение галочек
    updatedAt: new Date().toISOString()
  };

  const plans = loadPlans();
  const idx = plans.findIndex(p => p.id === plan.id);
  if (idx >= 0) {
    plans[idx] = plan;
  } else {
    plans.push(plan);
  }
  savePlans(plans);

  currentPlanId = plan.id;
  localStorage.setItem('lastOpenedPlanId', plan.id);
  
  alert('План успешно сохранён!');
});

function openPlan(id) {
  const plan = loadPlans().find(p => p.id === id);
  if (!plan) return;
  
  currentPlanId = plan.id;
  document.getElementById('plan-name').value = plan.name || '';
  document.getElementById('plan-location').value = plan.location || '';
  document.getElementById('plan-date').value = plan.date || '';
  document.getElementById('plan-work').value = plan.work || 'research';
  document.getElementById('plan-conditions').value = plan.conditions || 'forest';
  
  // Восстанавливаем галочки
  currentChecklistState = plan.checklist || {};
  renderChecklist(); 
}

// При загрузке страницы
if (currentPlanId) {
  openPlan(currentPlanId);
} else {
  renderChecklist(); // Если плана нет, просто рисуем пустой чек-лист для "Леса"
}
