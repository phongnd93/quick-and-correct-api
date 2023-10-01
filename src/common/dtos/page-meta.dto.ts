import { PageOptionsDto } from './page-options.dto';

export interface PageMetaDtoParameters {
  pageOptionsDto: PageOptionsDto;
  itemCount: number;
}

export class PageMetaDto {
  constructor({ pageOptionsDto, itemCount }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page || 0;
    this.take = pageOptionsDto.take || 10;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }

  page: number;

  take: number;

  itemCount: number;

  pageCount: number;

  hasPreviousPage: boolean;

  hasNextPage: boolean;
}
