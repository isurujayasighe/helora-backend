import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MeasurementsService } from '../../measurements.service';
import { ListMeasurementFieldsQuery } from '../impl/list-measurement-fields.query';

@QueryHandler(ListMeasurementFieldsQuery)
export class ListMeasurementFieldsHandler
  implements IQueryHandler<ListMeasurementFieldsQuery>
{
  constructor(private readonly measurementsService: MeasurementsService) {}

  async execute(query: ListMeasurementFieldsQuery) {
    const data = await this.measurementsService.listMeasurementFields({
      tenantId: query.currentUser.tenantId,
      ...query.filters,
    });

    return {
      success: true,
      data,
    };
  }
}
