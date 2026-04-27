import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceRecordSource, AttendanceRecordStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ManualAttendanceRecordDto {
  @ApiProperty()
  @IsString()
  employeeId!: string;

  @ApiProperty({ example: '2026-04-26T00:00:00.000Z' })
  @IsDateString()
  attendanceDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  firstIn?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  lastOut?: string | null;

  @ApiPropertyOptional({ enum: AttendanceRecordStatus })
  @IsOptional()
  @IsEnum(AttendanceRecordStatus)
  status?: AttendanceRecordStatus;

  @ApiPropertyOptional({ enum: AttendanceRecordSource })
  @IsOptional()
  @IsEnum(AttendanceRecordSource)
  source?: AttendanceRecordSource;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lateMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  overtimeMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expectedInTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expectedOutTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
