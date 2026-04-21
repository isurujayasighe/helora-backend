import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CategoriesService } from '../../categories.service';
import { GetCategoryByIdQuery } from '../impl/get-category-by-id.query';

@QueryHandler(GetCategoryByIdQuery)
export class GetCategoryByIdHandler implements IQueryHandler<GetCategoryByIdQuery> {
  constructor(private readonly categoriesService: CategoriesService) {}

  async execute(query: GetCategoryByIdQuery) {
    const category = await this.categoriesService.getCategoryById({
      id: query.id,
      tenantId: query.currentUser.tenantId,
    });

    return {
      success: true,
      data: category,
    };
  }
}
