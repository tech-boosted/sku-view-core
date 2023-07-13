import {Entity, model, property} from '@loopback/repository';

@model()
export class AmazonReportId extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
  })
  customer_id?: number;

  @property({
    type: 'string',
  })
  platform?: string;

  @property({
    type: 'date',
  })
  start_date?: string;

  @property({
    type: 'date',
  })
  end_date?: string;

  @property({
    type: 'string',
  })
  report_id?: string;

  @property({
    type: 'string',
  })
  status?: string;

  constructor(data?: Partial<AmazonReportId>) {
    super(data);
  }
}

export interface AmazonReportIdRelations {
  // describe navigational properties here
}

export type AmazonReportIdWithRelations = AmazonReportId &
  AmazonReportIdRelations;
