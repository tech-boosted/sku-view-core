import {Entity, model, property} from '@loopback/repository';

@model()
export class AmazonUS extends Entity {
  @property({
    type: 'number',
    generated: true,
    id: true,
    required: false,
    mysql: {
      dataType: 'bigint',
    },
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  customer_id: number;

  @property({
    type: 'string',
    required: true,
  })
  profileId: string;

  @property({
    type: 'string',
    required: true,
  })
  sku: string;

  @property({
    type: 'string',
  })
  date?: string;

  @property({
    type: 'number',
  })
  impressions?: number;

  @property({
    type: 'number',
  })
  clicks?: number;

  @property({
    type: 'number',
    mysql: {
      columnName: 'spend',
      dataType: 'float',
      precision: 10,
      scale: 2,
    },
  })
  spend?: number;

  @property({
    type: 'number',
    mysql: {
      columnName: 'sales',
      dataType: 'float',
      precision: 10,
      scale: 2,
    },
  })
  sales?: number;

  @property({
    type: 'number',
  })
  orders?: number;

  @property({
    type: 'number',
    mysql: {
      dataType: 'bigint',
    },
  })
  campaignId?: number;

  @property({
    type: 'string',
  })
  campaignName?: string;

  constructor(data?: Partial<AmazonUS>) {
    super(data);
  }
}

export interface AmazonUSRelations {
  // describe navigational properties here
}

export type AmazonUSWithRelations = AmazonUS & AmazonUSRelations;
