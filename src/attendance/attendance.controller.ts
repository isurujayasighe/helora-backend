import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, Version } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { CurrentUserContext } from '../common/types/current-user-context.type';
import { CreateAttendanceDeviceCommand } from './commands/impl/create-attendance-device.command';
import { ImportAttendanceLogsCommand } from './commands/impl/import-attendance-logs.command';
import { ManualAttendanceRecordCommand } from './commands/impl/manual-attendance-record.command';
import { ProcessAttendanceCommand } from './commands/impl/process-attendance.command';
import { UpdateAttendanceDeviceCommand } from './commands/impl/update-attendance-device.command';
import { CreateAttendanceDeviceDto } from './dto/create-attendance-device.dto';
import { ImportAttendanceLogsDto } from './dto/import-attendance-logs.dto';
import { ListAttendanceDevicesDto } from './dto/list-attendance-devices.dto';
import { ListAttendanceLogsDto } from './dto/list-attendance-logs.dto';
import { ListAttendanceRecordsDto } from './dto/list-attendance-records.dto';
import { ManualAttendanceRecordDto } from './dto/manual-attendance-record.dto';
import { ProcessAttendanceDto } from './dto/process-attendance.dto';
import { UpdateAttendanceDeviceDto } from './dto/update-attendance-device.dto';
import { ListAttendanceDevicesQuery } from './queries/impl/list-attendance-devices.query';
import { ListAttendanceLogsQuery } from './queries/impl/list-attendance-logs.query';
import { ListAttendanceRecordsQuery } from './queries/impl/list-attendance-records.query';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Version('1')
  @Permissions('attendance-devices:create')
  @Post('devices')
  async createDevice(@CurrentUser() currentUser: CurrentUserContext, @Body() body: CreateAttendanceDeviceDto) {
    return this.commandBus.execute(new CreateAttendanceDeviceCommand(currentUser, body));
  }

  @Version('1')
  @Permissions('attendance-devices:read')
  @Get('devices')
  async listDevices(@CurrentUser() currentUser: CurrentUserContext, @Query() query: ListAttendanceDevicesDto) {
    return this.queryBus.execute(new ListAttendanceDevicesQuery(currentUser, query));
  }

  @Version('1')
  @Permissions('attendance-devices:update')
  @Patch('devices/:id')
  async updateDevice(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('id') id: string,
    @Body() body: UpdateAttendanceDeviceDto,
  ) {
    return this.commandBus.execute(new UpdateAttendanceDeviceCommand(currentUser, id, body));
  }

  @Version('1')
  @Permissions('attendance:create')
  @Post('logs/import')
  async importLogs(@CurrentUser() currentUser: CurrentUserContext, @Body() body: ImportAttendanceLogsDto) {
    return this.commandBus.execute(new ImportAttendanceLogsCommand(currentUser, body));
  }

  @Version('1')
  @Permissions('attendance:read')
  @Get('logs')
  async listLogs(@CurrentUser() currentUser: CurrentUserContext, @Query() query: ListAttendanceLogsDto) {
    return this.queryBus.execute(new ListAttendanceLogsQuery(currentUser, query));
  }

  @Version('1')
  @Permissions('attendance:read')
  @Get('records')
  async listRecords(@CurrentUser() currentUser: CurrentUserContext, @Query() query: ListAttendanceRecordsDto) {
    return this.queryBus.execute(new ListAttendanceRecordsQuery(currentUser, query));
  }

  @Version('1')
  @Permissions('attendance:update')
  @Post('records/manual')
  async manualRecord(@CurrentUser() currentUser: CurrentUserContext, @Body() body: ManualAttendanceRecordDto) {
    return this.commandBus.execute(new ManualAttendanceRecordCommand(currentUser, body));
  }

  @Version('1')
  @Permissions('attendance:update')
  @Post('process')
  async processDate(@CurrentUser() currentUser: CurrentUserContext, @Body() body: ProcessAttendanceDto) {
    return this.commandBus.execute(new ProcessAttendanceCommand(currentUser, body));
  }
}
