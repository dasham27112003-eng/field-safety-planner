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

function renderChecklist() {
  const condSelect = document.getElementById('plan-conditions');
  if (!condSelect) return; // Проверка на всякий случай
  
  const cond = condSelect.value;
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
    checklist: currentChecklistState,
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
  
  // ИСПРАВЛЕНИЕ: Если плана нет, сбрасываем ID и все равно рисуем чек-лист
  if (!plan) {
    localStorage.removeItem('lastOpenedPlanId');
    currentPlanId = null;
    renderChecklist(); 
    return;
  }
  
  currentPlanId = plan.id;
  document.getElementById('plan-name').value = plan.name || '';
  document.getElementById('plan-location').value = plan.location || '';
  document.getElementById('plan-date').value = plan.date || '';
  document.getElementById('plan-work').value = plan.work || 'research';
  document.getElementById('plan-conditions').value = plan.conditions || 'forest';
  
  currentChecklistState = plan.checklist || {};
  renderChecklist(); 
}

// При загрузке страницы
if (currentPlanId) {
  openPlan(currentPlanId);
} else {
  renderChecklist(); // Если плана нет, рисуем чек-лист по умолчанию
}
// --- МОНИТОРИНГ ПОГОДЫ (Шаг 5) ---
async function updateWeather(cityName) {
  const weatherDiv = document.getElementById('weather-info');
  if (!cityName) {
    weatherDiv.innerHTML = '<p>Укажите локацию в плане, чтобы увидеть погоду.</p>';
    return;
  }

  weatherDiv.innerHTML = '<p>Загрузка погоды...</p>';

  try {
    // 1. Ищем координаты города
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=ru`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      weatherDiv.innerHTML = `<p>Город "${cityName}" не найден. Проверьте написание.</p>`;
      return;
    }

    const lat = geoData.results[0].latitude;
    const lon = geoData.results[0].longitude;

    // 2. Узнаем погоду по координатам
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code`);
    const weatherData = await weatherRes.json();
    
    const current = weatherData.current;
    const timeNow = new Date().toLocaleTimeString('ru-RU');

    // 3. Выводим на экран
    weatherDiv.innerHTML = `
      <h3>Погода в локации: ${geoData.results[0].name}</h3>
      <ul>
        <li><b>Температура:</b> ${current.temperature_2m} °C</li>
        <li><b>Скорость ветра:</b> ${current.wind_speed_10m} км/ч</li>
      </ul>
      <p><small><i>Данные актуальны на момент запроса: ${timeNow}</i></small></p>
      <p style="color: #666; font-size: 0.9em;">⚠️ Если в воздухе чувствуется дым или гарь — откройте вкладку «Источники» и воспользуйтесь памяткой.</p>
    `;

  } catch (error) {
    weatherDiv.innerHTML = '<p style="color: red;">Ошибка при загрузке погоды. Проверьте интернет.</p>';
    console.error(error);
  }
}
