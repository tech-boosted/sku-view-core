import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SkuviewDsDataSource} from '../datasources';
import {AmazonIT, AmazonITRelations} from '../models';

export class AmazonITRepository extends DefaultCrudRepository<
  AmazonIT,
  typeof AmazonIT.prototype.id,
  AmazonITRelations
> {
  constructor(
    @inject('datasources.skuviewDS') dataSource: SkuviewDsDataSource,
  ) {
    super(AmazonIT, dataSource);
  }
}
