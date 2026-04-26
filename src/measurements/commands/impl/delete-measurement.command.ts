import { CurrentUserContext } from '../../../common/types/current-user-context.type';

export class DeleteMeasurementCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly id: string,
  ) {}
}
