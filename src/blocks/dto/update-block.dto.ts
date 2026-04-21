import { IsOptional, IsString } from 'class-validator';

export class UpdateBlockDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  town?: string;

  @IsOptional()
  @IsString()
  blockNumber?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
