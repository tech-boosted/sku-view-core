import {Entity, model, property} from '@loopback/repository';

@model()
export class User extends Entity {
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

  @property({
    type: 'date',
  })
  created_on?: string;

  @property({
    type: 'string',
  })
  amazon_na_refresh_token?: string;

  @property({
    type: 'string',
  })
  amazon_na_access_token?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  amazon_na_connected?: boolean;

  @property({
    type: 'string',
  })
  amazon_na_status?: string;

  @property({
    type: 'string',
  })
  amazon_na_profile_id?: string;

  @property({
    type: 'string',
  })
  google_refresh_token?: string;

  @property({
    type: 'string',
  })
  google_access_token?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  google_connected?: boolean;

  @property({
    type: 'string',
  })
  google_status?: string;

  @property({
    type: 'string',
  })
  google_profile_id?: string;

  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  customer_id?: number;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
