import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SkuviewDsDataSource} from '../datasources';
import {AmazonDatesMetaData, AmazonDatesMetaDataRelations} from '../models';

export class AmazonDatesMetaDataRepository extends DefaultCrudRepository<
  AmazonDatesMetaData,
  typeof AmazonDatesMetaData.prototype.id,
  AmazonDatesMetaDataRelations
> {
  constructor(
    @inject('datasources.skuviewDS') dataSource: SkuviewDsDataSource,
  ) {
    super(AmazonDatesMetaData, dataSource);
  }
}
