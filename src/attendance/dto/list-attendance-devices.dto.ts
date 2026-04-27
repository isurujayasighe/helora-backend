import { ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceDeviceType, AttendanceSyncMode } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListAttendanceDevicesDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional({ example: 'Main Shop' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: AttendanceDeviceType })
  @IsOptional()
  @IsEnum(AttendanceDeviceType)
  deviceType?: AttendanceDeviceType;

  @ApiPropertyOptional({ enum: AttendanceSyncMode })
  @IsOptional()
  @IsEnum(AttendanceSyncMode)
  syncMode?: AttendanceSyncMode;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isActive?: boolean;
}
