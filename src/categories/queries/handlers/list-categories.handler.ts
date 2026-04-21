import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CategoriesService } from '../../categories.service';
import { ListCategoriesQuery } from '../impl/list-categories.query';

@QueryHandler(ListCategoriesQuery)
export class ListCategoriesHandler implements IQueryHandler<ListCategoriesQuery> {
  constructor(private readonly categoriesService: CategoriesService) {}

  async execute(query: ListCategoriesQuery) {
    const categories = await this.categoriesService.listCategories({
      tenantId: query.currentUser.tenantId,
      ...query.filters,
    });

    return {
      success: true,
      data: categories,
    };
  }
}
