import {Entity, model, property} from '@loopback/repository';

@model()
export class Dashboard extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;


  constructor(data?: Partial<Dashboard>) {
    super(data);
  }
}

export interface DashboardRelations {
  // describe navigational properties here
}

export type DashboardWithRelations = Dashboard & DashboardRelations;
