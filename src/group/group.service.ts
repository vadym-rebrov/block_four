import { BadRequestException, Injectable } from '@nestjs/common';
import { GroupRepository } from './group.repository';
import { GroupDto } from './dto/GroupDto';
import { GroupCreateDto } from './dto/GroupCreateDto';
import { plainToInstance } from 'class-transformer';
import { isIdValid } from '../common/validators/validateDocumentId';

@Injectable()
export class GroupService {
  constructor(private readonly groupRepository: GroupRepository) {}

  async list(): Promise<GroupDto[]> {
    const groups = await this.groupRepository.list();
    return groups.map((group) =>
      plainToInstance(GroupDto, group, { excludeExtraneousValues: true }),
    );
  }

  async create(createDto: GroupCreateDto): Promise<string> {
    return this.groupRepository.create(createDto);
  }

  async exists(id: string): Promise<boolean> {
    if (!isIdValid(id)) {
      throw new BadRequestException(`Group id ${id} is invalid`);
    }
    return await this.groupRepository.exists(id);
  }
}
