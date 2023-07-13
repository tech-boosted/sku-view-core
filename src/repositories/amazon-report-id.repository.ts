import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SkuviewDsDataSource} from '../datasources';
import {AmazonReportId, AmazonReportIdRelations} from '../models';

export class AmazonReportIdRepository extends DefaultCrudRepository<
  AmazonReportId,
  typeof AmazonReportId.prototype.id,
  AmazonReportIdRelations
> {
  constructor(
    @inject('datasources.skuviewDS') dataSource: SkuviewDsDataSource,
  ) {
    super(AmazonReportId, dataSource);
  }
}
