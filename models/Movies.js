const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }, 
    description: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    addedBy: {  //addeed to remember the ID of user who added the movie for task 12
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Movie', movieSchema);