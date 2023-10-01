import { BaseEntity } from 'database/entities';
import { DeepPartial } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface IRepository<T extends BaseEntity> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: DeepPartial<T>): Promise<T>;
  update(id: string, data: QueryDeepPartialEntity<T>): Promise<T | null>;
  delete(id: string): Promise<void>;
}
