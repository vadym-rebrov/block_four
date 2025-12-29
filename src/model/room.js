const mongoose = require('mongoose');

const Room = new mongoose.Schema({
    roomNumber: { type: Number, required: true, unique: true },
    capacity: { type: Number },
    type: { type: String, default: 'STANDARD' },
    seatsTemplate: [
        {
            rowNumber: Number,
            seatNumber: Number,
        }
    ]
});

module.exports = mongoose.model('Room', Room);