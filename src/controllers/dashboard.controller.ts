// Uncomment these imports to begin using these cool features!

import {repository} from '@loopback/repository';
import {post, requestBody} from '@loopback/rest';
import {
  AmazonCARepository,
  AmazonDatesMetaDataRepository,
  AmazonFRRepository,
  AmazonGERepository,
  AmazonITRepository,
  AmazonReportIdRepository,
  AmazonUKRepository,
  AmazonUSRepository,
  ChannelsRepository,
  UserRepository,
} from '../repositories';
import {
  checkDateRange,
  getConnectedChannelsList,
  validateToken,
} from '../service';
import {PastThirtyDays} from '../utils/pastThirtyDays';

const TableNamesUsingPlatforms: {[key: string]: string} = {
  amazon_us: 'AmazonUS',
  amazon_ca: 'AmazonCA',
  amazon_uk: 'AmazonUK',
  amazon_ge: 'AmazonGE',
  amazon_fr: 'AmazonFR',
  amazon_it: 'AmazonIT',
  google: 'Google',
};

export class DashboardController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(ChannelsRepository)
    public channelsRepository: ChannelsRepository,
    @repository(AmazonUSRepository)
    public amazonUSRepository: AmazonUSRepository,
    @repository(AmazonCARepository)
    public amazonCARepository: AmazonCARepository,
    @repository(AmazonUKRepository)
    public amazonUKRepository: AmazonUKRepository,
    @repository(AmazonGERepository)
    public amazonGERepository: AmazonGERepository,
    @repository(AmazonFRRepository)
    public amazonFRRepository: AmazonFRRepository,
    @repository(AmazonITRepository)
    public amazonITRepository: AmazonITRepository,
    @repository(AmazonDatesMetaDataRepository)
    public amazonDatesMetaDataRepository: AmazonDatesMetaDataRepository,
    @repository(AmazonReportIdRepository)
    public amazonReportIdRepository: AmazonReportIdRepository,
  ) {}

  amazon_respositories: {[key: string]: any} = {
    amazon_us: this.amazonUSRepository,
    amazon_ca: this.amazonCARepository,
    amazon_uk: this.amazonUKRepository,
    amazon_ge: this.amazonGERepository,
    amazon_fr: this.amazonFRRepository,
    amazon_it: this.amazonITRepository,
  };

  @post('/api/dashboard/latestInfo')
  async dashboardInfo(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              token: {type: 'string'},
            },
            required: ['token'],
          },
        },
      },
    })
    body: {
      token: string;
    },
  ): Promise<any> {
    let token = body.token;

    let selectedUser = await validateToken(token, this.userRepository);
    let customer_id = selectedUser.customer_id;
    //@ts-ignore
    let connectedChannels: string[] = await getConnectedChannelsList(
      this.channelsRepository,
      //@ts-ignore
      customer_id,
    );
    let connectedChannelsTableNames: string[] = [];

    for (let i = 0; i < connectedChannels.length; i++) {
      const element = connectedChannels[i];
      connectedChannelsTableNames.push(TableNamesUsingPlatforms[element]);
    }

    let {todayFormatted, thirtyDaysAgoFormatted} = PastThirtyDays();

    await checkDateRange(
      this.amazonDatesMetaDataRepository,
      thirtyDaysAgoFormatted,
      todayFormatted,
      selectedUser,
      connectedChannels,
      connectedChannelsTableNames,
      this.channelsRepository,
      this.amazonReportIdRepository,
      this.amazon_respositories,
    );

    // Define the custom filter
    const customFilter = {
      where: {
        and: [
          // {date: {gte: '2023-05-01'}},
          // {date: {lte: '2023-05-30'}},
          {date: {gte: thirtyDaysAgoFormatted}},
          {date: {lte: todayFormatted}},
          {customer_id: customer_id},
        ],
      },
      fields: {
        sku: true,
        impressions: true,
        clicks: true,
        spend: true,
        sales: true,
        orders: true,
      },
    };

    // Fetch data from each table
    const amazonUSData = await this.amazonUSRepository.find(customFilter);
    // const amazonUKData = await this.amazonUKRepository.find(customFilter);
    const amazonCAData = await this.amazonCARepository.find(customFilter);

    // Combine data and calculate aggregates
    const combinedData = amazonUSData.concat(amazonCAData);

    // Calculate the total impressions, clicks, and spend for each SKU
    const aggregatedData = combinedData.reduce((result: any, item) => {
      const sku = item.sku;
      if (!result[sku]) {
        result[sku] = {
          sku,
          impressions: 0,
          clicks: 0,
          spend: 0,
          sales: 0,
          orders: 0,
        };
      }

      result[sku].impressions += item.impressions;
      result[sku].clicks += item.clicks;
      result[sku].spend += item.spend;
      result[sku].sales += item.sales;
      result[sku].orders += item.orders;
      return result;
    }, {});

    // Convert the aggregated data object into an array
    const finalData = Object.values(aggregatedData);

    return finalData;
  }
}
