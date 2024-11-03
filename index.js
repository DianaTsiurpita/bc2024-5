const express = require('express');
const { Command } = require('commander');
const path = require('path');

const program = new Command();
program
  .requiredOption('-h, --host <host>', 'адреса сервера')
  .requiredOption('-p, --port <port>', 'порт сервера')
  .requiredOption('-c, --cache <cache>', 'шлях до директорії кешу');

program.parse(process.argv);

const options = program.opts();
const app = express();
const notes = {}; // Об'єкт для зберігання нотаток у пам'яті

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Перевірка на обов'язкові параметри
if (!options.host || !options.port || !options.cache) {
  console.error('Усі параметри -h, -p, -c є обов\'язковими!');
  process.exit(1);
}

// Запуск сервера
app.listen(options.port, options.host, () => {
  console.log(`Сервер запущено на ${options.host}:${options.port}`);
});

// Отримати нотатку за ім'ям
app.get('/notes/:name', (req, res) => {
    const note = notes[req.params.name];
    if (!note) {
      return res.status(404).send('Нотатка не знайдена');
    }
    res.send(note);
});

// Оновлення нотатки
app.put('/notes/:name', (req, res) => {
    const noteName = req.params.name;
    const noteText = req.body.text;

    // Перевірте, чи нотатка існує
    if (!notes[noteName]) {
        return res.status(404).send('Нотатка не знайдена');
    }

    // Оновіть текст нотатки
    notes[noteName] = noteText;
    res.send('Нотатка оновлена');
});

// Видалення нотатки
app.delete('/notes/:name', (req, res) => {
    if (!notes[req.params.name]) {
      return res.status(404).send('Нотатка не знайдена');
    }
    delete notes[req.params.name];
    res.send('Нотатка видалена');
});

// Отримання всіх нотаток
app.get('/notes', (req, res) => {
    res.status(200).json(Object.entries(notes).map(([name, text]) => ({ name, text })));
});

// Створення нової нотатки
app.post('/write', (req, res) => {
    const { note_name, note } = req.body;
    if (notes[note_name]) {
      return res.status(400).send('Нотатка з таким ім\'ям вже існує');
    }
    notes[note_name] = note;
    res.status(201).send('Нотатка створена');
});

// Відображення HTML-форми для завантаження нотатки
app.get('/UploadForm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'UploadForm.html'));
});
