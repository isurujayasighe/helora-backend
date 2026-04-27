import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceDeviceType, AttendanceSyncMode } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateAttendanceDeviceDto {
  @ApiProperty({ example: 'Main Shop Fingerprint Scanner' })
  @IsString()
  @MaxLength(200)
  deviceName!: string;

  @ApiProperty({ example: 'FP-HEAD-OFFICE-01' })
  @IsString()
  @MaxLength(100)
  deviceCode!: string;

  @ApiPropertyOptional({ example: AttendanceDeviceType.FINGERPRINT, enum: AttendanceDeviceType })
  @IsOptional()
  @IsEnum(AttendanceDeviceType)
  deviceType?: AttendanceDeviceType;

  @ApiPropertyOptional({ example: AttendanceSyncMode.MANUAL, enum: AttendanceSyncMode })
  @IsOptional()
  @IsEnum(AttendanceSyncMode)
  syncMode?: AttendanceSyncMode;

  @ApiPropertyOptional({ example: 'FP-DEMO-0001' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  serialNumber?: string;

  @ApiPropertyOptional({ example: '192.168.1.120' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ipAddress?: string;

  @ApiPropertyOptional({ example: 4370 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  port?: number;

  @ApiPropertyOptional({ example: 'Main Shop Entrance' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'Device note' })
  @IsOptional()
  @IsString()
  notes?: string;
}
