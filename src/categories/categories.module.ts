import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryHandler } from './commands/handlers/create-category.handler';
import { UpdateCategoryHandler } from './commands/handlers/update-category.handler';
import { DeleteCategoryHandler } from './commands/handlers/delete-category.handler';
import { ListCategoriesHandler } from './queries/handlers/list-categories.handler';
import { GetCategoryByIdHandler } from './queries/handlers/get-category-by-id.handler';

const commandHandlers = [CreateCategoryHandler, UpdateCategoryHandler, DeleteCategoryHandler];
const queryHandlers = [ListCategoriesHandler, GetCategoryByIdHandler];

@Module({
  imports: [CqrsModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, ...commandHandlers, ...queryHandlers],
  exports: [CategoriesService],
})
export class CategoriesModule {}
