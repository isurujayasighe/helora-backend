import { UpdateBlockCustomersDto } from 'src/blocks/dto/update-block-customer-dto';
import { CurrentUserContext } from '../../../common/types/current-user-context.type';

export class UpdateBlockCustomersCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly blockId: string,
    public readonly dto: UpdateBlockCustomersDto,
  ) {}
}