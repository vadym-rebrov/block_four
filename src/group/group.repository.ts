import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group, GroupDocument } from './group.schema';
import { Model } from 'mongoose';
import { GroupCreateDto } from './dto/GroupCreateDto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class GroupRepository {
  constructor(
    @InjectModel(Group.name) private readonly model: Model<GroupDocument>,
  ) {}

  async list(): Promise<Group[]> {
    const groups = await this.model.find({}).lean();
    return groups.map(group => plainToInstance(Group, group));
  }

  async create({ name, startYear }: GroupCreateDto): Promise<string> {
    const group = await this.model.create({
      name,
      startYear,
    });
    return group.id;
  }

  async exists(id: string): Promise<boolean> {
    return !!(await this.model.exists({
      _id: id,
    }));
  }
}
