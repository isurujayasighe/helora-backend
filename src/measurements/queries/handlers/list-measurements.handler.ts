import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MeasurementsService } from '../../measurements.service';
import { ListMeasurementsQuery } from '../impl/list-measurements.query';

@QueryHandler(ListMeasurementsQuery)
export class ListMeasurementsHandler
  implements IQueryHandler<ListMeasurementsQuery>
{
  constructor(private readonly measurementsService: MeasurementsService) {}

  async execute(query: ListMeasurementsQuery) {
    const data = await this.measurementsService.listMeasurements({
      tenantId: query.currentUser.tenantId,
      ...query.filters,
    });

    return {
      success: true,
      data,
    };
  }
}
