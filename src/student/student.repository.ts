import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Student, StudentDocument } from './student.schema';
import { Model } from 'mongoose';
import { StudentCreateDto } from './dto/StudentCreateDto';
import { StudentUpdateDto } from './dto/StudentUpdateDto';
import { StudentQueryDto } from './dto/query/StudentQueryDto';

@Injectable()
export class StudentRepository {
  constructor(
    @InjectModel(Student.name) private readonly model: Model<StudentDocument>,
  ) {}

  async get(id: string): Promise<Student | null> {
    return this.model.findById(id).lean();
  }

  async create(data: StudentCreateDto): Promise<string> {
    const student = await this.model.create(data);
    return student.id;
  }

  async update(id: string, data: StudentUpdateDto): Promise<void> {
    await this.model.updateOne({ _id: id }, { $set: data });
  }

  async filter(query: StudentQueryDto): Promise<Student[]> {
    const { name, surname, groupId, skip, limit } = query;

    return this.model
      .find({
        ...(name && { name }),
        ...(surname && { surname }),
        ...(groupId && { groupId }),
      })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }
}
