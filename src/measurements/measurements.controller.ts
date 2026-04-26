import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { CurrentUserContext } from '../common/types/current-user-context.type';

import { CreateMeasurementFieldDto } from './dto/create-measurement-field.dto';
import { UpdateMeasurementFieldDto } from './dto/update-measurement-field.dto';
import { ListMeasurementFieldsDto } from './dto/list-measurement-fields.dto';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';
import { ListMeasurementsDto } from './dto/list-measurements.dto';
import { LatestMeasurementDto } from './dto/latest-measurement.dto';
import { VerifyMeasurementDto } from './dto/verify-measurement.dto';

import { CreateMeasurementFieldCommand } from './commands/impl/create-measurement-field.command';
import { UpdateMeasurementFieldCommand } from './commands/impl/update-measurement-field.command';
import { CreateMeasurementCommand } from './commands/impl/create-measurement.command';
import { UpdateMeasurementCommand } from './commands/impl/update-measurement.command';
import { VerifyMeasurementCommand } from './commands/impl/verify-measurement.command';
import { DeleteMeasurementCommand } from './commands/impl/delete-measurement.command';

import { ListMeasurementFieldsQuery } from './queries/impl/list-measurement-fields.query';
import { ListMeasurementsQuery } from './queries/impl/list-measurements.query';
import { GetMeasurementByIdQuery } from './queries/impl/get-measurement-by-id.query';
import { GetLatestMeasurementQuery } from './queries/impl/get-latest-measurement.query';

@ApiTags('Measurements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class MeasurementsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Version('1')
  @Permissions('measurements:create')
  @Post('measurement-fields')
  async createField(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateMeasurementFieldDto,
  ) {
    return this.commandBus.execute(
      new CreateMeasurementFieldCommand(currentUser, body),
    );
  }

  @Version('1')
  @Permissions('measurements:read')
  @Get('measurement-fields')
  async listFields(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListMeasurementFieldsDto,
  ) {
    return this.queryBus.execute(
      new ListMeasurementFieldsQuery(currentUser, query),
    );
  }

  @Version('1')
  @Permissions('measurements:update')
  @Patch('measurement-fields/:id')
  async updateField(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('id') id: string,
    @Body() body: UpdateMeasurementFieldDto,
  ) {
    return this.commandBus.execute(
      new UpdateMeasurementFieldCommand(currentUser, id, body),
    );
  }

  @Version('1')
  @Permissions('measurements:create')
  @Post('measurements')
  async createMeasurement(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateMeasurementDto,
  ) {
    return this.commandBus.execute(
      new CreateMeasurementCommand(currentUser, body),
    );
  }

  @Version('1')
  @Permissions('measurements:read')
  @Get('measurements/latest')
  async latestMeasurement(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: LatestMeasurementDto,
  ) {
    return this.queryBus.execute(
      new GetLatestMeasurementQuery(currentUser, query),
    );
  }

  @Version('1')
  @Permissions('measurements:read')
  @Get('measurements')
  async listMeasurements(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListMeasurementsDto,
  ) {
    return this.queryBus.execute(new ListMeasurementsQuery(currentUser, query));
  }

  @Version('1')
  @Permissions('measurements:read')
  @Get('measurements/:id')
  async getMeasurementById(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('id') id: string,
  ) {
    return this.queryBus.execute(new GetMeasurementByIdQuery(currentUser, id));
  }

  @Version('1')
  @Permissions('measurements:update')
  @Patch('measurements/:id')
  async updateMeasurement(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('id') id: string,
    @Body() body: UpdateMeasurementDto,
  ) {
    return this.commandBus.execute(
      new UpdateMeasurementCommand(currentUser, id, body),
    );
  }

  @Version('1')
  @Permissions('measurements:update')
  @Patch('measurements/:id/verify')
  async verifyMeasurement(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('id') id: string,
    @Body() body: VerifyMeasurementDto,
  ) {
    return this.commandBus.execute(
      new VerifyMeasurementCommand(currentUser, id, body),
    );
  }

  @Version('1')
  @Permissions('measurements:delete')
  @Delete('measurements/:id')
  async deleteMeasurement(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('id') id: string,
  ) {
    return this.commandBus.execute(new DeleteMeasurementCommand(currentUser, id));
  }
}
