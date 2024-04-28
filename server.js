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
app.post('/analyzeSyntax', (req , res) => {
    try {
        const expression = req.body.expression;
        let map = new Map(JSON.parse(expression));
        const keys = Array.from(map.keys());
        keys.forEach(function (key) {
            let value = map.get(key);
            const parser = new Parser();

            value = value.replace(/&&/g, 'and');
            value = value.replace(/\|\|/g, 'or');

            if (keys.some(k => value.includes(k))) {
                keys.forEach(function (k) {
                    value = value.replace(new RegExp(k, 'g'), map.get(k));
                });
                map.set(key, parser.evaluate(value));
            } else {
                map.set(key, parser.evaluate(value));
            }
        });
        console.log(map);
        //res.json({ result });
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).json({ error: 'Произошла ошибка при обработке запроса' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});
