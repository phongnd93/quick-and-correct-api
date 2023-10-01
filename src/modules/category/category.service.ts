import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'database/entities';
import { plainToInstance } from 'class-transformer';
import { D2MBadRequestException, D2MNotFoundException } from 'src/common/infra-exception';
import { BaseService } from 'src/common/services';
import { CreateCategoryDto, CategoryResponseDto } from './dtos';

@Injectable()
export class CategoryService extends BaseService<Category> {
  constructor(
    @InjectRepository(Category)
    private catRepository: Repository<Category>,
  ) {
    super(catRepository);
  }

  async getCategoryById(catId: string): Promise<CategoryResponseDto> {
    const cat = await this.catRepository.findOne({
      where: { id: catId },
      relations: {},
    });

    if (!cat) {
      throw new D2MNotFoundException('User not found');
    }

    return plainToInstance(CategoryResponseDto, {
      ...cat,
    });
  }

  async categories(): Promise<Category[]> {
    return this.findAll();
  }

  async getListofCategories(): Promise<CategoryResponseDto[]> {
    const user = await this.catRepository.find({});

    if (!user) {
      throw new D2MNotFoundException('User not found');
    }

    return plainToInstance(CategoryResponseDto, {
      ...user,
    });
  }

  async findByIdOrFail(id: string): Promise<Category> {
    return this.catRepository.findOneByOrFail({ id });
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    if (await this.findOne({ description: data.description })) {
      throw new D2MBadRequestException('Description is already in use');
    }
    const cat = await this.create(data);
    if (!cat) {
      throw new D2MBadRequestException('Failed, cant update category');
    }
    return cat;
  }
}
