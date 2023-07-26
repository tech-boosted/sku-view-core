import {Entity, model, property} from '@loopback/repository';

@model()
export class Catalog extends Entity {
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
    required: false,
  })
  customer_id?: number;

  @property({
    type: 'string',
    required: false,
  })
  sku?: string;

  @property({
    type: 'string',
    required: false,
  })
  title?: string;

  @property({
    type: 'number',
    mysql: {
      columnName: 'cogs',
      dataType: 'float',
      precision: 10,
      scale: 2,
    },
  })
  cogs?: number;

  @property({
    type: 'number',
    mysql: {
      columnName: 'delivery_cost',
      dataType: 'float',
      precision: 10,
      scale: 2,
    },
  })
  delivery_cost?: number;

  @property({
    type: 'number',
    mysql: {
      columnName: 'referral_marketing_fees',
      dataType: 'float',
      precision: 10,
      scale: 2,
    },
  })
  referral_marketing_fees?: number;

  @property({
    type: 'number',
    mysql: {
      columnName: 'storage_fees',
      dataType: 'float',
      precision: 10,
      scale: 2,
    },
  })
  storage_fees?: number;

  @property({
    type: 'number',
    mysql: {
      columnName: 'selling_price',
      dataType: 'float',
      precision: 10,
      scale: 2,
    },
  })
  selling_price?: number;

  constructor(data?: Partial<Catalog>) {
    super(data);
  }
}

export interface CatalogRelations {
  // describe navigational properties here
}

export type CatalogWithRelations = Catalog & CatalogRelations;
