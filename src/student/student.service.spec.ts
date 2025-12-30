import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentRepository } from './student.repository';
import { GroupService } from '../group/group.service';
import { StudentCreateDto } from './dto/StudentCreateDto';
import { StudentUpdateDto } from './dto/StudentUpdateDto';
import { StudentQueryDto } from './dto/query/StudentQueryDto';
import { plainToInstance } from 'class-transformer';
import mongoose from 'mongoose';

describe('StudentService', () => {
  let studentService: StudentService;
  let studentRepository: StudentRepository;
  let groupService: GroupService;

  beforeEach(async () => {
    studentRepository = {
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      filter: jest.fn(),
      delete: jest.fn(),
    } as any;

    groupService = {
      exists: jest.fn(),
    } as any;

    studentService = new StudentService(studentRepository, groupService);
  });

  it('should be defined', () => {
    expect(studentService).toBeDefined();
    expect(studentRepository).toBeDefined();
    expect(groupService).toBeDefined();
  });

  describe('get', () => {
    it('should provide a student', async () => {
      const studentFound = {
        _id: new mongoose.Types.ObjectId(),
        name: 'John',
        surname: 'Doe',
        groupId: new mongoose.Types.ObjectId(),
        birthDate: new Date('1988-01-30'),
      };
      jest.spyOn(studentRepository, 'get').mockResolvedValueOnce(studentFound);

      const result = await studentService.get(studentFound._id.toString());

      expect(result.name).toBe(studentFound.name);
      expect(result.surname).toBe(studentFound.surname);
      expect(result.groupId).toBe(studentFound.groupId.toString());
      expect(result.birthDate).toEqual(studentFound.birthDate);
    });

    it('should throw NotFoundException', async () => {
      const studentId = new mongoose.Types.ObjectId().toString();
      jest.spyOn(studentRepository, 'get').mockResolvedValueOnce(null);

      await expect(studentService.get(studentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(studentRepository.get).toHaveBeenCalledWith(studentId);
    });

    it('should throw invalid id', async () => {
      await expect(studentService.get('invalidId')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('create', () => {
    it('should create a student', async () => {
      const studentId = new mongoose.Types.ObjectId().toString();
      const createDto: StudentCreateDto = plainToInstance(StudentCreateDto, {
        name: 'John',
        surname: 'Doe',
        groupId: new mongoose.Types.ObjectId().toString(),
        birthDate: new Date('1988-01-30'),
      });
      jest.spyOn(groupService, 'exists').mockResolvedValueOnce(true);
      jest.spyOn(studentRepository, 'create').mockResolvedValueOnce(studentId);

      const result = await studentService.create(createDto);

      expect(result).toEqual(studentId);
      expect(groupService.exists).toHaveBeenCalledWith(createDto.groupId);
      expect(studentRepository.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw if group does not exist', async () => {
      const createDto: StudentCreateDto = plainToInstance(StudentCreateDto, {
        name: 'John',
        surname: 'Doe',
        groupId: new mongoose.Types.ObjectId().toString(),
        birthDate: new Date('1988-01-30'),
      });
      jest.spyOn(groupService, 'exists').mockResolvedValueOnce(false);

      await expect(studentService.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a student', async () => {
      const studentId = new mongoose.Types.ObjectId().toString();
      const updateDto: StudentUpdateDto = plainToInstance(StudentUpdateDto, {
        name: 'John',
        surname: 'Doe',
        groupId: new mongoose.Types.ObjectId().toString(),
        birthDate: new Date('1988-01-30'),
      });
      jest.spyOn(groupService, 'exists').mockResolvedValueOnce(true);
      jest.spyOn(studentRepository, 'update').mockResolvedValueOnce(undefined);

      await studentService.update(studentId, updateDto);

      expect(studentRepository.update).toHaveBeenCalledWith(
        studentId,
        updateDto,
      );
    });

    it('should throw if group does not exist', async () => {
      const studentId = new mongoose.Types.ObjectId().toString();
      const updateDto: StudentUpdateDto = plainToInstance(StudentUpdateDto, {
        name: 'John',
        surname: 'Doe',
        groupId: new mongoose.Types.ObjectId().toString(),
        birthDate: new Date('1988-01-30'),
      });
      jest.spyOn(groupService, 'exists').mockResolvedValueOnce(false);

      await expect(studentService.update(studentId, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if student id is invalid', async () => {
      const studentId = 'invalidId';
      const updateDto: StudentUpdateDto = plainToInstance(StudentUpdateDto, {
        name: 'John',
        surname: 'Doe',
        groupId: new mongoose.Types.ObjectId().toString(),
        birthDate: new Date('1988-01-30'),
      });

      await expect(studentService.update(studentId, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('listByGroupId', () => {
    it('should return students list', async () => {
      const groupId = new mongoose.Types.ObjectId();
      const students = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'John',
          surname: 'Doe',
          groupId,
          birthDate: new Date('1988-01-30'),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Alice',
          surname: 'Smith',
          groupId,
          birthDate: new Date('1995-07-15'),
        },
      ];
      jest.spyOn(studentRepository, 'filter').mockResolvedValueOnce(students);

      const result = await studentService.listByGroupId(groupId.toString());

      expect(result).toHaveLength(2);
    });

    it('should return empty list', async () => {
      const groupId = new mongoose.Types.ObjectId().toString();
      jest.spyOn(studentRepository, 'filter').mockResolvedValueOnce([]);

      const result = await studentService.listByGroupId(groupId);

      expect(result).toHaveLength(0);
    });

    it('should throw if groupId is invalid', async () => {
      const groupId = 'invalidId';
      await expect(studentService.listByGroupId(groupId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('search', () => {
    it('should return students by query', async () => {
      const students = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'John',
          surname: 'Doe',
          groupId: new mongoose.Types.ObjectId(),
          birthDate: new Date('1988-01-30'),
        },
      ];
      const query: StudentQueryDto = plainToInstance(StudentQueryDto, {
        groupId: new mongoose.Types.ObjectId().toString(),
        name: 'John',
        surname: 'Doe',
      });
      jest.spyOn(studentRepository, 'filter').mockResolvedValueOnce(students);

      const result = await studentService.search(query);

      expect(result).toHaveLength(1);
    });

    it('should return empty list', async () => {
      const query: StudentQueryDto = plainToInstance(StudentQueryDto, {
        groupId: new mongoose.Types.ObjectId().toString(),
        name: 'John',
        surname: 'Doe',
      });
      jest.spyOn(studentRepository, 'filter').mockResolvedValueOnce([]);

      const result = await studentService.search(query);

      expect(result).toHaveLength(0);
    });

    it('should throw if groupId is invalid', async () => {
      const query: StudentQueryDto = plainToInstance(StudentQueryDto, {
        groupId: 'invalidId',
      });
      await expect(studentService.search(query)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('delete', () => {
    it('should remove student', async () => {
      const studentId = new mongoose.Types.ObjectId().toString();
      jest.spyOn(studentRepository, 'delete').mockResolvedValueOnce(undefined);

      await studentService.delete(studentId);

      expect(studentRepository.delete).toHaveBeenCalledWith(studentId);
    });

    it('should throw if student id is invalid', async () => {
      const studentId = 'invalidId';
      await expect(studentService.delete(studentId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
