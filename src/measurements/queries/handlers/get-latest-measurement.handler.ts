import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MeasurementsService } from '../../measurements.service';
import { GetLatestMeasurementQuery } from '../impl/get-latest-measurement.query';

@QueryHandler(GetLatestMeasurementQuery)
export class GetLatestMeasurementHandler
  implements IQueryHandler<GetLatestMeasurementQuery>
{
  constructor(private readonly measurementsService: MeasurementsService) {}

  async execute(query: GetLatestMeasurementQuery) {
    const data = await this.measurementsService.getLatestMeasurement({
      tenantId: query.currentUser.tenantId,
      ...query.filters,
    });

    return {
      success: true,
      data,
    };
  }
}
