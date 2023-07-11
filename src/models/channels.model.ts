import {Entity, model, property} from '@loopback/repository';

@model()
export class Channels extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  amazon_us_refresh_token?: string;

  @property({
    type: 'string',
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
  amazon_uk_refresh_token?: string;

  @property({
    type: 'string',
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
  amazon_ca_refresh_token?: string;

  @property({
    type: 'string',
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
  google_profile_id?: string;

  constructor(data?: Partial<Channels>) {
    super(data);
  }
}

export interface ChannelsRelations {
  // describe navigational properties here
}

export type ChannelsWithRelations = Channels & ChannelsRelations;
