# ♟ Chess App

Полноценное шахматное приложение с онлайн мультиплеером, игрой против бота, системой лиг и лидербордом.

---

## 🚀 Возможности

- **Авторизация** через Google (Firebase Auth)
- **Игра с ботом** на базе Stockfish (WebAssembly, работает прямо в браузере)
- **Онлайн игра** по invite-ссылке через WebSocket в реальном времени
- **Система лиг** — Бронза, Серебро, Золото, Алмаз (по количеству побед)
- **Лидерборд** — топ-100 игроков в каждой лиге
- **История игр** в профиле
- **Тёмная и светлая тема**
- **Адаптивный дизайн** для мобильных устройств

---

## 🛠 Стек

### Frontend
| Технология | Описание |
|---|---|
| React + TypeScript | UI фреймворк |
| Vite | Сборщик |
| Tailwind CSS | Стилизация |
| react-chessboard | Шахматная доска |
| chess.js | Валидация ходов |
| Stockfish (WASM) | Шахматный движок для бота |
| Zustand | Управление состоянием |
| Firebase SDK | Авторизация |
| Axios | HTTP клиент |

### Backend
| Технология | Описание |
|---|---|
| Go | Основной язык |
| Gin | HTTP фреймворк |
| Gorilla WebSocket | WebSocket для мультиплеера |
| Firebase Admin SDK | Верификация JWT токенов |
| PostgreSQL | Основная база данных |
| golang-migrate | Миграции БД |

---

## 📁 Структура проекта

```
chess-app/
├── chess-frontend/          # React приложение
│   ├── src/
│   │   ├── api/             # Axios instance
│   │   ├── components/      # Переиспользуемые компоненты
│   │   ├── hooks/           # Кастомные хуки (useWebSocket, useStockfish)
│   │   ├── pages/           # Страницы (Lobby, Game, Leaderboard, Profile)
│   │   ├── store/           # Zustand сторы
│   │   └── firebase.ts      # Конфигурация Firebase
│   └── .env                 # Переменные окружения
│
└── chess-backend/           # Go сервер
    ├── cmd/
    │   └── main.go          # Точка входа
    └── internal/
        ├── auth/            # Firebase подключение
        ├── config/          # Конфигурация
        ├── db/              # PostgreSQL + миграции
        ├── domain/
        │   ├── models/      # Структуры данных
        │   └── ports/       # Интерфейсы репозитория
        ├── services/        # Бизнес-логика
        └── transport/
            ├── http/        # REST хендлеры и middleware
            └── ws/          # WebSocket hub, room, client
```

---

## 🗄 Схема базы данных

```sql
-- Пользователи
CREATE TABLE users (
    id TEXT PRIMARY KEY,          -- Firebase UID
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Партии
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    white_id TEXT REFERENCES users(id),
    black_id TEXT REFERENCES users(id),
    winner_id TEXT REFERENCES users(id),
    pgn TEXT DEFAULT '',
    status TEXT DEFAULT 'waiting',  -- waiting | active | finished
    created_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);
```

---

## 🔌 API

### REST эндпоинты

| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/api/login` | Создать/получить пользователя |
| `POST` | `/api/games` | Создать новую партию |
| `POST` | `/api/games/:id/join` | Присоединиться к партии |
| `POST` | `/api/games/:id/finish` | Завершить партию |
| `GET` | `/api/games/:id` | Получить данные партии |
| `GET` | `/api/users/:id/games` | История игр пользователя |
| `GET` | `/api/leaderboard?league=bronze` | Лидерборд по лиге |

### WebSocket

```
WS /ws/games/:id?token=<firebase_token>
```

**Типы сообщений:**

```json
{ "type": "move", "from": "e2", "to": "e4" }
{ "type": "player_joined" }
{ "type": "resign" }
{ "type": "opponent_disconnected" }
```

---

## 🏆 Система лиг

| Лига | Иконка | Побед |
|---|---|---|
| Бронза | 🛡 | 0 — 99 |
| Серебро | 🛡✓ | 100 — 499 |
| Золото | ⭐ | 500 — 999 |
| Алмаз | 💠 | 1000+ |

---

## ⚙️ Локальный запуск

### Требования
- Go 1.21+
- Node.js 18+
- PostgreSQL 15+

### Backend

```bash
cd chess-backend

# Создай .env файл
cp .env.example .env
# Заполни переменные: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, PORT

# Запусти PostgreSQL (через Docker)
docker run -d \
  --name chess-postgres \
  -e POSTGRES_USER=chess \
  -e POSTGRES_PASSWORD=chess \
  -e POSTGRES_DB=chessdb \
  -p 5432:5432 \
  postgres:16

# Запусти сервер (миграции применятся автоматически)
go run cmd/main.go
```

### Frontend

```bash
cd chess-frontend

# Создай .env файл
cp .env.example .env
# Заполни переменные Firebase

# Установи зависимости
npm install

# Запусти dev сервер
npm run dev
```

### Переменные окружения

**chess-backend/.env**
```env
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=chess
DB_PASSWORD=chess
DB_NAME=chessdb
FIREBASE_CREDENTIALS_PATH=./serviceAccount.json
```

**chess-frontend/.env**
```env
VITE_API_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

---

## 🚢 Деплой

- **Frontend** → [Vercel](https://vercel.com)
- **Backend** → [Railway](https://railway.app)
- **Database** → Railway PostgreSQL

---

## 📱 Скриншоты

| Лобби | Игра | Лидерборд | Профиль |
|---|---|---|---|
| Главное меню с выбором режима | Шахматная доска с таймером хода | Топ игроков по лигам | Статистика и история |

---

## 👨‍💻 Автор

Разработано с использованием React, Go и Firebase.