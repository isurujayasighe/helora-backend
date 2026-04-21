import { IsOptional, IsString } from 'class-validator';

export class ListBlocksDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
