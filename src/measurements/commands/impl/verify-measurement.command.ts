import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { VerifyMeasurementDto } from '../../dto/verify-measurement.dto';

export class VerifyMeasurementCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly id: string,
    public readonly payload: VerifyMeasurementDto,
  ) {}
}
