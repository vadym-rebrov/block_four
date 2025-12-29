const mongoose = require('mongoose');


const TicketSchema = new mongoose.Schema({
    rowNumber: {
        type: Number,
        required: true
    },
    seatNumber: {
        type: Number,
        required: true
    },
    isBooked:{
        type: Boolean,
        default: false,
    },
    booking_details_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: false,
    }
});

const MovieSchema = new mongoose.Schema({
    ext_id:{
        type: Number,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        index: true
    }
});


const MovieSessionSchema = new mongoose.Schema({
    movie: MovieSchema,
    start:{
        type: Date,
        default: Date.now
    },
    end:{
        type: Date,
        required: true
    },
    room_number: {
        type: Number,
        required: true,
        index: true
    },
    tickets:[TicketSchema],
    created_at:{
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('MovieSession', MovieSessionSchema);