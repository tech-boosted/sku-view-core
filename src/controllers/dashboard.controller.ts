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
  PpcRepository,
  UserRepository,
} from '../repositories';
import {
  checkDateRangeAmazon,
  getConnectedChannelsList,
  validateToken,
} from '../service';
import {CombineSameDateData} from '../service/amazon/combineSameDateData';
import {TableNamesUsingPlatforms} from '../service/constants';
import {PastThirtyDays} from '../utils/pastThirtyDays';

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
    @repository(PpcRepository)
    public ppcRepository: PpcRepository,
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

    let {yesterdayFormatted, thirtyDaysAgoFormatted} = PastThirtyDays();

    await checkDateRangeAmazon(
      this.amazonDatesMetaDataRepository,
      thirtyDaysAgoFormatted,
      yesterdayFormatted,
      selectedUser,
      connectedChannels,
      connectedChannelsTableNames,
      this.channelsRepository,
      this.amazonReportIdRepository,
      this.amazon_respositories,
    );

    const specificSKUs = await this.ppcRepository.findAllWithSameName(
      connectedChannelsTableNames,
      String(customer_id),
    );

    // Define the custom filter
    const customFilter = {
      where: {
        and: [
          {date: {gte: thirtyDaysAgoFormatted}},
          {date: {lte: yesterdayFormatted}},
          {customer_id: customer_id},
          {sku: {inq: specificSKUs}},
        ],
      },
      fields: {
        sku: true,
        impressions: true,
        clicks: true,
        spend: true,
        sales: true,
        orders: true,
        date: true,
      },
      order: ['date ASC'], // Sorting by date in ascending order. Use 'DESC' for descending order.
    };

    console.log('LatestInfo from: ', thirtyDaysAgoFormatted);
    console.log('LatestInfo to: ', yesterdayFormatted);

    // Fetch data from each table
    const amazonUSData = await this.amazonUSRepository.find(customFilter);
    const amazonUKData = await this.amazonUKRepository.find(customFilter);
    const amazonCAData = await this.amazonCARepository.find(customFilter);
    const amazonGEData = await this.amazonGERepository.find(customFilter);
    const amazonFRData = await this.amazonFRRepository.find(customFilter);
    const amazonITData = await this.amazonITRepository.find(customFilter);

    const UScombinedSameDateData = await CombineSameDateData(amazonUSData);
    const UKcombinedSameDateData = await CombineSameDateData(amazonUKData);
    const CAcombinedSameDateData = await CombineSameDateData(amazonCAData);
    const GEcombinedSameDateData = await CombineSameDateData(amazonGEData);
    const FRcombinedSameDateData = await CombineSameDateData(amazonFRData);
    const ITcombinedSameDateData = await CombineSameDateData(amazonITData);

    return {
      amazonUSData: UScombinedSameDateData,
      amazonCAData: CAcombinedSameDateData,
      amazonUKData: UKcombinedSameDateData,
      amazonGEData: GEcombinedSameDateData,
      amazonFRData: FRcombinedSameDateData,
      amazonITData: ITcombinedSameDateData,
    };
  }
}
