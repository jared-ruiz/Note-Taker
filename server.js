const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static(__dirname + '/Develop/public'));
const PORT = process.env.PORT || 3001;
const fs = require('fs');
const path = require('path');

//require the json information 
const { notes } = require('./data/db');

//link for testing purposes: https://young-anchorage-10762.herokuapp.com/

//tales om query and filters through notes
function filterByQuery(query, notesArray) {
    let filteredResults = notesArray;

    if (query.title) {
        filteredResults = filteredResults.filter(notes => notes.title === query.title);
    }
    if (query.text) {
        filteredResults = filteredResults.filter(notes => notes.text === query.text);
    }
    return filteredResults;
}

function findById(id, notesArray) {
    const result = notesArray.filter(notes => notes.id === id)[0];
    return result;
}

function createNewNote(body, notesArray) {
    const note = body;
    notesArray.push(note);
    fs.writeFileSync(
        path.join(__dirname, './data/db.json'),
        JSON.stringify({ notes: notesArray }, null, 2)
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

//full notes json
app.get('/api/notes', (req, res) => {
    let results = notes;

    if (req.query) {
        results = filterByQuery(req.query, results);
    }

    res.json(results);
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

//post new notes
app.post('/api/notes', (req, res) => {
    //assigns the id that is being posted to one above the length. Allows no duplicate id's so long as nothing is deleted
    req.body.id = notes.length.toString();

    //if data in req.body is incorrect, send a 400 error
    if (!validateNote(req.body)) {
        res.status(400).send('The note is not properly formatted.');
    }
    else {
        const note = createNewNote(req.body, notes);
        res.json(note);
    }    
})


app.listen(PORT, () => {
    console.log(`API server now on port 3001!`);
})