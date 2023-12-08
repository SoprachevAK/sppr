# Система поддержки принятия решений (СППР)

## Описание

Система поддержки принятия решений (СППР) - это компьютерная система, предназначенная для поддержки принятия решений в сложных, неструктурированных ситуациях, в которых принимающий решение сталкивается с множеством альтернатив и критериев, которые не могут быть формализованы в виде математической модели.

## Возможности

- Ввод произвольной таблицы исходных данных
- Импорт и экспорт таблицы исходных данных в формате CSV
- Настройка весов и сортировки критериев (больше = лучше или меньше = лучше)
- Механизмы расчета
  - Механизм доминирования
  - Механизм блокирования
  - Турнирный механизм
  - Механизм K-max
- Экспорт отчёта
  - В формате Markdown
  - В формате LaTeX

## Работа с кодом

### Локальный запуск

Подготовка:

```bash
git clone https://github.com/SoprachevAK/sppr.git

cd sppr

npm install
```

Запуск в режиме разработки:

```bash
npm run dev
```

Запуск в режиме продакшена:

```bash
npm run build
npm run preview
```


### Функции 

Точка входа в приложение `src/App.vue`

Реализация всех алгоритмов находится в директории `src/core`

Полный расчёт находится в файле `src/core/sppr.ts`