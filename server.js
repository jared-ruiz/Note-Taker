const { json } = require('express');
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static(__dirname + '/Develop/public'));
const PORT = process.env.PORT || 3001;
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

//require the json information 
// const { notes } = require('./data/db');

//link for testing purposes: https://young-anchorage-10762.herokuapp.com/

function findById(id, notesArray) {
    const result = notesArray.filter(notes => notes.id === id)[0];
    return result;
}

function createNewNote(body, notesArray) {
    const note = body;
    notesArray.notes.push(note);
    fs.writeFileSync(
        path.join(__dirname, './data/db.json'),
        JSON.stringify({ notes: notesArray.notes }, null, 2)
    );
    return note;
}

function validateNote(note) {
    if (!note.title || typeof note.title !== 'string') {
        return false;
    }
    if (!note.text || typeof note.text !== 'string') {
        return false;
    }
    return true;
}

function readJsonFile() {
    const readNotes = fs.readFileSync('./data/db.json');
    if (readNotes.length === 0) {
        return {notes: []};
    }
    const parsedNotes = JSON.parse(readNotes);

    // console.log("test");
    // console.log(parsedNotes);

    return parsedNotes;
}

//full notes json
app.get('/api/notes', (req, res) => {
    let note = readJsonFile();
    res.json(note.notes);
})

//specific id look up
app.get('/api/notes/:id', (req, res) => {
    const result = findById(req.params.id, notes);
    if (result) {
        res.json(result);
    }
    else {
        res.send(404);
    }
})

//html home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './Develop/public/index.html'));
})

//notes html page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './Develop/public/notes.html'));
})

//wildcard request
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './Develop/public/notes.html'));
})

//post new notes
app.post('/api/notes', (req, res) => {
    //adds random id to every note created
    req.body.id = uuidv4();

    let notes = readJsonFile();

    console.log(typeof(notes));

    //if data in req.body is incorrect, send a 400 error
    if (!validateNote(req.body)) {
        res.status(400).send('The note is not properly formatted.');
    }
    else {
        const note = createNewNote(req.body, notes);
        res.json(note);
    }    
})

app.delete('/api/notes/:id', (req, res) => {
    //get id from selected item 
    let noteId = req.params.id;
    
    // console.log(noteId);

    let notes = readJsonFile();

    //filter the data to not include the selected data
    notes.notes = notes.notes.filter((note) => note.id !== noteId); 

    // console.log(notes.notes);
    
    //rewrite json data without the selected data
    fs.writeFileSync(
        path.join(__dirname, './data/db.json'),
        JSON.stringify({ notes: notes.notes }, null, 2),

        res.json(notes)
    );
}) 

app.listen(PORT, () => {
    console.log(`API server now on port 3001!`);
})