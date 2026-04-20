const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Movie = require('../models/Movies');

//TASK11
//middleware to validate if userID is invaild and if it is, redirect to login page
function validateLogin(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    next();
}

//TASK12 
//Each user can only upadte movie that is created by themselves
async function checkOwner(req, res, next){

    const movie = await Movie.findById(req.params.id);

    if(!movie){
        return res.redirect('/movies');
    }
    if(!movie.addedBy || movie.addedBy.toString() !== req.session.userId.toString()){
        return res.redirect('/movies');
    }
    next();
}

router.get('/', async (req, res) =>{
    const movies = await Movie.find();
    res.render('movies', {
        movies,
        errors: [],
        movie: null,
        showDetails: false,
        editMode: false,
        user: req.session.username || null //added
    });
});

//TASK 4
router.get('/add', (req, res) => {
    res.render('movies', {
        errors: null,
        movie: {},
        movies: [], //added
        user: req.session.username || null //added
    });
});

//TASK 5
router.post(
    '/add',[
        body('name').notEmpty().withMessage('Name required'),
        body('description').notEmpty().withMessage('Description required'),
        body('year').isInt().withMessage('Valid year required'),
        body('genre').notEmpty().withMessage('Genre required'),
        body('rating').isFloat({ min: 0, max: 10 }).withMessage('Rating 0-10'),
        body('image').notEmpty().withMessage('Image required')
    ],
    async (req, res) => {
        console.log("WORKING");
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.log("FAILED VALID TEST");
            const movies = await Movie.find(); //added
            return res.render('movies', {
                errors: errors.array(),
                movie: req.body,
                movies, //added
                editMode: false,
                user: req.session.username || null //added
            });
        } else {
           console.log("PASSED VALID TEST"); 
        }

        const movie = new Movie({
            ...req.body,
            addedBy: req.session.userId //added
        });
        await movie.save();

        res.redirect('/movies');
    }
);

//TASK 7
router.get('/edit/:id', validateLogin, checkOwner, async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
        return res.redirect('/movies');
    }

    res.render('movieEdit', {
        movie,
        user: req.session.username || null //added
    });
});

router.post('/edit/:id', checkOwner, async (req, res) => {

    //update database
    await Movie.findByIdAndUpdate(
        req.params.id,
        req.body
    );

    res.redirect('/movies');
});

//TASK12
//validate the user to delete a movie
router.post('/delete/:id', validateLogin, checkOwner, async (req, res) => {
    await Movie.findByIdAndDelete(req.params.id);
    res.redirect('/movies');
});

//TASK 6
router.get('/:id', async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
        return res.redirect('/movies');
    }

    res.render('movieDetails', {
        movie,
        user: req.session.username || null //added
    });
});

module.exports = router;