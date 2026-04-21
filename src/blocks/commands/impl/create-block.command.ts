import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { CreateBlockDto } from '../../dto/create-block.dto';

export class CreateBlockCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly payload: CreateBlockDto,
  ) {}
}
