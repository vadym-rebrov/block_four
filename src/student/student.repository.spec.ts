import { Test, TestingModule } from '@nestjs/testing';
import { StudentRepository } from './student.repository';
import {
  clearDatabase,
  startMongoContainer,
  stopMongoContainer,
} from '../test/mongo.setup';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema, StudentDocument } from './student.schema';
import { Group, GroupSchema } from '../group/group.schema';
import mongoose, { Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { StudentQueryDto } from './dto/query/StudentQueryDto';

describe('Student Repository', () => {
  let studentRepository: StudentRepository;
  let studentModel: Model<StudentDocument>;
  let groupModel: Model<Group>;

  beforeAll(async () => {
    const uri = await startMongoContainer();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Student.name, schema: StudentSchema },
          { name: Group.name, schema: GroupSchema },
        ]),
      ],
      providers: [StudentRepository],
    }).compile();

    studentRepository = module.get<StudentRepository>(StudentRepository);
    studentModel = module.get<Model<StudentDocument>>(
      getModelToken(Student.name),
    );
    groupModel = module.get<Model<Group>>(getModelToken(Group.name));
  });

  afterAll(async () => {
    await stopMongoContainer();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('get', () => {
    test('should provide a student', async () => {
      const group = await groupModel.create({
        name: 'Mathematics',
        startYear: 2023,
      });
      const student = await studentModel.create({
        name: 'Jane',
        surname: 'Smith',
        groupId: group.id,
        birthDate: new Date('1995-06-15'),
        phoneNumbers: ['+1234567890', '+0987654321'],
        address: {
          country: 'USA',
          town: 'Boston',
          addressString: '123 Main St',
        },
      });
      const studentData = await studentRepository.get(student.id.toString());
      expect(studentData).toBeDefined();
      expect(studentData!.phoneNumbers).toEqual(['+1234567890', '+0987654321']);
      expect(studentData!.address).toEqual({
        country: 'USA',
        town: 'Boston',
        addressString: '123 Main St',
      });
    });

    test('should provide null', async () => {
      const studentData = await studentRepository.get(
        new mongoose.Types.ObjectId().toString(),
      );
      expect(studentData).toBe(null);
    });
  });

  describe('create', () => {
    test('should create a student', async () => {
      const studentId = await studentRepository.create({
        name: 'John',
        surname: 'Doe',
        groupId: new mongoose.Types.ObjectId().toString(),
        birthDate: new Date('1990-01-30'),
        phoneNumbers: ['+380661234567'],
        address: {
          country: 'Ukraine',
          town: 'Kyiv',
          addressString: 'Vul. Khreshchatyk, 10, Kyiv, Ukraine',
        },
      });
      expect(studentId).toBeDefined();
    });

    test('should validate empty name and surname', async () => {
      await expect(
        studentRepository.create({
          name: '',
          surname: '',
          groupId: new mongoose.Types.ObjectId().toString(),
          birthDate: new Date('1990-01-30'),
        }),
      ).rejects.toMatchObject({
        message: expect.stringContaining(
          'Student validation failed: name: Path `name` is required., surname: Path `surname` is required.',
        ),
        name: 'ValidationError',
      });
    });

    test('should validate invalid birthDate', async () => {
      await expect(
        studentRepository.create({
          name: 'John',
          surname: 'Doe',
          groupId: new mongoose.Types.ObjectId().toString(),
          birthDate: new Date('2222-01-30'),
        }),
      ).rejects.toMatchObject({
        message: expect.stringContaining(
          'Student validation failed: birthDate: Birth date cannot be in the future. Provided date: Wed Jan 30 2222',
        ),
        name: 'ValidationError',
      });
    });

    test('should validate address', async () => {
      await expect(
        studentRepository.create({
          name: 'John',
          surname: 'Doe',
          groupId: new mongoose.Types.ObjectId().toString(),
          birthDate: new Date('1990-01-30'),
          address: { country: '', town: '', addressString: '' },
        }),
      ).rejects.toMatchObject({
        message: expect.stringContaining(
          'Student validation failed: address.country: Path `country` is required., address.town: Path `town` is required., address.addressString: Path `addressString` is required.',
        ),
        name: 'ValidationError',
      });
    });
  });

  describe('update', () => {
    test('should update a student', async () => {
      const group = await groupModel.create({
        name: 'Computer Science',
        startYear: 2022,
      });
      const student = await studentModel.create({
        name: 'John',
        surname: 'Doe',
        groupId: group.id.toString(),
        birthDate: new Date('1990-01-30'),
      });
      await studentRepository.update(student.id.toString(), {
        birthDate: new Date('1991-01-30'),
        phoneNumbers: ['+380661111111'],
        address: {
          country: 'Ukraine',
          town: 'Kyiv',
          addressString: 'Vul. Khreshchatyk, 10, Kyiv, Ukraine',
        },
      });
      const updatedStudent = await studentModel.findById(student.id);
      expect(updatedStudent).toBeDefined();
      expect(updatedStudent?.name).toBe('John');
      expect(updatedStudent?.surname).toBe('Doe');
      expect(updatedStudent?.birthDate).toEqual(new Date('1991-01-30'));
      expect(updatedStudent?.phoneNumbers).toEqual(['+380661111111']);
      expect(updatedStudent?.address?.country).toBe('Ukraine');
      expect(updatedStudent?.address?.town).toBe('Kyiv');
      expect(updatedStudent?.address?.addressString).toBe(
        'Vul. Khreshchatyk, 10, Kyiv, Ukraine',
      );
      expect(updatedStudent?.groupId.toString()).toBe(group.id.toString());
    });
  });

  describe('filter', () => {
    test('should filter students by empty query', async () => {
      const groupId1 = new mongoose.Types.ObjectId().toString();
      const student1 = await studentModel.create({
        name: 'John',
        surname: 'Doe',
        groupId: groupId1,
        birthDate: new Date('1990-01-30'),
      });
      const student2 = await studentModel.create({
        name: 'Bob',
        surname: 'Johnson',
        groupId: groupId1,
        birthDate: new Date('1985-07-07'),
      });

      const found = await studentRepository.filter(
        plainToInstance(StudentQueryDto, {}),
      );
      expect(found).toHaveLength(2);
      expect(found[0].name).toBe(student1.name);
      expect(found[1].surname).toBe(student2.surname);
    });

    test('should filter students by name and surname', async () => {
      const groupId1 = new mongoose.Types.ObjectId().toString();
      const student1 = await studentModel.create({
        name: 'John',
        surname: 'Doe',
        groupId: groupId1,
        birthDate: new Date('1990-01-30'),
      });
      const student2 = await studentModel.create({
        name: 'Bob',
        surname: 'Johnson',
        groupId: groupId1,
        birthDate: new Date('1985-07-07'),
      });

      const searchedForJohn = await studentRepository.filter(
        plainToInstance(
          StudentQueryDto,
          { name: student1.name },
          { excludeExtraneousValues: true },
        ),
      );
      expect(searchedForJohn).toHaveLength(1);
      expect(searchedForJohn[0].name).toBe(student1.name);

      const searchedForJohnson = await studentRepository.filter(
        plainToInstance(
          StudentQueryDto,
          { surname: student2.surname },
          { excludeExtraneousValues: true },
        ),
      );
      expect(searchedForJohnson).toHaveLength(1);
      expect(searchedForJohnson[0].surname).toBe(student2.surname);
    });

    test('should filter students by groupId', async () => {
      const groupId1 = new mongoose.Types.ObjectId().toString();
      const groupId2 = new mongoose.Types.ObjectId().toString();
      await studentModel.create({
        name: 'John',
        surname: 'Doe',
        groupId: groupId1,
        birthDate: new Date('1990-01-30'),
      });
      await studentModel.create({
        name: 'Bob',
        surname: 'Johnson',
        groupId: groupId2,
        birthDate: new Date('1985-07-07'),
      });

      const found = await studentRepository.filter(
        plainToInstance(
          StudentQueryDto,
          { groupId: groupId1 },
          { excludeExtraneousValues: true },
        ),
      );
      expect(found).toHaveLength(1);
      expect(found[0].groupId.toString()).toBe(groupId1);
    });
  });

  describe('remove', () => {
    test('should remove a student', async () => {
      const student = await studentModel.create({
        name: 'John',
        surname: 'Doe',
        groupId: new mongoose.Types.ObjectId().toString(),
        birthDate: new Date('1990-01-30'),
      });
      await studentRepository.delete(student.id.toString());
      const deletedStudent = await studentModel.findById(student.id);
      expect(deletedStudent).toBeNull();
    });
  });
});
