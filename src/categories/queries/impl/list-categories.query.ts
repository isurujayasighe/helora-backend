import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { ListCategoriesDto } from '../../dto/list-categories.dto';

export class ListCategoriesQuery {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly filters: ListCategoriesDto,
  ) {}
}
