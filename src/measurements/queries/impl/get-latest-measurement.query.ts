import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { LatestMeasurementDto } from '../../dto/latest-measurement.dto';

export class GetLatestMeasurementQuery {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly filters: LatestMeasurementDto,
  ) {}
}
