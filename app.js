const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session'); //addeed

const moviesRoutes = require('./routes/movies');
const authRoutes = require('./routes/auth'); //added

mongoose.connect('mongodb+srv://dbUser:3nWqV3mtS7Ie9jyQ@cluster0.bijfjx4.mongodb.net/?appName=Cluster0')
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.log('Error connecting to MongoDB', err);
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); //added
app.use(session({ 
    secret: 'movies-secret-key', resave: false, saveUninitialized: false 
})); //resave and saveUninitialized is to avoiid unnecessary session

app.get("/", (req, res) => {
    res.render("index", {
        user: req.session.username || null //to send if an user is logged in or out to nav
    });
});;

app.use('/movies', moviesRoutes);
app.use('/auth', authRoutes); //connect to auth

app.listen(port, () => {
    console.log(`Server is running on port 'http://localhost:${port}'`);
});