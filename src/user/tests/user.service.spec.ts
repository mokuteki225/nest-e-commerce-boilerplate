import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Connection, Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { Role } from 'src/role/role.entity';

import { UserService } from '../user.service';
import { RoleService } from 'src/role/role.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: MockRepository;
  let roleRepository: MockRepository;

  type MockRepository<T = any> = Partial<
    Record<keyof Repository<T>, jest.Mock>
  >;
  const createMockRepository = <T = any>(): MockRepository => ({
    findOne: jest.fn(),
    find: jest.fn(),
    preload: jest.fn().mockImplementation((dto) => dto),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((user) => ({
      id: expect.any(String),
      ...user,
    })),
    remove: jest.fn().mockImplementation((user) => user),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        RoleService,
        { provide: Connection, useValue: {} },
        { provide: getRepositoryToken(User), useValue: createMockRepository() },
        { provide: getRepositoryToken(Role), useValue: createMockRepository() },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    userRepository = module.get<MockRepository>(getRepositoryToken(User));
    roleRepository = module.get<MockRepository>(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all users', async () => {
      const expectedUsers = {};

      userRepository.find.mockReturnValue(expectedUsers);
      const users = await service.findAll();

      expect(users).toEqual(expectedUsers);
    });
  });

  describe('findOne', () => {
    describe('user with this ID exists', () => {
      it('returns user object', async () => {
        const userId = '3c5e83f6-d443-4981-9b86asdasd';
        const expectedUser = {};

        userRepository.findOne.mockReturnValue(expectedUser);
        const user = await service.findOne(userId);

        expect(user).toEqual(expectedUser);
      });
    });

    describe('user with this ID doesnt exist', () => {
      it('throws NotFoundException', async () => {
        const userId = '3c5e83f6-d443-4981-9b86-baaf05af1ff6';
        userRepository.findOne.mockReturnValue(undefined);

        try {
          await service.findOne(userId);
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toEqual(`There is no user under id ${userId}`);
        }
      });
    });
  });

  describe('findOneByEmail', () => {
    describe('user with this email exists', () => {
      it('returns user object', async () => {
        const email = 'zxc123@gmail.com';
        const expectedUser = {};

        userRepository.findOne.mockReturnValue(expectedUser);
        const user = await service.findOneByEmail(email);

        expect(user).toEqual(expectedUser);
      });
    });
  });

  describe('create', () => {
    it('creates a user', async () => {
      roleRepository.findOne.mockReturnValue({
        id: '87c40994-ebf5-4188-8814-1c03c013b9b3',
        name: 'admin',
      });

      const userDto = {
        name: 'Zxc',
        surname: 'Asd',
        email: 'zxc@gmail.com',
        password: 'zxc123',
        phoneNumber: '1234567',
        roleName: 'admin',
      };

      const user = await service.create(userDto);

      expect({
        ...user,
      }).toEqual({
        ...userDto,
        role: { id: expect.any(String), name: userDto.roleName },
        id: expect.any(String),
      });
    });
  });

  describe('update', () => {
    describe('user and the role exist', () => {
      it('updates user', async () => {
        roleRepository.findOne.mockReturnValue({
          id: '87c40994-ebf5-4188-8814-1c03c013b9b3',
          name: 'user',
        });

        const id = '1238sa-1fnu21d21-sfasdjq-asdhd1';
        const userDto = {
          name: 'Zxc',
          surname: 'Asd',
          email: 'zxc@gmail.com',
          password: 'zxc123',
          phoneNumber: '1234567',
          roleName: 'user',
        };

        const user = await service.update(id, userDto);

        expect({
          ...user,
        }).toEqual({
          ...userDto,
          role: { id: expect.any(String), name: userDto.roleName },
          id: expect.any(String),
        });
      });
    });

    describe('user exists but the role doesnt exist', () => {
      it('throws NotFoundException', async () => {
        roleRepository.findOne.mockReturnValue(undefined);

        const id = '1238sa-1fnu21d21-sfasdjq-asdhd1';
        const userDto = {
          name: 'Zxc',
          surname: 'Asd',
          email: 'zxc@gmail.com',
          password: 'zxc123',
          phoneNumber: '1234567',
          roleName: 'user',
        };

        try {
          const user = await service.update(id, userDto);
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toEqual(
            `There is no role under this name ${userDto.roleName}`,
          );
        }
      });
    });

    describe('user doesnt exist', () => {
      it('throws NotFoundException', async () => {
        roleRepository.findOne.mockReturnValue({
          id: '87c40994-ebf5-4188-8814-1c03c013b9b3',
          name: 'user',
        });
        userRepository.preload.mockReturnValue(undefined);

        const id = '1238sa-1fnu21d21-sfasdjq-asdhd1';
        const userDto = {
          name: 'Zxc',
          surname: 'Asd',
          email: 'zxc@gmail.com',
          password: 'zxc123',
          phoneNumber: '1234567',
          roleName: 'user',
        };

        try {
          const user = await service.update(id, userDto);
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toEqual(`There is no user under id ${id}`);
        }
      });
    });
  });

  describe('delete', () => {
    describe('user exists', () => {
      it('deletes user', async () => {
        const id = 'jdu12bf12-1fnu01m2-fmxal218d-f02ks1id';

        userRepository.findOne.mockReturnValue({});

        const deletedUser = await service.remove(id);

        expect(deletedUser).toEqual({});
      });
    });

    describe('user doesnt exist', () => {
      it('throws NotFoundException', async () => {
        const id = 'jdu12bf12-1fnu01m2-fmxal218d-f02ks1id';

        userRepository.findOne.mockReturnValue(undefined);

        try {
          const deletedUser = await service.remove(id);
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toEqual(`There is no user under id ${id}`);
        }
      });
    });
  });
});