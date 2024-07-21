import { getModelToken } from '@nestjs/sequelize';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { Test, TestingModule } from '@nestjs/testing';

const mockUserModel = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    const user = { userId: 'test', password: 'test' } as User;
    mockUserModel.create.mockResolvedValue(user);
    const result = await service.create(user);
    expect(result).toEqual(user);
  });

  it('should return all users', async () => {
    const users = [{ userId: 'test1' }, { userId: 'test2' }] as User[];
    mockUserModel.findAll.mockResolvedValue(users);
    const result = await service.findAll();
    expect(result).toEqual(users);
  });

  it('should return a user by ID', async () => {
    const user = { userId: 'test' } as User;
    mockUserModel.findByPk.mockResolvedValue(user);
    const result = await service.findOne(1);
    expect(result).toEqual(user);
  });

  it('should update a user', async () => {
    const user = { userId: 'test' } as User;
    mockUserModel.update.mockResolvedValue([1, [user]]);
    await service.update(1, user);
    expect(mockUserModel.update).toHaveBeenCalledWith(user, {
      where: { id: 1 },
    });
  });

  it('should delete a user', async () => {
    mockUserModel.destroy.mockResolvedValue(1);
    await service.remove(1);
    expect(mockUserModel.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
