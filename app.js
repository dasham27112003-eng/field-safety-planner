document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    // Убираем класс active со всех кнопок и блоков
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    
    // Добавляем класс active нажатой кнопке и нужному блоку
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});
