import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBlockCustomerDto } from './create-block.dto';

export class UpdateBlockCustomersDto {
  @ApiProperty({ type: [CreateBlockCustomerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBlockCustomerDto)
  customers!: CreateBlockCustomerDto[];
}