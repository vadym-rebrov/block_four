import { BadRequestException } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupRepository } from './group.repository';
import { GroupDto } from './dto/GroupDto';
import { GroupCreateDto } from './dto/GroupCreateDto';
import * as validateIdModule from '../common/validators/validateDocumentId';
import mongoose from 'mongoose';

describe('GroupService', () => {
  let service: GroupService;
  let groupRepository: GroupRepository;

  beforeEach(() => {
    groupRepository = {
      list: jest.fn(),
      create: jest.fn(),
      exists: jest.fn(),
    } as any;

    service = new GroupService(groupRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(groupRepository).toBeDefined();
  });

  describe('list', () => {
    it('Should return list of GroupDto instances', async () => {
      const groupsFromRepo = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Group 1',
          startYear: 2025,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Group 2',
          startYear: 2024,
        },
      ];

      jest.spyOn(groupRepository, 'list').mockResolvedValue(groupsFromRepo);

      const result = await service.list();

      expect(groupRepository.list).toHaveBeenCalledTimes(1);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(GroupDto);
      expect(result[1]).toBeInstanceOf(GroupDto);
    });
    it('Should return empty list', async () => {
      const groupsFromRepo = [];

      jest.spyOn(groupRepository, 'list').mockResolvedValue(groupsFromRepo);

      const result = await service.list();

      expect(groupRepository.list).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('Should create group', async () => {
      const dto: GroupCreateDto = {
        name: 'New Group',
        startYear: 2022,
      };

      const createdId = 'group-id-123';

      jest.spyOn(groupRepository, 'create').mockResolvedValue(createdId);

      const result = await service.create(dto);

      expect(groupRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdId);
    });
  });

  describe('exists', () => {
    it('Should throw Bad Request if group id is invalid', async () => {
      const invalidId = 'invalid-id';

      jest.spyOn(validateIdModule, 'isIdValid').mockReturnValue(false);

      try {
        await service.exists(invalidId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual(`Group id ${invalidId} is invalid`);
      }

      expect(groupRepository.exists).toHaveBeenCalledTimes(0);
    });

    it('Should return true if group exists', async () => {
      const validId = '507f1f77bcf86cd799439011';

      jest.spyOn(validateIdModule, 'isIdValid').mockReturnValue(true);

      jest.spyOn(groupRepository, 'exists').mockResolvedValue(true);

      const result = await service.exists(validId);

      expect(validateIdModule.isIdValid).toHaveBeenCalledWith(validId);
      expect(groupRepository.exists).toHaveBeenCalledWith(validId);
      expect(result).toBe(true);
    });

    it('Should return false if group does not exist', async () => {
      const validId = '507f1f77bcf86cd799439012';

      jest.spyOn(validateIdModule, 'isIdValid').mockReturnValue(true);

      jest.spyOn(groupRepository, 'exists').mockResolvedValue(false);

      const result = await service.exists(validId);

      expect(groupRepository.exists).toHaveBeenCalledWith(validId);
      expect(result).toBe(false);
    });
  });
});
