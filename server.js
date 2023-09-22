const { uuid } = require('uuidv4');
const express = require('express');
const path = require('path');
const fs = require('fs');

//define port
const PORT = process.env.PORT || 3001;

// middleware
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static files from the public folder
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})

// API Routes
// GET /api/notes should read the db.json file and return all saved notes as JSON
app.get('/api/notes', async (req, res) => {
    try {
        console.info(`${req.method} request received to get notes`);

        const savedNote = await fs.readFileSync('./db/db.json', 'utf8');
        const savedNoteParse = JSON.parse(savedNote);
        console.log(savedNote, savedNoteParse);
        return res.json(savedNoteParse);
    } catch (err) {
        return res.status(500).json(err);
    }
})

// POST /api/notes should receive a new note to save on the request body, add it to the db.json file and then return the new note to the client
// give each note a unique id when it's saved from uuid npm package
app.post('/api/notes', async (req, res) => {
    try {
        // Log that a POST request was recieved
        console.info(`${req.method} request received to add a note`);

        // Destructuring assignment for the items in req.body
        const { title, text } = req.body;
        // Check to see if required note properties are pressent
        if (title && text) {
            const newNote = {
                title,
                text,
                id: uuid(),
            };
            // obtain existing notes
            const data = await fs.readFileSync('./db/db.json', 'utf8');
            const dataArray = JSON.parse(data);
            // push new note
            dataArray.push(newNote);
            // stringify notes array
            const noteString = JSON.stringify(dataArray, null, 2);
            // once stringified, write note string to db.json
            await fs.writeFileSync('./db/db.json', noteString);

            console.info(`Note for ${newNote.title} has been written to JSON file`)

            const response = {
                status: 'success',
                body: newNote,
            };

            return res.status(201).json(response);
        } else {
            return res.status(500).json('Error in posting note');
        }
    } catch (err) {
        return res.status(500).json(err);
    };
});

// DELETE ROUTE
// DELETE /api/notes/:id should receive a query parameter containing the id of a note to delete. 
app.delete('/api/notes/:id', async (req, res) => {
    try {
        console.info(`${req.method} request received to delete note`);
        
        // In order to delete a note, you'll need to read all notes from the db.json file
        const savedNotes = await fs.readFileSync('./db/db.json', 'utf8');
        const savedNotesParse = JSON.parse(savedNotes);
        // get the id of the note to delete from the request parameters
        // req.params.id (to get the id dynamically)
        const deletedID = req.params.id;
        // use filter
        const updatedNotes = savedNotesParse.filter(note => note.id !== deletedID);
        // remove the note with the given id property
        // then rewrite the notes to the db.json file
        const updatedNoteString = JSON.stringify(updatedNotes, null, 2);
        await fs.writeFileSync('./db/db.json', updatedNoteString);

        console.info(`Note with id ${deletedID} has been deleted`);

        return res.json(updatedNotes);
    } catch (err) {
        return res.status(500).json(err);
    }
})

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
