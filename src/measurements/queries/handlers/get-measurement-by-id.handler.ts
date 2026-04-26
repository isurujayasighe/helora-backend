import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MeasurementsService } from '../../measurements.service';
import { GetMeasurementByIdQuery } from '../impl/get-measurement-by-id.query';

@QueryHandler(GetMeasurementByIdQuery)
export class GetMeasurementByIdHandler
  implements IQueryHandler<GetMeasurementByIdQuery>
{
  constructor(private readonly measurementsService: MeasurementsService) {}

  async execute(query: GetMeasurementByIdQuery) {
    const data = await this.measurementsService.getMeasurementById({
      id: query.id,
      tenantId: query.currentUser.tenantId,
    });

    return {
      success: true,
      data,
    };
  }
}
