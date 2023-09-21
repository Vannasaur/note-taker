const uuid = require('uuid');
const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})

// API Routes
// GET /api/notes should read the db.json file and return all saved notes as JSON
app.get('/api/notes', async (req, res) => {
    try {
        const savedNote = await fs.readfile('./db/db.json', 'utf8');
        const savedNoteParse = JSON.parse(savedNote);
        return res.json(savedNoteParse);
    } catch (err) {
        return res.status(500).json(err);
    }
})
// POST /api/notes should receive a new note to save on the request bocy, add it to the db.json file and then return the new note to the client
// give each note a unique id when it's saved from uuid npm package
app.post('/api/notes', async (req, res) => {
    try {
        // Log that a POST request was recieved
        console.info(`${req.method} request received to add a note`);

        // Destructuring assignment for the items in req.body
        const { title, text } = req.body;

        if (title && text) {
            const newNote = {
                title,
                text,
                id: uuid(),
            };
            // obtain existing notes
            const data = await fs.readFile('./db/db.json', 'utf8');

            const dataArray = JSON.parse(data);
            // push new note
            dataArray.push(newNote);
            // stringify notes array
            const noteString = JSON.stringify(dataArray, null, 2);
            // once stringified, write note string to db.json
            await fs.writeFile(`./db/db.json`, noteString);

            console.info(
                `Note for ${newNote.title} has been written to JSON file`
            )

            const response = {
                status: 'success',
                body: newNote,
            };

            return res.status(201).json(response);
        } else {
            return res.status(500).json('Error in posting review');
        }
    } catch (err) {
        return res.status(500).json(err);
    };
});


// HTML Routes
// GET /notes should return the notes.html file
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'))
})
// GET * should return the index.html file
app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public/index.html'))
})

// Listener
app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
);

// BONUS!!!!!
// DELETE ROUTE
// DELETE /api/notes/:id should receive a query parameter containing the id of a note to delete. 
// In order to delete a note, you'll need to read all notes from the db.json file, remove the note with the given id property, and then rewrite the notes to the db.json file