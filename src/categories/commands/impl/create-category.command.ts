import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { CreateCategoryDto } from '../../dto/create-category.dto';

export class CreateCategoryCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly payload: CreateCategoryDto,
  ) {}
}
