const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// GET register
router.get('/register', (req, res) =>{
    res.render('register', {
        errors: [],
        data: {},
        user: req.session.username || null //display login state
    });
});

//TASK 8
router.post('/register', [ body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) =>{
        if(value !== req.body.password){
            throw new Error('Passwords do not match');
        }
        return true;
    })
], async (req, res) =>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.render('register',{
            errors: errors.array(),
            data: req.body,
            user: req.session.username || null 
        });
    }

    const existing = await User.findOne({ email: req.body.email });
    if(existing){
        return res.render('register',{
            errors: [{ msg: 'Email already in use' }],
            data: req.body,
            user: req.session.username || null
        });
    }

    const hashed = await bcrypt.hash(req.body.password, 10);

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashed
    });

    await user.save();
    res.redirect('/auth/login');
});

router.get('/login', (req, res) =>{
    res.render('login', {
        errors: [],
        data: {},
        user: req.session.username || null 
    });
});

//TASK 9
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req,res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.render('login', {
            errors: errors.array(),
            data: req.body,
            user: req.session.username || null
        });
    }

    const user = await User.findOne({ email: req.body.email });

    if(!user){
        return res.render('login',{
            errors: [{ msg: 'Invalid email or password' }],
            data: req.body,
            user: req.session.username || null
        });
    }
    //match to pw in database
    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match){
        return res.render('login',{
            errors: [{ msg: 'Invalid email or password'}],
            data: req.body,
            user: req.session.username || null
        });
    }

    req.session.userId = user._id;
    req.session.username = user.username;

    res.redirect('/movies');
});

//TASK 10
router.get('/logout', (req,res) =>{
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;