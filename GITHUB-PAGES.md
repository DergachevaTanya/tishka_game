# Публикация на GitHub Pages

Папка проекта — `troll-trail`. Здесь уже создан локальный Git-репозиторий с веткой `main`, но удалённый репозиторий не настроен. Публикация ещё не выполнена.

1. Создайте пустой репозиторий на GitHub (без README).
2. В его **Settings → Pages → Build and deployment → Source** выберите **GitHub Actions**.
3. В терминале из папки проекта выполните команды ниже, подставив адрес своего репозитория:

```sh
cd /Users/oddetani/Documents/ggameaa/troll-trail
npm test
npm run build
git add .
git commit -m "Prepare Tishka's Trail for GitHub Pages"
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

После пуша workflow `Publish game to GitHub Pages` проверит игру и опубликует содержимое `_site`. Ссылка появится в результате Actions и Settings → Pages. Следующие пуши в `main` обновляют игру автоматически. Можно запустить workflow вручную через Actions.

Игра работает и по адресу `https://USERNAME.github.io/REPOSITORY/`: все ссылки на скрипты, стили и картинки относительные. Серверная часть, ключи и установка npm-зависимостей не требуются. Используется Node.js 22.

Для локального просмотра: `npm run build`, затем `npm run preview` и открыть `http://localhost:4173/`. Для отдельного автономного HTML: `npm run build:standalone`.

В публикацию входят только игра и семь используемых иллюстраций. Локальная конфигурация Sites, черновые изображения, превью и автономные HTML исключены из Git. Существующая конфигурация Sites оставлена на диске.

Музыка включена по умолчанию, воспроизведение начинается после первого нажатия из-за ограничений браузера. Пройденные тропы сохраняются в браузере отдельно для адреса сайта: прогресс с localhost автоматически на GitHub Pages не переносится.

Workflow основан на официальном шаблоне GitHub: https://github.com/actions/starter-workflows/blob/main/pages/static.yml
