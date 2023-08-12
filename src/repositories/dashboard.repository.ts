import {inject} from '@loopback/core';
import {DefaultCrudRepository, repository} from '@loopback/repository';
import {SkuviewDsDataSource} from '../datasources';
import {Dashboard, DashboardRelations} from '../models';
import {TableNamesUsingPlatforms, getConnectedChannelsList} from '../service';
import {ChannelsRepository} from './channels.repository';

export class DashboardRepository extends DefaultCrudRepository<
  Dashboard,
  typeof Dashboard.prototype.id,
  DashboardRelations
> {
  constructor(
    @inject('datasources.skuviewDS') dataSource: SkuviewDsDataSource,
    @repository(ChannelsRepository)
    public channelsRepository: ChannelsRepository,
  ) {
    super(Dashboard, dataSource);
  }

  async getSkusAcrosAllPlatforms(customer_id: number) {
    let connectedChannels = await getConnectedChannelsList(
      this.channelsRepository,
      //@ts-ignore
      customer_id,
    );

    let connectedChannelsTableNames: string[] = [];

    for (let i = 0; i < connectedChannels.length; i++) {
      const element = connectedChannels[i];
      connectedChannelsTableNames.push(TableNamesUsingPlatforms[element]);
    }

    let query = '';

    for (let i = 0; i < connectedChannelsTableNames.length; i++) {
      const element = connectedChannelsTableNames[i];

      if (i == 0) {
        if (connectedChannelsTableNames.length === 1) {
          query +=
            'SELECT DISTINCT sku FROM ' +
            element +
            ' WHERE customer_id = ' +
            customer_id;
        } else {
          query += 'SELECT DISTINCT sku FROM ' + element + ' WHERE';
        }
      } else {
        if (i === connectedChannelsTableNames.length - 1) {
          query +=
            ' sku IN (SELECT sku FROM ' +
            element +
            ' WHERE customer_id = ' +
            customer_id +
            ')';
        } else {
          query +=
            ' sku IN (SELECT sku FROM ' +
            element +
            ' WHERE customer_id = ' +
            customer_id +
            ') AND';
        }
      }
    }

    let skus = await this.dataSource.execute(query, []);
    // let skus: {sku: string}[] = [];

    let result: string[] = [];
    for (let i = 0; i < skus.length; i++) {
      const element = skus[i];
      result.push(element?.sku);
    }

    return result;
  }
}
