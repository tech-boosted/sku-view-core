import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SkuviewDsDataSource} from '../datasources';
import {Channels, ChannelsRelations} from '../models';

export class ChannelsRepository extends DefaultCrudRepository<
  Channels,
  typeof Channels.prototype.id,
  ChannelsRelations
> {
  constructor(
    @inject('datasources.skuviewDS') dataSource: SkuviewDsDataSource,
  ) {
    super(Channels, dataSource);
  }
}
