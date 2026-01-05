import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema()
export class Ticket {
    @Prop({ required: true, min: 1 })
    rowNumber: number;

    @Prop({ required: true, min: 1 })
    seatNumber: number;

    @Prop({ default: false })
    isBooked: boolean;

    @Prop({ type: Types.ObjectId, ref: 'Booking', required: false })
    booking_details_id?: Types.ObjectId;
}
export const TicketSchema = SchemaFactory.createForClass(Ticket);


@Schema()
export class Movie {
    @Prop({ required: true, index: true })
    ext_id: number;

    @Prop({ required: true, index: true, trim: true })
    title: string;
}
export const MovieSchema = SchemaFactory.createForClass(Movie);


export type MovieSessionDocument = HydratedDocument<MovieSession>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class MovieSession {
    @Prop({ type: MovieSchema, required: true })
    movie: Movie;

    @Prop({ default: Date.now })
    start: Date;

    @Prop({
            required: true,
            validate: {
                validator: function (value: Date) {
                    return this.start <= value;
                },
                message: 'End time must be after start time'
            }
    })
    end: Date;

    @Prop({ required: true, index: true, min: 1 })
    room_number: number;

    @Prop({ type: [TicketSchema], default: [] })
    tickets: Ticket[];

}

export const MovieSessionSchema = SchemaFactory.createForClass(MovieSession);