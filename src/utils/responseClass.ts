import { ApiProperty } from '@nestjs/swagger';
import { IPaginationLinks, IPaginationMeta } from 'nestjs-typeorm-paginate';

export abstract class TransformResponse<T> {
  abstract get data(): T | T[];
  @ApiProperty({ description: 'Response status code', example: 200 })
  readonly statusCode: number;
  @ApiProperty({
    description: 'Response message',
    default: 'Ok',
    example: 'Ok',
  })
  readonly message: string;
}

export abstract class TransformCreatedResponse<T> {
  abstract get data(): T | T[];
  @ApiProperty({ description: 'Response status code', example: 201 })
  readonly statusCode: number;
  @ApiProperty({
    description: 'Response message',
    default: 'Created',
    example: 'Created',
  })
  readonly message: string;
}

abstract class PaginationMeta implements IPaginationMeta {
  @ApiProperty({
    description: 'Amount of items on this specific page',
    example: 10,
  })
  readonly itemCount: number;
  @ApiProperty({ description: 'Total amount of items', example: 20 })
  readonly totalItems: number;
  @ApiProperty({
    description: 'Amount of items that were requested per page',
    default: 10,
    example: 10,
  })
  readonly itemsPerPage: number;
  @ApiProperty({
    description: 'Total amount of pages in this paginator',
    example: 2,
  })
  readonly totalPages: number;
  @ApiProperty({
    description: 'Current page this paginator "points" to',
    example: 1,
  })
  readonly currentPage: number;
}

abstract class PaginationLinks implements IPaginationLinks {
  @ApiProperty({
    description: 'A link to the "first" page',
    default: '',
    example: '/site/info?limit=10',
  })
  readonly first: string;
  @ApiProperty({
    description: 'A link to the "previous" page',
    default: '',
    example: '',
  })
  readonly previous: string;
  @ApiProperty({
    description: 'A link to the "next" page',
    default: '',
    example: '/site/info?page=2&limit=10',
  })
  readonly next: string;
  @ApiProperty({
    description: 'A link to the "last" page',
    default: '',
    example: '/site/info?page=2&limit=10',
  })
  readonly last: string;
}

export abstract class PaginationResponse<T> {
  abstract get items(): T[];
  @ApiProperty({ type: PaginationMeta })
  readonly meta: PaginationMeta;
  @ApiProperty({ type: PaginationLinks })
  readonly links: PaginationLinks;
}
