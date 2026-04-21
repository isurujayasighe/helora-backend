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
import { CreateCategoryCommand } from './commands/impl/create-category.command';
import { DeleteCategoryCommand } from './commands/impl/delete-category.command';
import { UpdateCategoryCommand } from './commands/impl/update-category.command';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesDto } from './dto/list-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetCategoryByIdQuery } from './queries/impl/get-category-by-id.query';
import { ListCategoriesQuery } from './queries/impl/list-categories.query';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Version('1')
  @Permissions('categories:create')
  @Post()
  async create(@CurrentUser() currentUser: CurrentUserContext, @Body() body: CreateCategoryDto) {
    return this.commandBus.execute(new CreateCategoryCommand(currentUser, body));
  }

  @Version('1')
  @Permissions('categories:read')
  @Get()
  async list(@CurrentUser() currentUser: CurrentUserContext, @Query() query: ListCategoriesDto) {
    return this.queryBus.execute(new ListCategoriesQuery(currentUser, query));
  }

  @Version('1')
  @Permissions('categories:read')
  @Get(':id')
  async getById(@CurrentUser() currentUser: CurrentUserContext, @Param('id') id: string) {
    return this.queryBus.execute(new GetCategoryByIdQuery(currentUser, id));
  }

  @Version('1')
  @Permissions('categories:update')
  @Patch(':id')
  async update(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.commandBus.execute(new UpdateCategoryCommand(currentUser, id, body));
  }

  @Version('1')
  @Permissions('categories:delete')
  @Delete(':id')
  async remove(@CurrentUser() currentUser: CurrentUserContext, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteCategoryCommand(currentUser, id));
  }
}
