import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { ListBlocksDto } from '../../dto/list-blocks.dto';

export class ListBlocksQuery {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly filters: ListBlocksDto,
  ) {}
}
