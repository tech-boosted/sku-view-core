import {Entity, model, property} from '@loopback/repository';

@model()
export class SkuView extends Entity {
  @property({
    type: 'number',
    generated: true,
    id: true,
    required: false,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  customerId: number;

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
    type: 'string',
  })
  platform?: string;

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
  })
  spend?: number;

  @property({
    type: 'number',
  })
  sales?: number;

  @property({
    type: 'number',
  })
  orders?: number;

  @property({
    type: 'number',
  })
  campaignId?: number;

  @property({
    type: 'string',
  })
  campaignName?: string;

  constructor(data?: Partial<SkuView>) {
    super(data);
  }
}

export interface SkuViewRelations {
  // describe navigational properties here
}

export type SkuViewWithRelations = SkuView & SkuViewRelations;
