import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CategoriesService } from '../../categories.service';
import { UpdateCategoryCommand } from '../impl/update-category.command';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
  constructor(private readonly categoriesService: CategoriesService) {}

  async execute(command: UpdateCategoryCommand) {
    const category = await this.categoriesService.updateCategory({
      id: command.id,
      tenantId: command.currentUser.tenantId,
      ...command.payload,
    });

    return {
      success: true,
      message: 'Category updated successfully',
      data: category,
    };
  }
}
