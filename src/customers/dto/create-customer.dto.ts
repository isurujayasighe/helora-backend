import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Dinesha Shamali' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  fullName!: string;

  @ApiPropertyOptional({ example: '0718370292' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '0771234567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  alternatePhone?: string;

  @ApiPropertyOptional({ example: 'Pasgoda' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  town?: string;

  @ApiPropertyOptional({ example: 'No 12, Main Street' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: 'VIP customer' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
