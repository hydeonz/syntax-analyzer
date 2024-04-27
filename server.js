const express = require('express');
const bodyParser = require('body-parser');
const { Parser } = require('expr-eval');
const path = require('path');

const app = express();

// Парсим данные в формате JSON
app.use(bodyParser.json());

// Указываем путь к статическим файлам
app.use(express.static(__dirname + '/public'));

// Указываем обработчик для GET запроса на корневой URL

// Обработчик POST запроса для анализа синтаксиса
app.post('/analyzeSyntax', (req, res) => {
    try {
        const expression = req.body.expression; // Получаем выражение из тела запроса
        let map = new Map(JSON.parse(expression));
        console.log('Полученное выражение:', map.get('пер'));
        let str = map.get('пер');
        str = str.replace(/&&/g, 'and');
        str = str.replace(/\|\|/g, 'or');
        // Обрабатываем выражение
        const parser = new Parser();
        const result = parser.evaluate(str);
        console.log(result);

        // Отправляем результат обратно на клиент
        res.json({ result });
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).json({ error: 'Произошла ошибка при обработке запроса' });
    }
});

// Указываем обработчик для GET запроса на корневой URL
app.get('/', (req, res) => {
    // Отправляем файл index.html
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Запускаем сервер на порту 3000
app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});
