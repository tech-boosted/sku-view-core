// Uncomment these imports to begin using these cool features!

import {repository} from '@loopback/repository';
import {post, requestBody} from '@loopback/rest';
import {
  AmazonCARepository,
  AmazonFRRepository,
  AmazonGERepository,
  AmazonITRepository,
  AmazonUKRepository,
  AmazonUSRepository,
  ChannelsRepository,
  UserRepository,
} from '../repositories';
import {getConnectedChannelsList, validateToken} from '../service';

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
  ) {}

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
    console.log('token: ', token);
    let results = {
      totalImpressions: 0,
      totalSales: 0,
      totalSpend: 0,
      totalOrders: 0,
      totalClicks: 0,
      impressions: [],
      sales: [],
      spend: [],
      orders: [],
      clicks: [],
    };

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

    return results;
  }
}
