import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'skuviewDS',
  connector: 'mysql',
  // url: process.env.MYSQL_URI,
  url: 'mysql://admin:adminacros@acros-test-db-instance-1.cbjmo0koiyrt.us-east-2.rds.amazonaws.com/acrosDB',
  host: 'acros-test-db-instance-1.cbjmo0koiyrt.us-east-2.rds.amazonaws.com',
  port: 3306,
  user: 'admin',
  // user: process.env.MYSQL_USER,
  password: 'adminacros',
  // password: process.env.MYSQL_PASSWORD,
  database: 'acrosDB',
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class SkuviewDsDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'skuviewDS';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.skuviewDS', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
