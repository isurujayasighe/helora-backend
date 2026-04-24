import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CategoriesService } from '../../categories.service';
import { CreateCategoryCommand } from '../impl/create-category.command';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(private readonly categoriesService: CategoriesService) {}

  async execute(command: CreateCategoryCommand) {
    const category = await this.categoriesService.createCategory({
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.userId,
      ...command.payload,
    });

    return {
      success: true,
      message: 'Category created successfully',
      data: category,
    };
  }
}
