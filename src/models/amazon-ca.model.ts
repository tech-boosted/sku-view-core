import {Entity, model, property} from '@loopback/repository';

@model()
export class AmazonCA extends Entity {
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
    type: 'number',
    required: true,
  })
  profileId: number;

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

  constructor(data?: Partial<AmazonCA>) {
    super(data);
  }
}

export interface AmazonCARelations {
  // describe navigational properties here
}

export type AmazonCAWithRelations = AmazonCA & AmazonCARelations;
