MUSHIG IN BAKU — TELEGRAM MINI APP

В архиве готовый frontend Mini App.

КАК ЗАПУСТИТЬ
1. Опубликуйте содержимое папки на HTTPS-хостинге:
   - GitHub Pages
   - Netlify
   - Vercel
   - Cloudflare Pages
2. Получите публичный адрес вида https://example.com
3. В Telegram откройте @BotFather
4. Создайте бота командой /newbot
5. Затем откройте:
   /mybots → ваш бот → Bot Settings → Menu Button → Configure menu button
6. Укажите текст кнопки, например: «Открыть Mushig Tracker»
7. Вставьте HTTPS-адрес Mini App.

ЧТО УЖЕ РАБОТАЕТ
- Открытие внутри Telegram
- Telegram-тема
- Имя пользователя Telegram
- Haptic feedback на кнопках
- Таймер и статистика
- Сохранение статистики на конкретном телефоне

ВАЖНО
Сейчас данные хранятся локально в Telegram WebView каждого телефона.
Чтобы у всех друзей была одна общая статистика, нужен backend/база данных
(Supabase, Firebase или собственный сервер) и проверка Telegram initData.

Дата прилёта по умолчанию: 8 августа 2026, 12:00, Asia/Baku.
