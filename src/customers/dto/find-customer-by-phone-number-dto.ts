import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class FindCustomerByPhoneDto {
  @ApiProperty({ example: '0718370292' })
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  phoneNumber!: string;
}