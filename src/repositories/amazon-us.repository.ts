import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SkuviewDsDataSource} from '../datasources';
import {AmazonUS, AmazonUSRelations} from '../models';

export class AmazonUSRepository extends DefaultCrudRepository<
  AmazonUS,
  typeof AmazonUS.prototype.id,
  AmazonUSRelations
> {
  constructor(
    @inject('datasources.skuviewDS') dataSource: SkuviewDsDataSource,
  ) {
    super(AmazonUS, dataSource);
  }
}
