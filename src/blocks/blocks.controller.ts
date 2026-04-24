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
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { Permissions } from "../common/decorators/permissions.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CurrentUserContext } from "../common/types/current-user-context.type";
import { CreateBlockDto } from "./dto/create-block.dto";
import { UpdateBlockDto } from "./dto/update-block.dto";
import { ListBlocksDto } from "./dto/list-blocks.dto";
import { CreateBlockCommand } from "./commands/impl/create-block.command";
import { UpdateBlockCommand } from "./commands/impl/update-block.command";
import { DeleteBlockCommand } from "./commands/impl/delete-block.command";
import { ListBlocksQuery } from "./queries/impl/list-blocks.query";
import { GetBlockByIdQuery } from "./queries/impl/get-block-by-id.query";
import { UpdateBlockCustomersDto } from "./dto/update-block-customer-dto";
import { UpdateBlockCustomersCommand } from "./commands/impl/update-block-customer-command";

@ApiTags("Blocks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("blocks")
export class BlocksController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createBlock(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() dto: CreateBlockDto,
  ) {
    return this.commandBus.execute(new CreateBlockCommand(currentUser, dto));
  }

  @Version("1")
  @Permissions("blocks:read")
  @Get()
  async list(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListBlocksDto,
  ) {
    return this.queryBus.execute(new ListBlocksQuery(currentUser, query));
  }

  @Version("1")
  @Permissions("blocks:read")
  @Get(":id")
  async getById(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("id") id: string,
  ) {
    return this.queryBus.execute(new GetBlockByIdQuery(currentUser, id));
  }

  @Version("1")
  @Permissions("blocks:update")
  @Patch(":id")
  async update(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("id") id: string,
    @Body() body: UpdateBlockDto,
  ) {
    return this.commandBus.execute(
      new UpdateBlockCommand(currentUser, id, body),
    );
  }

  @Patch(":id/customers")
  async updateBlockCustomers(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() dto: UpdateBlockCustomersDto,
  ) {
    return this.commandBus.execute(
      new UpdateBlockCustomersCommand(currentUser, id, dto),
    );
  }

  @Version("1")
  @Permissions("blocks:delete")
  @Delete(":id")
  async remove(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("id") id: string,
  ) {
    return this.commandBus.execute(new DeleteBlockCommand(currentUser, id));
  }
}
