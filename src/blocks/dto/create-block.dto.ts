import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBlockDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  town!: string;

  @IsString()
  @IsNotEmpty()
  blockNumber!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
