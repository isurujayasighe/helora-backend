import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListCategoriesDto {
  @ApiPropertyOptional({ example: 'Uni' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
