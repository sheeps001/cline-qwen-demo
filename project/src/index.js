// Подключение необходимых зависимостей
const express = require('express'); // Фреймворк Express для создания веб-приложений
const Joi = require('joi'); // Библиотека для валидации данных
const { sendNotFound, sendValidationError } = require('./middleware/errorHandler'); // Импорт функций обработки ошибок
require('dotenv').config(); // Загрузка переменных окружения из файла .env

// Создание экземпляра приложения Express
const app = express();
// Определение порта для запуска сервера (из переменной окружения или по умолчанию 3000)
const port = process.env.PORT || 3000;

// Middleware для парсинга JSON тела запроса
app.use(express.json());

// Middleware для логирования запросов
app.use((req, res, next) => {
  // Получение текущего времени в ISO формате
  const timestamp = new Date().toISOString();
  // Логирование метода запроса и пути
  console.log(`${timestamp} - ${req.method} ${req.path}`);
  // Передача управления следующему middleware
 next();
});

// Временная "база данных" пользователей в памяти
let users = [
 { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 }
];

// Схема валидации для данных пользователя
const userSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(), // Имя: строка от 3 до 30 символов, обязательно
  email: Joi.string().email().required(), // Email: должен быть валидным email адресом, обязательно
  age: Joi.number().integer().min(0).max(120).required(), // Возраст: целое число от 0 до 120, обязательно
  password: Joi.string().min(6).pattern(/^(?=.*[A-Za-z])(?=.*\d)/).required().messages({
    'string.min': 'Password must be at least 6 characters long', // Пароль должен быть не менее 6 символов
    'string.pattern.base': 'Password must contain at least one letter and one digit' // Пароль должен содержать хотя бы одну букву и одну цифру
  })
});

// Определение маршрутов API

// GET /users - получить всех пользователей
app.get('/users', (req, res) => {
  // Отправка списка всех пользователей в формате JSON
  res.json(users);
});

// GET /users/:id - получить пользователя по ID
app.get('/users/:id', (req, res) => {
  // Преобразование параметра ID в число
  const id = parseInt(req.params.id);
  // Поиск пользователя в массиве по ID
  const user = users.find(u => u.id === id);
  
  // Если пользователь не найден, отправляем ошибку 404
  if (!user) {
    return sendNotFound(res, 'User not found');
  }
  
  // Отправка найденного пользователя в формате JSON
  res.json(user);
});

// POST /users - создать нового пользователя
app.post('/users', (req, res) => {
  // Валидация тела запроса с использованием схемы
  const { error, value } = userSchema.validate(req.body);
  
  // Если есть ошибки валидации, отправляем ошибку 400
  if (error) {
    return sendValidationError(res, error.details[0].message);
  }
  
  // Создание нового пользователя с уникальным ID
  const newUser = {
    // Генерация нового ID (максимальный ID в массиве + 1, или 1 если массив пуст)
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name: value.name, // Имя из валидированных данных
    email: value.email, // Email из валидированных данных
    age: value.age, // Возраст из валидированных данных
    password: value.password // Сохраняем пароль
  };
  
  // Добавление нового пользователя в массив
  users.push(newUser);
  // Отправка созданного пользователя с кодом статуса 201 (Created)
  res.status(201).json(newUser);
});

// PUT /users/:id - обновить пользователя по ID
app.put('/users/:id', (req, res) => {
  // Преобразование параметра ID в число
  const id = parseInt(req.params.id);
  // Поиск индекса пользователя в массиве по ID
  const userIndex = users.findIndex(u => u.id === id);
  
  // Если пользователь не найден, отправляем ошибку 404
  if (userIndex === -1) {
    return sendNotFound(res, 'User not found');
  }
  
  // Валидация тела запроса с использованием схемы
  const { error, value } = userSchema.validate(req.body);
  
  // Если есть ошибки валидации, отправляем ошибку 400
  if (error) {
    return sendValidationError(res, error.details[0].message);
  }
  
  // Обновление данных пользователя
  users[userIndex] = {
    id: id, // Сохраняем оригинальный ID
    name: value.name, // Новое имя из валидированных данных
    email: value.email, // Новый email из валидированных данных
    age: value.age, // Новый возраст из валидированных данных
    password: value.password // Новый пароль
  };
  
  // Отправка обновленного пользователя в формате JSON
  res.json(users[userIndex]);
});

// DELETE /users/:id - удалить пользователя по ID
app.delete('/users/:id', (req, res) => {
  // Преобразование параметра ID в число
  const id = parseInt(req.params.id);
  // Поиск индекса пользователя в массиве по ID
  const userIndex = users.findIndex(u => u.id === id);
  
  // Если пользователь не найден, отправляем ошибку 404
  if (userIndex === -1) {
    return sendNotFound(res, 'User not found');
  }
  
  // Удаление пользователя из массива по индексу
  users.splice(userIndex, 1);
  // Отправка ответа с кодом статуса 204 (No Content)
  res.status(204).send();
});

// Запуск сервера на указанном порту
app.listen(port, () => {
  // Вывод сообщения о запуске сервера в консоль
  console.log(`Server running on port ${port}`);
});

// Экспорт приложения для использования в других файлах (например, для тестирования)
module.exports = app;
