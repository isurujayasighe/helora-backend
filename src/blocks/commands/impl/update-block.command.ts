import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { UpdateBlockDto } from '../../dto/update-block.dto';

export class UpdateBlockCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly id: string,
    public readonly payload: UpdateBlockDto,
  ) {}
}
