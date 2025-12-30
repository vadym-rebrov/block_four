import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete, HttpCode,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentCreateDto } from './dto/StudentCreateDto';
import { StudentUpdateDto } from './dto/StudentUpdateDto';
import { StudentQueryDto } from './dto/query/StudentQueryDto';
import { StudentDetailsDto } from './dto/StudentDetailsDto';
import { StudentInfoDto } from './dto/StudentInfoDto';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get(':id')
  async get(@Param('id') id: string): Promise<StudentDetailsDto> {
    return this.studentService.get(id);
  }

  @Post()
  async create(@Body() dto: StudentCreateDto): Promise<{ id: string }> {
    const id = await this.studentService.create(dto);
    return { id };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: StudentUpdateDto,
  ): Promise<void> {
    await this.studentService.update(id, dto);
  }

  @Get('groupId/:groupId')
  async listByGroupId(
    @Param('groupId') groupId: string,
  ): Promise<StudentInfoDto[]> {
    return this.studentService.listByGroupId(groupId);
  }

  @Post('_search')
  @HttpCode(200)
  async search(@Body() query: StudentQueryDto): Promise<StudentInfoDto[]> {
    return this.studentService.search(query);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    await this.studentService.delete(id);
  }
}
