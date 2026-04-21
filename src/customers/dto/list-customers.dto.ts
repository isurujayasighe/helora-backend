import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListCustomersDto {
  @ApiPropertyOptional({ example: 'Dinesha' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({ example: 'Pasgoda' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  town?: string;
}
