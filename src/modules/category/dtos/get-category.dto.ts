import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CategoryResponseDto {
  @Expose()
  id: string;

  @Expose()
  description: string;

  @Expose()
  priority: number;

  @Expose()
  numlimit: number;

  @Expose()
  active: boolean;
}
