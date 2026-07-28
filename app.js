
const tg = window.Telegram?.WebApp || null;

function initTelegram() {
  if (!tg) return;
  document.body.classList.add('telegram-mode');
  tg.ready();
  tg.expand();

  const user = tg.initDataUnsafe?.user;
  if (user) {
    const label = document.getElementById('telegramUser');
    label.hidden = false;
    label.textContent = `👤 ${user.first_name || ''}${user.username ? ' · @' + user.username : ''}`;
  }

  tg.onEvent?.('themeChanged', () => {
    document.documentElement.style.colorScheme = tg.colorScheme || 'dark';
  });
}

function haptic(type = 'light') {
  try { tg?.HapticFeedback?.impactOccurred(type); } catch {}
}

const DEFAULTS = {
  guestName: 'Мушиг',
  arrival: '2026-08-08T12:00',
  departure: '2026-08-20T18:00',
  tripStartReference: '2026-07-28T00:00',
};

const statDefinitions = [
  { id: 'beer', emoji: '🍺', name: 'Бутылок пива' },
  { id: 'vodka', emoji: '🥃', name: 'Рюмок водки' },
  { id: 'hookah', emoji: '💨', name: 'Кальянов' },
  { id: 'kebab', emoji: '🥩', name: 'Шашлыков' },
  { id: 'sea', emoji: '🌊', name: 'Поездок на море' },
  { id: 'coffee', emoji: '☕', name: 'Чашек кофе' },
  { id: 'shawarma', emoji: '🌯', name: 'Шаурмы' },
  { id: 'taxi', emoji: '🚕', name: 'Поездок на такси' },
  { id: 'lighter', emoji: '🔥', name: 'Потеряно зажигалок' },
  { id: 'lastOne', emoji: '🤝', name: '«Последний раз»' },
];

const achievements = [
  { emoji: '🍺', title: 'Первая пошла', desc: 'Выпить первое пиво', test: s => s.beer >= 1 },
  { emoji: '💨', title: 'Дым над Баку', desc: 'Первый кальян', test: s => s.hookah >= 1 },
  { emoji: '🌊', title: 'Каспийский режим', desc: '3 поездки на море', test: s => s.sea >= 3 },
  { emoji: '🥩', title: 'Шашлычный магнат', desc: '10 шашлыков', test: s => s.kebab >= 10 },
  { emoji: '🍺', title: 'Пивной марафон', desc: '30 бутылок пива', test: s => s.beer >= 30 },
  { emoji: '🤝', title: 'Точно последняя', desc: '10 обещаний закончить', test: s => s.lastOne >= 10 },
  { emoji: '🔥', title: 'Где зажигалка?', desc: 'Потерять 3 зажигалки', test: s => s.lighter >= 3 },
  { emoji: '🏆', title: 'Легенда Баку', desc: 'Набрать 100 очков', test: s => totalScore(s) >= 100 },
];

const checklistItems = [
  'Прогуляться по Старому городу',
  'Увидеть Flame Towers ночью',
  'Съездить на море',
  'Поесть хороший шашлык',
  'Покурить кальян',
  'Встретить рассвет',
  'Сделать легендарное общее фото',
  'Сказать: «Всё, завтра спокойно»',
];

const quotes = [
  'Сегодня спокойно. Максимум одна бутылка.',
  'Мы вышли всего на пять минут.',
  'Это точно последний кальян.',
  'Завтра встаём рано. Наверное.',
  'Кто опять потерял зажигалку?',
  'Мушиг прилетел — режим сна улетел.',
  'Баку всё простит, но статистика всё запомнит.',
];

let settings = load('mushig-settings', DEFAULTS);
let stats = load('mushig-stats', Object.fromEntries(statDefinitions.map(s => [s.id, 0])));
let checks = load('mushig-checks', checklistItems.map(() => false));

const $ = id => document.getElementById(id);

function load(key, fallback) {
  try { return { ...fallback, ...JSON.parse(localStorage.getItem(key) || '{}') }; }
  catch { return fallback; }
}

function save() {
  localStorage.setItem('mushig-settings', JSON.stringify(settings));
  localStorage.setItem('mushig-stats', JSON.stringify(stats));
  localStorage.setItem('mushig-checks', JSON.stringify(checks));
}

function totalScore(s) {
  return (s.beer || 0) + (s.vodka || 0) * 2 + (s.hookah || 0) * 3 + (s.kebab || 0) * 2 + (s.sea || 0) * 5 + (s.lastOne || 0);
}

function plural(value, one, few, many) {
  const n = Math.abs(value) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return many;
  if (n1 > 1 && n1 < 5) return few;
  if (n1 === 1) return one;
  return many;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Baku'
  }).format(new Date(value + ':00+04:00'));
}

function localDate(value) {
  return new Date(value + ':00+04:00');
}

function renderCountdown() {
  const now = new Date();
  const arrival = localDate(settings.arrival);
  const departure = localDate(settings.departure);
  let target, subtitle, title;

  if (now < arrival) {
    target = arrival;
    subtitle = 'До прилёта осталось';
    title = `${settings.guestName.toUpperCase()} IS COMING`;
  } else if (now < departure) {
    target = departure;
    subtitle = 'До конца отпуска осталось';
    const day = Math.max(1, Math.ceil((now - arrival) / 86400000));
    title = `${settings.guestName.toUpperCase()} IN BAKU · ДЕНЬ ${day}`;
  } else {
    target = departure;
    subtitle = 'Миссия завершена';
    title = 'MISSION COMPLETE';
  }

  $('heroTitle').textContent = title;
  $('heroSubtitle').textContent = subtitle;
  $('arrivalLabel').textContent = `✈️ Прилёт: ${formatDate(settings.arrival)} · Вылет: ${formatDate(settings.departure)}`;

  const distance = Math.max(0, target - now);
  const values = [
    [Math.floor(distance / 86400000), 'день', 'дня', 'дней'],
    [Math.floor(distance / 3600000) % 24, 'час', 'часа', 'часов'],
    [Math.floor(distance / 60000) % 60, 'минута', 'минуты', 'минут'],
    [Math.floor(distance / 1000) % 60, 'секунда', 'секунды', 'секунд'],
  ];
  $('countdown').innerHTML = values.map(([value, one, few, many]) => `
    <div class="time-box"><strong>${String(value).padStart(2, '0')}</strong><span>${plural(value, one, few, many)}</span></div>
  `).join('');

  const start = localDate(settings.tripStartReference || DEFAULTS.tripStartReference);
  const total = arrival - start;
  const elapsed = now - start;
  const progress = now >= arrival ? 100 : Math.max(0, Math.min(100, Math.round(elapsed / total * 100)));
  $('progressBar').style.width = `${progress}%`;
  $('progressPercent').textContent = `${progress}%`;
}

function renderStats() {
  $('statsGrid').innerHTML = statDefinitions.map(stat => `
    <article class="stat-card">
      <div class="stat-top">
        <div><div class="stat-emoji">${stat.emoji}</div><div class="stat-name">${stat.name}</div></div>
        <div class="stat-value" id="value-${stat.id}">${stats[stat.id] || 0}</div>
      </div>
      <div class="stat-actions">
        <button class="minus-btn" data-action="minus" data-id="${stat.id}">−</button>
        <button class="plus-btn" data-action="plus" data-id="${stat.id}">+1</button>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.id;
      const delta = button.dataset.action === 'plus' ? 1 : -1;
      stats[id] = Math.max(0, (stats[id] || 0) + delta);
      haptic(delta > 0 ? 'light' : 'soft');
      save();
      renderStats();
      renderAchievements();
      renderMeters();
    });
  });
}

function renderMeters() {
  const intensity = Math.min(100, Math.round(totalScore(stats) / 1.5));
  const sobriety = Math.max(0, 100 - Math.round((stats.beer + stats.vodka * 2 + stats.hookah * 2) * 1.7));
  $('partyBar').style.width = `${intensity}%`;
  $('partyText').textContent = `${intensity}%`;
  $('sobrietyBar').style.width = `${sobriety}%`;
  $('sobrietyText').textContent = `${sobriety}%`;
}

function renderAchievements() {
  $('achievements').innerHTML = achievements.map(a => {
    const unlocked = a.test(stats);
    return `<div class="achievement ${unlocked ? 'unlocked' : ''}">
      <div>${unlocked ? a.emoji : '🔒'}</div>
      <strong>${a.title}</strong>
      <span>${a.desc}</span>
    </div>`;
  }).join('');
}

function renderChecklist() {
  $('checklist').innerHTML = checklistItems.map((item, i) => `
    <label class="check-item ${checks[i] ? 'done' : ''}">
      <input type="checkbox" data-check="${i}" ${checks[i] ? 'checked' : ''} />
      <span>${item}</span>
    </label>
  `).join('');
  document.querySelectorAll('[data-check]').forEach(input => {
    input.addEventListener('change', () => {
      checks[Number(input.dataset.check)] = input.checked;
      save();
      renderChecklist();
    });
  });
}

function showToast(text) {
  const toast = $('toast');
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function randomQuote() {
  $('quoteText').textContent = `«${quotes[Math.floor(Math.random() * quotes.length)]}»`;
}

function summaryText() {
  const completed = checks.filter(Boolean).length;
  return `🇦🇿 ${settings.guestName} IN BAKU\n\n` +
    statDefinitions.map(s => `${s.emoji} ${s.name}: ${stats[s.id] || 0}`).join('\n') +
    `\n✅ Выполнено планов: ${completed}/${checklistItems.length}` +
    `\n🏆 Очки легендарности: ${totalScore(stats)}`;
}

$('settingsBtn').addEventListener('click', () => {
  $('guestNameInput').value = settings.guestName;
  $('arrivalInput').value = settings.arrival;
  $('departureInput').value = settings.departure;
  $('settingsDialog').showModal();
});

$('saveSettingsBtn').addEventListener('click', event => {
  event.preventDefault();
  settings.guestName = $('guestNameInput').value.trim() || DEFAULTS.guestName;
  settings.arrival = $('arrivalInput').value || DEFAULTS.arrival;
  settings.departure = $('departureInput').value || DEFAULTS.departure;
  save();
  $('settingsDialog').close();
  renderCountdown();
  showToast('Настройки сохранены');
});

$('newQuoteBtn').addEventListener('click', () => { haptic('soft'); randomQuote(); });
$('shareBtn').addEventListener('click', async () => {
  haptic('medium');
  const text = summaryText();
  try {
    if (navigator.share) await navigator.share({ title: 'Mushig in Baku', text });
    else { await navigator.clipboard.writeText(text); showToast('Итоги скопированы'); }
  } catch {}
});

$('resetBtn').addEventListener('click', () => {
  if (!confirm('Сбросить всю статистику и чек-лист?')) return;
  stats = Object.fromEntries(statDefinitions.map(s => [s.id, 0]));
  checks = checklistItems.map(() => false);
  save();
  renderStats(); renderMeters(); renderAchievements(); renderChecklist();
  showToast('Статистика сброшена');
});

initTelegram();
renderCountdown();
renderStats();
renderMeters();
renderAchievements();
renderChecklist();
randomQuote();
setInterval(renderCountdown, 1000);

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
