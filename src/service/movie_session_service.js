const MovieSession = require('../model/MovieSession');
const Room = require('../model/Room');
class SessionService {

    async createSession(sessionData) {
        const room = await Room.findOne({
            roomNumber: sessionData.room_number
        });
        if (!room){
            throw new Error('Room not found');
        }

        const tickets = room.seatsTemplate.map(seat => ({
            rowNumber: seat.rowNumber,
            seatNumber: seat.seatNumber,
            isBooked: false,
        }));

        const newSession = new MovieSession({
            ...sessionData,
            tickets: tickets
        });

        return newSession.save();
    }

    async findAllSessions() {
        return await MovieSession.find().select('-tickets');
    }

    async findById(id) {
        return await MovieSession.findById(id);
    }

    async bookTicket(sessionId, row, seat, booking_details_id) {
        return await MovieSession.findOneAndUpdate(
            {
                _id: sessionId,
                'tickets.rowNumber': row,
                'tickets.seatNumber': seat,
                'tickets.isBooked': { $eq: false }
            },
            {
                $set: { 'tickets.$.customer': customerData }
            },
            { new: true }
        );
    }
}

module.exports = new SessionService();