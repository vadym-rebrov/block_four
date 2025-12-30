import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class SeatTemplate {
    @Prop({ required: true, min: 1 })
    rowNumber: number;

    @Prop({ required: true, min: 1 })
    seatNumber: number;
}
export const SeatTemplateSchema = SchemaFactory.createForClass(SeatTemplate);

export type RoomDocument = HydratedDocument<Room>;

@Schema()
export class Room {
    @Prop({ required: true, unique: true, index: true })
    roomNumber: number;

    @Prop({ min: 1 })
    capacity: number;

    @Prop({ default: 'STANDARD', trim: true })
    type: string;

    @Prop({ type: [SeatTemplateSchema], default: [] })
    seatsTemplate: SeatTemplate[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);