// Подключение библиотеки supertest для тестирования HTTP запросов
const request = require('supertest');
// Импорт приложения Express из основного файла
const app = require('../src/index');

// Основной блок описания тестов для API пользователей
describe('Users API', () => {
  // Тест для GET /users - получение всех пользователей
  describe('GET /users', () => {
    it('should return all users', async () => {
      // Выполнение GET запроса к эндпоинту /users с ожидаемым статусом 200
      const response = await request(app)
        .get('/users')
        .expect(200);

      // Проверка, что тело ответа является массивом
      expect(Array.isArray(response.body)).toBe(true);
      // Проверка, что массив не пустой
      expect(response.body.length).toBeGreaterThan(0);
      
      // Проверяем структуру первого пользователя
      const firstUser = response.body[0];
      // Проверка наличия свойства id у первого пользователя
      expect(firstUser).toHaveProperty('id');
      // Проверка наличия свойства name у первого пользователя
      expect(firstUser).toHaveProperty('name');
      // Проверка наличия свойства email у первого пользователя
      expect(firstUser).toHaveProperty('email');
      // Проверка наличия свойства age у первого пользователя
      expect(firstUser).toHaveProperty('age');
    });
  });

  // Тест для GET /users/:id - получение пользователя по ID
  describe('GET /users/:id', () => {
    it('should return a user by ID', async () => {
      // Выполнение GET запроса к эндпоинту /users/1 с ожидаемым статусом 200
      const response = await request(app)
        .get('/users/1')
        .expect(200);

      // Проверка, что возвращаемый пользователь имеет id равный 1
      expect(response.body).toHaveProperty('id', 1);
      // Проверка наличия свойства name у возвращаемого пользователя
      expect(response.body).toHaveProperty('name');
      // Проверка наличия свойства email у возвращаемого пользователя
      expect(response.body).toHaveProperty('email');
      // Проверка наличия свойства age у возвращаемого пользователя
      expect(response.body).toHaveProperty('age');
    });

    it('should return 404 for non-existent user', async () => {
      // Выполнение GET запроса к несуществующему пользователю с ожидаемым статусом 404
      const response = await request(app)
        .get('/users/999')
        .expect(404);

      // Проверка наличия свойства error в теле ответа
      expect(response.body).toHaveProperty('error');
    });
  });

  // Тест для POST /users - создание нового пользователя
  describe('POST /users', () => {
    it('should create a new user', async () => {
      // Определение данных нового пользователя
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
        password: 'password123'
      };

      // Выполнение POST запроса для создания нового пользователя с ожидаемым статусом 201
      const response = await request(app)
        .post('/users')
        .send(newUser)
        .expect(201);

      // Проверка наличия свойства id у созданного пользователя
      expect(response.body).toHaveProperty('id');
      // Проверка соответствия имени созданного пользователя ожидаемому значению
      expect(response.body).toHaveProperty('name', newUser.name);
      // Проверка соответствия email созданного пользователя ожидаемому значению
      expect(response.body).toHaveProperty('email', newUser.email);
      // Проверка соответствия возраста созданного пользователя ожидаемому значению
      expect(response.body).toHaveProperty('age', newUser.age);
    });

    it('should return 400 for invalid user data - missing name', async () => {
      // Определение данных недействительного пользователя (без имени)
      const invalidUser = {
        email: 'test@example.com',
        age: 25,
        password: 'password123'
      };

      // Выполнение POST запроса с недействительными данными с ожидаемым статусом 400
      const response = await request(app)
        .post('/users')
        .send(invalidUser)
        .expect(400);

      // Проверка наличия свойства error в теле ответа
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid user data - invalid email', async () => {
      // Определение данных недействительного пользователя (с недействительным email)
      const invalidUser = {
        name: 'Test User',
        email: 'invalid-email',
        age: 25,
        password: 'password123'
      };

      // Выполнение POST запроса с недействительными данными с ожидаемым статусом 400
      const response = await request(app)
        .post('/users')
        .send(invalidUser)
        .expect(400);

      // Проверка наличия свойства error в теле ответа
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid user data - negative age', async () => {
      // Определение данных недействительного пользователя (с отрицательным возрастом)
      const invalidUser = {
        name: 'Test User',
        email: 'test@example.com',
        age: -5,
        password: 'password123'
      };

      // Выполнение POST запроса с недействительными данными с ожидаемым статусом 400
      const response = await request(app)
        .post('/users')
        .send(invalidUser)
        .expect(400);

      // Проверка наличия свойства error в теле ответа
      expect(response.body).toHaveProperty('error');
    });
  });
  
  // Тесты для проверки валидации пароля
  describe('Password validation', () => {
    it('should return 400 for password with less than 6 characters', async () => {
      // Определение данных с недействительным паролем (менее 6 символов)
      const invalidUser = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
        password: 'pass1' // Меньше 6 символов
      };

      // Выполнение POST запроса с недействительным паролем с ожидаемым статусом 400
      const response = await request(app)
        .post('/users')
        .send(invalidUser)
        .expect(400);

      // Проверка наличия свойства error в теле ответа
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for password without digits', async () => {
      // Определение данных с недействительным паролем (без цифр)
      const invalidUser = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
        password: 'password' // Без цифр
      };

      // Выполнение POST запроса с недействительным паролем с ожидаемым статусом 400
      const response = await request(app)
        .post('/users')
        .send(invalidUser)
        .expect(400);

      // Проверка наличия свойства error в теле ответа
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for password without letters', async () => {
      // Определение данных с недействительным паролем (без букв)
      const invalidUser = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
        password: '123456' // Без букв
      };

      // Выполнение POST запроса с недействительным паролем с ожидаемым статусом 400
      const response = await request(app)
        .post('/users')
        .send(invalidUser)
        .expect(400);

      // Проверка наличия свойства error в теле ответа
      expect(response.body).toHaveProperty('error');
    });
  });
});
