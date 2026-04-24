import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBlockCustomerAssignmentDto } from './create-block.dto';

export class UpdateBlockCustomersDto {
  @ApiProperty({ type: [CreateBlockCustomerAssignmentDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBlockCustomerAssignmentDto)
  customers!: CreateBlockCustomerAssignmentDto[];
}