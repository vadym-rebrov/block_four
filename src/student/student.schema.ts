import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema({ _id: false })
export class StudentAddress {
  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  town: string;

  @Prop({ required: true })
  addressString: string;
}

export const StudentAddressSchema =
  SchemaFactory.createForClass(StudentAddress);

@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  surname: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Group' })
  groupId: Types.ObjectId;

  @Prop({
    required: true,
    type: Date,
    validate: {
      validator: (value: Date) => value <= new Date(),
      message: (props: { value: Date }) =>
        `Birth date cannot be in the future. Provided date: ${props.value}`,
    },
  })
  birthDate: Date;

  @Prop({ type: [String] })
  phoneNumbers?: string[];

  @Prop({ type: StudentAddressSchema })
  address?: StudentAddress;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
