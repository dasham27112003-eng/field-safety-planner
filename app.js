// 1. Логика переключения вкладок
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// 2. Логика сохранения и загрузки плана
const STORAGE_KEY = 'safetyPlans';
// Проверяем, открывали ли мы уже какой-то план в прошлый раз
let currentPlanId = localStorage.getItem('lastOpenedPlanId') || null;

// Функция для получения всех сохраненных планов
function loadPlans() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

// Функция для сохранения массива планов в память
function savePlans(plans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

// Генератор уникального ID для нового плана
function generateId() {
  return crypto.randomUUID ? crypto.randomUUID()
    : 'plan-' + Date.now() + '-' + Math.random().toString(36).slice(2);
}

// Обработчик нажатия на кнопку "Сохранить план"
document.getElementById('save-plan').addEventListener('click', () => {
  // Собираем данные из формы
  const plan = {
    id: currentPlanId || generateId(), // если ID нет, создаем новый
    name: document.getElementById('plan-name').value,
    location: document.getElementById('plan-location').value,
    date: document.getElementById('plan-date').value,
    work: document.getElementById('plan-work').value,
    conditions: document.getElementById('plan-conditions').value,
    updatedAt: new Date().toISOString()
  };

  // Сохраняем в память
  const plans = loadPlans();
  const idx = plans.findIndex(p => p.id === plan.id);
  if (idx >= 0) {
    plans[idx] = plan; // обновляем, если план уже был
  } else {
    plans.push(plan); // добавляем, если он новый
  }
  savePlans(plans);

  // Запоминаем ID последнего открытого плана
  currentPlanId = plan.id;
  localStorage.setItem('lastOpenedPlanId', plan.id);
  
  alert('План успешно сохранён!');
});

// Функция для заполнения формы сохраненными данными
function openPlan(id) {
  const plan = loadPlans().find(p => p.id === id);
  if (!plan) return;
  
  currentPlanId = plan.id;
  document.getElementById('plan-name').value = plan.name || '';
  document.getElementById('plan-location').value = plan.location || '';
  document.getElementById('plan-date').value = plan.date || '';
  document.getElementById('plan-work').value = plan.work || 'research';
  document.getElementById('plan-conditions').value = plan.conditions || 'forest';
}

// При загрузке страницы проверяем, есть ли сохраненный план, и восстанавливаем его
if (currentPlanId) {
  openPlan(currentPlanId);
}
