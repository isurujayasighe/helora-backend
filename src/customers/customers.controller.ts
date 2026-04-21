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
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentUserContext } from '../common/types/current-user-context.type';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ListCustomersDto } from './dto/list-customers.dto';
import { CreateCustomerCommand } from './commands/impl/create-customer.command';
import { UpdateCustomerCommand } from './commands/impl/update-customer.command';
import { DeleteCustomerCommand } from './commands/impl/delete-customer.command';
import { ListCustomersQuery } from './queries/impl/list-customers.query';
import { GetCustomerByIdQuery } from './queries/impl/get-customer-by-id.query';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Version('1')
  @Permissions('customers:create')
  @Post()
  async create(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateCustomerDto,
  ) {
    return this.commandBus.execute(new CreateCustomerCommand(currentUser, body));
  }

  @Version('1')
  @Permissions('customers:read')
  @Get()
  async list(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListCustomersDto,
  ) {
    return this.queryBus.execute(new ListCustomersQuery(currentUser, query));
  }

  @Version('1')
  @Permissions('customers:read')
  @Get(':id')
  async getById(@CurrentUser() currentUser: CurrentUserContext, @Param('id') id: string) {
    return this.queryBus.execute(new GetCustomerByIdQuery(currentUser, id));
  }

  @Version('1')
  @Permissions('customers:update')
  @Patch(':id')
  async update(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('id') id: string,
    @Body() body: UpdateCustomerDto,
  ) {
    return this.commandBus.execute(new UpdateCustomerCommand(currentUser, id, body));
  }

  @Version('1')
  @Permissions('customers:delete')
  @Delete(':id')
  async remove(@CurrentUser() currentUser: CurrentUserContext, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteCustomerCommand(currentUser, id));
  }
}
