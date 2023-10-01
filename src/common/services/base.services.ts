import { BaseEntity } from 'database/entities';
import { DeepPartial, In, ObjectLiteral, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PageDto, PageMetaDto, PageOptionsDto } from '../dtos';
import { D2MNotFoundException } from '../infra-exception';

export abstract class BaseService<T extends BaseEntity> {
  constructor(private readonly repository: Repository<T>) {}

  protected getModelName(): string {
    return this.repository.metadata.targetName;
  }

  async findOne(
    where: { [Property in keyof T]?: any },
    include: (keyof T)[] = [],
  ): Promise<T | null> {
    const getElement = await this.repository.findOne({
      where: where as any,
      relations: include as string[],
    });
    return getElement;
  }

  async findOneOrFail(
    where: { [Property in keyof T]?: any },
    include: (keyof T)[] = [],
  ): Promise<T> {
    const getElement = await this.repository.findOne({
      where: where as any,
      relations: include as string[],
    });
    if (!getElement) {
      throw new D2MNotFoundException(`${this.getModelName()} not found`);
    }
    return getElement;
  }

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async findPaginated(
    pageOptionsDto: PageOptionsDto,
    rawQuery?: { where: string; parameters?: ObjectLiteral },
  ): Promise<PageDto<T>> {
    const queryBuilder = this.repository.createQueryBuilder(this.getModelName());
    if (rawQuery) {
      queryBuilder.where(rawQuery.where, rawQuery?.parameters);
    }
    queryBuilder
      .orderBy(pageOptionsDto.sort || 'created_at', pageOptionsDto.sortDirection || 'DESC')
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getMany();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  async findByIds(ids: string[]): Promise<T[]> {
    return this.repository.findBy({ id: In(ids) as any });
  }

  async findById(id: string, include: (keyof T)[] = []): Promise<T> {
    const getElement = await this.repository.findOne({
      where: { id: id as any },
      relations: include as string[],
    });
    if (!getElement) {
      throw new D2MNotFoundException(`${this.getModelName()} with id ${id} not found`);
    }
    return getElement;
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: string, data: QueryDeepPartialEntity<T>): Promise<T | null> {
    const updated = await this.repository.update(id, data);
    if (updated.affected === 1) return this.findById(id);
    return null;
  }

  async delete(id: string | string[]): Promise<boolean> {
    const deleteResponse = await this.repository.softDelete(id);
    if (deleteResponse.affected === 0) {
      throw new D2MNotFoundException(`${this.getModelName()} with id ${id} not found`);
    }
    return true;
  }
}
