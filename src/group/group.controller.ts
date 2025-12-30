import { Body, Controller, Get, Post } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupDto } from './dto/GroupDto';
import { GroupCreateDto } from './dto/GroupCreateDto';

@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get('')
  async list(): Promise<GroupDto[]> {
    return this.groupService.list();
  }

  @Post('')
  async create(@Body() createDto: GroupCreateDto): Promise<{ id: string }> {
    const id = await this.groupService.create(createDto);
    return { id };
  }
}
