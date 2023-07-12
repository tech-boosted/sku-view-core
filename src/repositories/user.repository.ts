import {inject} from '@loopback/core';
import {DefaultTransactionalRepository} from '@loopback/repository';
import {SkuviewDsDataSource} from '../datasources';
import {User, UserRelations} from '../models';

export class UserRepository extends DefaultTransactionalRepository<
  User,
  typeof User.prototype.customer_id,
  UserRelations
> {
  constructor(
    @inject('datasources.skuviewDS') dataSource: SkuviewDsDataSource,
  ) {
    super(User, dataSource);
  }
}
