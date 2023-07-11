import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SkuviewDsDataSource} from '../datasources';
import {AmazonGE, AmazonGERelations} from '../models';

export class AmazonGERepository extends DefaultCrudRepository<
  AmazonGE,
  typeof AmazonGE.prototype.id,
  AmazonGERelations
> {
  constructor(
    @inject('datasources.skuviewDS') dataSource: SkuviewDsDataSource,
  ) {
    super(AmazonGE, dataSource);
  }
}
