import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { SortDirection } from 'database/enums';

export class PageOptionsDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({ enum: SortDirection, default: SortDirection.DESC })
  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection: SortDirection = SortDirection.DESC;

  @ApiPropertyOptional({ default: 'created_at' })
  @IsOptional()
  sort: string = 'created_at';

  @ApiPropertyOptional({
    minimum: 0,
    default: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  readonly page?: number = 0;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  readonly take?: number = 10;

  get skip(): number {
    return (this.page || 0) * (this.take || 10);
  }
}
