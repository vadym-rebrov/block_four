import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StudentRepository } from './student.repository';
import { StudentDetailsDto } from './dto/StudentDetailsDto';
import { isIdValid } from '../common/validators/validateDocumentId';
import { plainToInstance } from 'class-transformer';
import { StudentCreateDto } from './dto/StudentCreateDto';
import { StudentUpdateDto } from './dto/StudentUpdateDto';
import { StudentInfoDto } from './dto/StudentInfoDto';
import { StudentQueryDto } from './dto/query/StudentQueryDto';
import { GroupService } from '../group/group.service';

@Injectable()
export class StudentService {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly groupService: GroupService,
  ) {}

  async get(id: string): Promise<StudentDetailsDto> {
    if (!isIdValid(id)) {
      throw new BadRequestException(`id ${id} is not valid`);
    }
    const student = await this.studentRepository.get(id);

    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found.`);
    }
    return plainToInstance(StudentDetailsDto, student, {
      excludeExtraneousValues: true,
    });
  }

  async create(createDto: StudentCreateDto): Promise<string> {
    await this.validateGroupId(createDto.groupId);
    return this.studentRepository.create(createDto);
  }

  async update(id: string, studentDto: StudentUpdateDto): Promise<void> {
    if (!isIdValid(id)) {
      throw new BadRequestException(`id ${id} is not valid`);
    }
    if (studentDto.groupId) {
      await this.validateGroupId(studentDto.groupId);
    }
    await this.studentRepository.update(id, studentDto);
  }

  async listByGroupId(groupId: string): Promise<StudentInfoDto[]> {
    if (!isIdValid(groupId)) {
      throw new BadRequestException(`id ${groupId} is not valid`);
    }
    const students = await this.studentRepository.filter(
      plainToInstance(StudentQueryDto, { groupId }),
    );
    return students.map((student) =>
      plainToInstance(StudentInfoDto, student, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async search(query: StudentQueryDto): Promise<StudentInfoDto[]> {
    if (!!query.groupId && !isIdValid(query.groupId)) {
      throw new BadRequestException(`id ${query.groupId} is not valid`);
    }
    const students = await this.studentRepository.filter(query);
    return students.map((student) =>
      plainToInstance(StudentInfoDto, student, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async delete(id: string): Promise<void> {
    if (!isIdValid(id)) {
      throw new BadRequestException(`id ${id} is not valid`);
    }
    await this.studentRepository.delete(id);
  }

  async validateGroupId(id: string): Promise<void> {
    const groupExists = await this.groupService.exists(id);
    if (!groupExists) {
      throw new BadRequestException(`Group with id ${id} doesn't exists.`);
    }
  }
}
