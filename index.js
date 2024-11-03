const express = require('express');
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();
program
  .requiredOption('-h, --host <type>', 'server host')
  .requiredOption('-p, --port <type>', 'server port')
  .requiredOption('-c, --cache <type>', 'cache directory path');

program.parse(process.argv);
const options = program.opts();

const app = express();
const notes = {};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/notes/:name', (req, res) => {
  const note = notes[req.params.name];
  if (note) {
    res.status(200).send(note);
  } else {
    res.status(404).send('Not found');
  }
});

app.put('/notes/:name', (req, res) => {
  const note = notes[req.params.name];
  if (note) {
    notes[req.params.name] = req.body.text;
    res.status(200).send('Note updated');
  } else {
    res.status(404).send('Not found');
  }
});

app.delete('/notes/:name', (req, res) => {
  const note = notes[req.params.name];
  if (note) {
    delete notes[req.params.name];
    res.status(200).send('Note deleted');
  } else {
    res.status(404).send('Not found');
  }
});

app.get('/notes', (req, res) => {
  res.status(200).json(Object.entries(notes).map(([name, text]) => ({ name, text })));
});

app.post('/write', (req, res) => {
  const { note_name, note } = req.body;
  if (notes[note_name]) {
    return res.status(400).send('Note already exists');
  }
  notes[note_name] = note;
  res.status(201).send('Note created');
});

app.get('/UploadForm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'UploadForm.html'));
});

app.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}`);
});
