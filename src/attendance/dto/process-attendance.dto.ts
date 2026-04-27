import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class ProcessAttendanceDto {
  @ApiProperty({ example: '2026-04-26T00:00:00.000Z' })
  @IsDateString()
  attendanceDate!: string;
}
