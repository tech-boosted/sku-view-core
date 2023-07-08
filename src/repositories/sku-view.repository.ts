import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SkuviewDsDataSource} from '../datasources';
import {SkuView, SkuViewRelations} from '../models';

export class SkuViewRepository extends DefaultCrudRepository<
  SkuView,
  typeof SkuView.prototype.id,
  SkuViewRelations
> {
  constructor(
    @inject('datasources.skuviewDS') dataSource: SkuviewDsDataSource,
  ) {
    super(SkuView, dataSource);
  }
}
