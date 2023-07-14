import {Entity, model, property} from '@loopback/repository';

@model()
export class AmazonDatesMetaData extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  customer_id?: number;

  @property({
    type: 'string',
  })
  marketplace?: string;

  @property({
    type: 'date',
  })
  start_date?: string;

  @property({
    type: 'date',
  })
  end_date?: string;

  constructor(data?: Partial<AmazonDatesMetaData>) {
    super(data);
  }
}

export interface AmazonDatesMetaDataRelations {
  // describe navigational properties here
}

export type AmazonDatesMetaDataWithRelations = AmazonDatesMetaData &
  AmazonDatesMetaDataRelations;
