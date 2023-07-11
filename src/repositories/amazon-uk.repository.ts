import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SkuviewDsDataSource} from '../datasources';
import {AmazonUK, AmazonUKRelations} from '../models';

export class AmazonUKRepository extends DefaultCrudRepository<
  AmazonUK,
  typeof AmazonUK.prototype.id,
  AmazonUKRelations
> {
  constructor(
    @inject('datasources.skuviewDS') dataSource: SkuviewDsDataSource,
  ) {
    super(AmazonUK, dataSource);
  }
}
