import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { StudentDetailsDto } from './dto/StudentDetailsDto';
import { StudentInfoDto } from './dto/StudentInfoDto';
import { StudentCreateDto } from './dto/StudentCreateDto';
import { StudentUpdateDto } from './dto/StudentUpdateDto';
import { StudentQueryDto } from './dto/query/StudentQueryDto';
import mongoose from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { StudentRepository } from './student.repository';
import { GroupService } from '../group/group.service';

describe('StudentController', () => {
  let app: INestApplication;
  let studentService: StudentService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [StudentController],
      providers: [
        StudentService,
        {
          provide: StudentRepository,
          useValue: {
            get: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            filter: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: GroupService,
          useValue: {
            list: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    studentService = moduleRef.get<StudentService>(StudentService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(studentService).toBeDefined();
  });

  describe('GET /api/students/:id', () => {
    test('Should return a student', async () => {
      const id = new mongoose.Types.ObjectId();
      const studentFound = new StudentDetailsDto();
      Object.assign(studentFound, {
        _id: id,
        name: 'John',
        surname: 'Doe',
        groupId: new mongoose.Types.ObjectId().toString(),
        birthDate: new Date('1988-01-30'),
      });
      jest.spyOn(studentService, 'get').mockResolvedValueOnce(studentFound);
      const response = await request(app.getHttpServer()).get(
        `/students/${id.toString()}`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          name: studentFound.name,
          surname: studentFound.surname,
          groupId: studentFound.groupId,
          birthDate: studentFound.birthDate!.toISOString(),
        }),
      );
    });

    test('Should throw 404', async () => {
      const id = new mongoose.Types.ObjectId();
      const errorMessage = `Student with id ${id} not found.`;
      jest
        .spyOn(studentService, 'get')
        .mockRejectedValueOnce(new NotFoundException(errorMessage));
      const response = await request(app.getHttpServer()).get(
        `/students/${id.toString()}`,
      );
      expect(response.status).toBe(404);
      expect(response.body.message).toEqual(errorMessage);
    });

    test('Should throw 400 (invalid id)', async () => {
      const id = 'invalid-id';
      const response = await request(app.getHttpServer()).get(
        `/students/${id}`,
      );
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(`id ${id} is not valid`);
    });
  });

  describe('POST /api/students', () => {
    test('Should create a student', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const dto: StudentCreateDto = {
        name: 'John',
        surname: 'Doe',
        groupId: new mongoose.Types.ObjectId().toString(),
        birthDate: new Date('1988-01-30'),
      };
      jest.spyOn(studentService, 'create').mockResolvedValueOnce(id);
      const response = await request(app.getHttpServer())
        .post('/students')
        .send(dto);
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id });
    });

    test('Should validate groupId and throw 400 (group does not exist)', async () => {
      const dto = {
        name: 'John',
        surname: 'Doe',
        groupId: new mongoose.Types.ObjectId().toString(),
        birthDate: new Date('1988-01-30'),
      };
      jest.spyOn(studentService, 'create').mockRejectedValueOnce(
        new BadRequestException({
          errors: [`Group with id ${dto.groupId} doesn't exists.`],
        }),
      );
      const response = await request(app.getHttpServer())
        .post('/students')
        .send(dto);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: [`Group with id ${dto.groupId} doesn't exists.`],
      });
    });

    test('should validate empty name, surname, birthDate, groupId and throw 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/students')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          'name must be a string',
          'surname must be a string',
          'groupId must be a string',
          'birthDate must be a Date instance',
        ]),
      );
    });

    test('should validate address and throw 400', async () => {
      const dto = {
        name: 'John',
        surname: 'Doe',
        groupId: new mongoose.Types.ObjectId().toString(),
        birthDate: new Date('1988-01-30'),
        address: {},
      };
      const response = await request(app.getHttpServer())
        .post('/students')
        .send(dto);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatchObject([
        'address.country must be a string',
        'address.town must be a string',
        'address.addressString must be a string',
      ]);
    });
  });

  describe('PATCH /api/students/:id', () => {
    test('Should update a student', async () => {
      const id = new mongoose.Types.ObjectId();
      const dto: StudentUpdateDto = {
        name: 'John',
        surname: 'Doe',
        groupId: new mongoose.Types.ObjectId().toString(),
        birthDate: new Date('1988-01-30'),
      };
      jest.spyOn(studentService, 'update').mockResolvedValueOnce();
      const response = await request(app.getHttpServer())
        .patch(`/students/${id.toString()}`)
        .send(dto);
      expect(response.status).toBe(200);
    });

    test('Should validate groupId and throw 400 (group does not exist)', async () => {
      const id = new mongoose.Types.ObjectId();
      const dto: StudentUpdateDto = {
        name: 'John',
        surname: 'Doe',
        groupId: new mongoose.Types.ObjectId().toString(),
        birthDate: new Date('1988-01-30'),
      };
      jest.spyOn(studentService, 'update').mockRejectedValueOnce(
        new BadRequestException({
          errors: [`Group with id ${dto.groupId} doesn't exists.`],
        }),
      );
      const response = await request(app.getHttpServer())
        .patch(`/students/${id.toString()}`)
        .send(dto);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: [`Group with id ${dto.groupId} doesn't exists.`],
      });
    });

    test('should validate studentId because it is not valid', async () => {
      const id = 'studentId-is-not-valid';
      const dto: StudentUpdateDto = {
        name: 'John',
        surname: 'Doe',
        groupId: new mongoose.Types.ObjectId().toString(),
        birthDate: new Date('1988-01-30'),
      };
      const response = await request(app.getHttpServer())
        .patch(`/students/${id}`)
        .send(dto);
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(`id ${id} is not valid`);
    });

    test('should validate address', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const dto = {
        name: 'John',
        surname: 'Doe',
        groupId: new mongoose.Types.ObjectId().toString(),
        birthDate: new Date('1988-01-30'),
        address: {},
      };
      const response = await request(app.getHttpServer())
        .patch(`/students/${id}`)
        .send(dto);
      expect(response.status).toBe(400);
      expect(response.body.message).toMatchObject([
        'address.country must be a string',
        'address.town must be a string',
        'address.addressString must be a string',
      ]);
    });
  });

  describe('GET /api/students/groupId/:groupId', () => {
    test('Should return list of students', async () => {
      const groupId = new mongoose.Types.ObjectId().toString();
      const students: StudentInfoDto[] = [
        {
          name: 'John',
          surname: 'Doe',
          groupId,
          birthDate: new Date('1988-01-30'),
        } as any,
        {
          name: 'Alice',
          surname: 'Smith',
          groupId,
          birthDate: new Date('1995-07-15'),
        } as any,
      ];
      jest
        .spyOn(studentService, 'listByGroupId')
        .mockResolvedValueOnce(students);
      const response = await request(app.getHttpServer()).get(
        `/students/groupId/${groupId}`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('Should return an empty list', async () => {
      const groupId = new mongoose.Types.ObjectId().toString();
      jest.spyOn(studentService, 'listByGroupId').mockResolvedValueOnce([]);
      const response = await request(app.getHttpServer()).get(
        `/students/groupId/${groupId}`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    test('Should validate groupId because it is not valid', async () => {
      const groupId = 'groupId-is-not-valid';
      const response = await request(app.getHttpServer()).get(
        `/students/groupId/${groupId}`,
      );
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(`id ${groupId} is not valid`);
    });
  });

  describe('POST /api/students/_search', () => {
    test('Should return list of students by query', async () => {
      const query = plainToInstance(StudentQueryDto, {
        groupId: new mongoose.Types.ObjectId().toString(),
        name: 'John',
        surname: 'Doe',
      });
      const students: StudentInfoDto[] = [
        {
          name: 'John',
          surname: 'Doe',
          groupId: query.groupId,
          birthDate: new Date('1988-01-30'),
        } as any,
      ];
      jest.spyOn(studentService, 'search').mockResolvedValueOnce(students);
      const response = await request(app.getHttpServer())
        .post('/students/_search')
        .send(query);
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    test('Should return an empty list', async () => {
      const query = plainToInstance(StudentQueryDto, {
        groupId: new mongoose.Types.ObjectId().toString(),
        name: 'John',
        surname: 'Doe',
      });
      jest.spyOn(studentService, 'search').mockResolvedValueOnce([]);
      const response = await request(app.getHttpServer())
        .post('/students/_search')
        .send(query);
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    test('Should validate groupId because it is not valid', async () => {
      const query = plainToInstance(StudentQueryDto, {
        groupId: 'groupId-is-not-valid',
      });
      const response = await request(app.getHttpServer())
        .post('/students/_search')
        .send(query);
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(`id ${query.groupId} is not valid`);
    });
  });

  describe('DELETE /api/students/:id', () => {
    test('Should remove a student by id', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      jest.spyOn(studentService, 'delete').mockResolvedValueOnce();
      const response = await request(app.getHttpServer()).delete(
        `/students/${id}`,
      );
      expect(response.status).toBe(204);
    });

    test('Should validate id because it is not valid', async () => {
      const id = 'studentId-is-not-valid';
      const response = await request(app.getHttpServer()).delete(
        `/students/${id}`,
      );
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(`id ${id} is not valid`);
    });
  });
});
