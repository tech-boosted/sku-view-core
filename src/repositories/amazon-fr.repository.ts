import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SkuviewDsDataSource} from '../datasources';
import {AmazonFR, AmazonFRRelations} from '../models';

export class AmazonFRRepository extends DefaultCrudRepository<
  AmazonFR,
  typeof AmazonFR.prototype.id,
  AmazonFRRelations
> {
  constructor(
    @inject('datasources.skuviewDS') dataSource: SkuviewDsDataSource,
  ) {
    super(AmazonFR, dataSource);
  }
}
