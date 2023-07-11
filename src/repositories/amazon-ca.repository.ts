import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SkuviewDsDataSource} from '../datasources';
import {AmazonCA, AmazonCARelations} from '../models';

export class AmazonCARepository extends DefaultCrudRepository<
  AmazonCA,
  typeof AmazonCA.prototype.id,
  AmazonCARelations
> {
  constructor(
    @inject('datasources.skuviewDS') dataSource: SkuviewDsDataSource,
  ) {
    super(AmazonCA, dataSource);
  }
}
