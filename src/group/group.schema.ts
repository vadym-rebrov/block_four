import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const MIN_LENGTH_GROUP_NAME = 2;
export const MIN_GROUP_START_YEAR = 2020;

export type GroupDocument = Group & Document;

@Schema()
export class Group {
  @Prop({ required: true, minlength: MIN_LENGTH_GROUP_NAME })
  name: string;

  @Prop({ required: true, min: MIN_GROUP_START_YEAR })
  startYear: number;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
