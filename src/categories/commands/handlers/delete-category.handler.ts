import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CategoriesService } from '../../categories.service';
import { DeleteCategoryCommand } from '../impl/delete-category.command';

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand> {
  constructor(private readonly categoriesService: CategoriesService) {}

  async execute(command: DeleteCategoryCommand) {
    await this.categoriesService.deleteCategory({
      id: command.id,
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.userId,
    });

    return {
      success: true,
      message: 'Category deleted successfully',
    };
  }
}
