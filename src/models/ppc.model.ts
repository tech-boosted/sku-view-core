import {Entity, model, property} from '@loopback/repository';

@model()
export class Ppc extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;


  constructor(data?: Partial<Ppc>) {
    super(data);
  }
}

export interface PpcRelations {
  // describe navigational properties here
}

export type PpcWithRelations = Ppc & PpcRelations;
