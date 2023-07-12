import {inject} from '@loopback/core';
import {DefaultTransactionalRepository} from '@loopback/repository';
import {SkuviewDsDataSource} from '../datasources';
import {Channels, ChannelsRelations} from '../models';

export class ChannelsRepository extends DefaultTransactionalRepository<
  Channels,
  typeof Channels.prototype.customer_id,
  ChannelsRelations
> {
  constructor(
    @inject('datasources.skuviewDS') dataSource: SkuviewDsDataSource,
  ) {
    super(Channels, dataSource);
  }
}
