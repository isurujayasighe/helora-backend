import { PartialType } from '@nestjs/swagger';
import { CreateAttendanceDeviceDto } from './create-attendance-device.dto';

export class UpdateAttendanceDeviceDto extends PartialType(CreateAttendanceDeviceDto) {}
