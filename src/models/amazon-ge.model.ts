import {Entity, model, property} from '@loopback/repository';

@model()
export class AmazonGE extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  constructor(data?: Partial<AmazonGE>) {
    super(data);
  }
}

export interface AmazonGERelations {
  // describe navigational properties here
}

export type AmazonGEWithRelations = AmazonGE & AmazonGERelations;
