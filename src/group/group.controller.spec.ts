import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import {
  GROUP_NAME_LENGTH_LESS_THAN_2,
  GROUP_START_YEAR_LESS_THAN_2020,
} from './group.errorCodes';
import { GroupCreateDto } from './dto/GroupCreateDto';

describe('GroupController', () => {
  let app: INestApplication;
  let groupService: GroupService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [
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

    groupService = moduleRef.get<GroupService>(GroupService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(groupService).toBeDefined();
  });

  describe('GET /groups', () => {
    it('Should return list of groups', async () => {
      const group1 = { _id: '1', name: 'Group-1', startYear: 2020 };
      const group2 = { _id: '2', name: 'Group-5', startYear: 2025 };
      const responseBody = [group1, group2];

      jest.spyOn(groupService, 'list').mockResolvedValueOnce([group1, group2]);

      const response = await request(app.getHttpServer()).get('/groups');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(responseBody);
    });

    it('Should return an empty list', async () => {
      jest.spyOn(groupService, 'list').mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer()).get('/groups');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /groups', () => {
    it('Should create a group', async () => {
      const body: GroupCreateDto = { name: 'Group', startYear: 2025 };
      const id = '123';

      jest.spyOn(groupService, 'create').mockResolvedValueOnce(id);

      const response = await request(app.getHttpServer())
        .post('/groups')
        .send(body);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id });
    });

    it('Should throw 400. startYear less than 2020', async () => {
      const body: GroupCreateDto = { name: 'Group', startYear: 2019 };

      const response = await request(app.getHttpServer())
        .post('/groups')
        .send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual([GROUP_START_YEAR_LESS_THAN_2020]);
    });

    it('Should throw 400. groupName less than 2 symbols', async () => {
      const body: GroupCreateDto = { name: 'G', startYear: 2020 };

      const response = await request(app.getHttpServer())
        .post('/groups')
        .send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual([GROUP_NAME_LENGTH_LESS_THAN_2]);
    });
  });
});
