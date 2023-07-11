import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    foreignKeys: {
      channels: {
        name: 'channels',
        foreignKey: 'customer_id',
        entityKey: 'id',
        entity: 'Channels',
      },
    },
  },
})
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  customer_id?: number;

  @property({
    type: 'date',
  })
  created_on?: string;

  @property({
    type: 'string',
    required: true,
  })
  firstname: string;

  @property({
    type: 'string',
  })
  lastname?: string;

  @property({
    type: 'string',
    required: true,
  })
  company: string;

  @property({
    type: 'string',
  })
  phone_number?: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
