import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
require('dotenv').config();

const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;

const config = {
  name: 'skuviewDS',
  connector: 'mysql',
  url: process.env.MYSQL_URI,
  host: 'acros-test-db-instance-1.cbjmo0koiyrt.us-east-2.rds.amazonaws.com',
  port: 3306,
  user: user,
  password: password,
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
