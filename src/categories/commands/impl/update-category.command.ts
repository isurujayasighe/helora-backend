import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { UpdateCategoryDto } from '../../dto/update-category.dto';

export class UpdateCategoryCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly id: string,
    public readonly payload: UpdateCategoryDto,
  ) {}
}
