import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListOrdersDto {
  @ApiPropertyOptional({ example: 'Dinesha' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({ example: 'PENDING' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @ApiPropertyOptional({ example: '2026-04-21' })
  @IsOptional()
  @IsString()
  orderDate?: string;

  @ApiPropertyOptional({ example: '2026-04-28' })
  @IsOptional()
  @IsString()
  promisedDate?: string;

  @ApiPropertyOptional({ example: 'customer_cuid' })
  @IsOptional()
  @IsString()
  customerId?: string;
}
