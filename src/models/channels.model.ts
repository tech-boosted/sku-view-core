import {Entity, belongsTo, model, property} from '@loopback/repository';
import {User} from './user.model';

@model()
export class Channels extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @belongsTo(() => User, {keyTo: 'customer_id', name: 'customer'})
  customer_id: number;

  @property({
    type: 'string',
    default: '',
  })
  amazon_us_refresh_token?: string;

  @property({
    type: 'string',
    default: '',
  })
  amazon_us_access_token?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  amazon_us_connected?: boolean;

  @property({
    type: 'string',
  })
  amazon_us_profile_id?: string;

  @property({
    type: 'string',
  })
  amazon_us_profile_name?: string;

  @property({
    type: 'string',
    default: '',
  })
  amazon_uk_refresh_token?: string;

  @property({
    type: 'string',
    default: '',
  })
  amazon_uk_access_token?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  amazon_uk_connected?: boolean;

  @property({
    type: 'string',
  })
  amazon_uk_profile_id?: string;

  @property({
    type: 'string',
  })
  amazon_uk_profile_name?: string;

  @property({
    type: 'string',
    default: '',
  })
  amazon_ca_refresh_token?: string;

  @property({
    type: 'string',
    default: '',
  })
  amazon_ca_access_token?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  amazon_ca_connected?: boolean;

  @property({
    type: 'string',
  })
  amazon_ca_profile_id?: string;

  @property({
    type: 'string',
  })
  amazon_ca_profile_name?: string;

  @property({
    type: 'string',
    default: '',
  })
  amazon_ge_refresh_token?: string;

  @property({
    type: 'string',
    default: '',
  })
  amazon_ge_access_token?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  amazon_ge_connected?: boolean;

  @property({
    type: 'string',
  })
  amazon_ge_profile_id?: string;

  @property({
    type: 'string',
  })
  amazon_ge_profile_name?: string;

  @property({
    type: 'string',
    default: '',
  })
  amazon_fr_refresh_token?: string;

  @property({
    type: 'string',
    default: '',
  })
  amazon_fr_access_token?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  amazon_fr_connected?: boolean;

  @property({
    type: 'string',
  })
  amazon_fr_profile_id?: string;

  @property({
    type: 'string',
  })
  amazon_fr_profile_name?: string;

  @property({
    type: 'string',
    default: '',
  })
  amazon_it_refresh_token?: string;

  @property({
    type: 'string',
    default: '',
  })
  amazon_it_access_token?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  amazon_it_connected?: boolean;

  @property({
    type: 'string',
  })
  amazon_it_profile_id?: string;

  @property({
    type: 'string',
  })
  amazon_it_profile_name?: string;

  @property({
    type: 'string',
    default: '',
  })
  google_refresh_token?: string;

  @property({
    type: 'string',
    default: '',
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
  google_profile_id?: string;

  @property({
    type: 'string',
  })
  google_profile_name?: string;

  constructor(data?: Partial<Channels>) {
    super(data);
  }
}

export interface ChannelsRelations {
  // describe navigational properties here
}

export type ChannelsWithRelations = Channels & ChannelsRelations;
