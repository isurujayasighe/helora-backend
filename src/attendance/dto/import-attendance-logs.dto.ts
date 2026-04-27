import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendancePunchType, AttendanceVerifyMode } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class AttendanceLogInputDto {
  @ApiPropertyOptional({ example: 'employee_cuid' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ example: '101' })
  @IsString()
  @MaxLength(100)
  biometricUserId!: string;

  @ApiProperty({ example: '2026-04-26T03:35:00.000Z' })
  @IsDateString()
  punchTime!: string;

  @ApiPropertyOptional({ enum: AttendancePunchType, example: AttendancePunchType.CHECK_IN })
  @IsOptional()
  @IsEnum(AttendancePunchType)
  punchType?: AttendancePunchType;

  @ApiPropertyOptional({ enum: AttendanceVerifyMode, example: AttendanceVerifyMode.FINGERPRINT })
  @IsOptional()
  @IsEnum(AttendanceVerifyMode)
  verifyMode?: AttendanceVerifyMode;

  @ApiPropertyOptional({ example: { source: 'device' } })
  @IsOptional()
  @IsObject()
  rawPayload?: Record<string, unknown>;
}

export class ImportAttendanceLogsDto {
  @ApiPropertyOptional({ example: 'device_cuid' })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiProperty({ type: [AttendanceLogInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceLogInputDto)
  logs!: AttendanceLogInputDto[];
}
