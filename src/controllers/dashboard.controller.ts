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
  CombineSameDateData,
  CombineSameSkuDateData,
  TableNamesUsingPlatforms,
  checkDateRangeAmazon,
  getConnectedChannelsList,
  validateToken,
} from '../service';
import {PastThirtyDays, getStartDateAndEndDate} from '../utils';

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

    if (connectedChannels.length === 0) {
      return {
        amazonUSData: [],
        amazonCAData: [],
        amazonUKData: [],
        amazonGEData: [],
        amazonFRData: [],
        amazonITData: [],
      };
    }
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

    if (specificSKUs?.length === 0) {
      return [];
    }

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

    const UScombinedSameDateData = await CombineSameSkuDateData(amazonUSData);
    const UKcombinedSameDateData = await CombineSameSkuDateData(amazonUKData);
    const CAcombinedSameDateData = await CombineSameSkuDateData(amazonCAData);
    const GEcombinedSameDateData = await CombineSameSkuDateData(amazonGEData);
    const FRcombinedSameDateData = await CombineSameSkuDateData(amazonFRData);
    const ITcombinedSameDateData = await CombineSameSkuDateData(amazonITData);

    return {
      amazonUSData: UScombinedSameDateData,
      amazonCAData: CAcombinedSameDateData,
      amazonUKData: UKcombinedSameDateData,
      amazonGEData: GEcombinedSameDateData,
      amazonFRData: FRcombinedSameDateData,
      amazonITData: ITcombinedSameDateData,
    };
  }

  @post('/api/dashboard/performanceTrend')
  async dashboardTrend(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              month: {type: 'string'},
              year: {type: 'number'},
              token: {type: 'string'},
            },
            required: ['token', 'month', 'year'],
          },
        },
      },
    })
    body: {
      month: string;
      year: number;
      token: string;
    },
  ): Promise<any> {
    let token = body.token;
    let month = body.month;
    let year = body.year;

    let selectedUser = await validateToken(token, this.userRepository);
    let customer_id = selectedUser.customer_id;
    //@ts-ignore
    let connectedChannels: string[] = await getConnectedChannelsList(
      this.channelsRepository,
      //@ts-ignore
      customer_id,
    );

    if (connectedChannels.length === 0) {
      return [];
    }
    let connectedChannelsTableNames: string[] = [];

    for (let i = 0; i < connectedChannels.length; i++) {
      const element = connectedChannels[i];
      connectedChannelsTableNames.push(TableNamesUsingPlatforms[element]);
    }

    console.log('month: ', month);
    console.log('year: ', year);

    const result = getStartDateAndEndDate(month, year);

    const desiredStartDate = result.startDate;
    const desiredEndDate = result.endDate;

    const specificSKUs = await this.ppcRepository.findAllWithSameName(
      connectedChannelsTableNames,
      String(customer_id),
    );

    if (specificSKUs?.length === 0) {
      return [];
    }

    // Define the custom filter
    const customFilter = {
      where: {
        and: [
          {date: {gte: desiredStartDate}},
          {date: {lte: desiredEndDate}},
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
      order: ['date ASC'],
    };

    // Fetch data from each table
    const amazonUSData = await this.amazonUSRepository.find(customFilter);
    const amazonUKData = await this.amazonUKRepository.find(customFilter);
    const amazonCAData = await this.amazonCARepository.find(customFilter);
    const amazonGEData = await this.amazonGERepository.find(customFilter);
    const amazonFRData = await this.amazonFRRepository.find(customFilter);
    const amazonITData = await this.amazonITRepository.find(customFilter);

    // const combinedDateData = CombineSameDateData([
    //   amazonUSData,
    //   amazonUKData,
    //   amazonCAData,
    //   amazonGEData,
    //   amazonFRData,
    //   amazonITData,
    // ]);

    // return combinedDateData;

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

  @post('/api/dashboard/historicalPerformance')
  async dashboardHistoricalData(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              startMonth: {type: 'string'},
              startYear: {type: 'number'},
              endMonth: {type: 'string'},
              endYear: {type: 'number'},
              token: {type: 'string'},
            },
            required: [
              'token',
              'startMonth',
              'startYear',
              'endMonth',
              'endYear',
            ],
          },
        },
      },
    })
    body: {
      startMonth: string;
      startYear: number;
      endMonth: string;
      endYear: number;
      token: string;
    },
  ): Promise<any> {
    let token = body.token;

    let startMonth = body.startMonth;
    let startYear = body.startYear;
    let endMonth = body.endMonth;
    let endYear = body.endYear;

    let selectedUser = await validateToken(token, this.userRepository);
    let customer_id = selectedUser.customer_id;
    //@ts-ignore
    let connectedChannels: string[] = await getConnectedChannelsList(
      this.channelsRepository,
      //@ts-ignore
      customer_id,
    );

    if (connectedChannels.length === 0) {
      return [];
    }

    let connectedChannelsTableNames: string[] = [];

    for (let i = 0; i < connectedChannels.length; i++) {
      const element = connectedChannels[i];
      connectedChannelsTableNames.push(TableNamesUsingPlatforms[element]);
    }

    console.log('startMonth: ', startMonth, startYear);
    console.log('endMonth: ', endMonth, endYear);

    const startResult = getStartDateAndEndDate(startMonth, startYear);
    const endResult = getStartDateAndEndDate(endMonth, endYear);

    const desiredStartDate = startResult.startDate;
    const desiredEndDate = endResult.endDate;

    console.log('desiredStartDate: ', desiredStartDate);
    console.log('desiredEndDate: ', desiredEndDate);

    const specificSKUs = await this.ppcRepository.findAllWithSameName(
      connectedChannelsTableNames,
      String(customer_id),
    );

    if (specificSKUs?.length === 0) {
      return [];
    }

    const customFilter = {
      where: {
        and: [
          {date: {gte: desiredStartDate}},
          {date: {lte: desiredEndDate}},
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
      order: ['date ASC'],
    };

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

  @post('/api/dashboard/performanceSummary')
  async dashboardSummary(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              month: {type: 'string'},
              year: {type: 'number'},
              token: {type: 'string'},
            },
            required: ['token', 'month', 'year'],
          },
        },
      },
    })
    body: {
      month: string;
      year: number;
      token: string;
    },
  ): Promise<any> {
    let token = body.token;
    let month = body.month;
    let year = body.year;

    let selectedUser = await validateToken(token, this.userRepository);
    let customer_id = selectedUser.customer_id;
    //@ts-ignore
    let connectedChannels: string[] = await getConnectedChannelsList(
      this.channelsRepository,
      //@ts-ignore
      customer_id,
    );

    if (connectedChannels.length === 0) {
      return [];
    }
    let connectedChannelsTableNames: string[] = [];

    for (let i = 0; i < connectedChannels.length; i++) {
      const element = connectedChannels[i];
      connectedChannelsTableNames.push(TableNamesUsingPlatforms[element]);
    }

    console.log('month: ', month);
    console.log('year: ', year);

    const result = getStartDateAndEndDate(month, year);

    const desiredStartDate = result.startDate;
    const desiredEndDate = result.endDate;

    const specificSKUs = await this.ppcRepository.findAllWithSameName(
      connectedChannelsTableNames,
      String(customer_id),
    );

    if (specificSKUs?.length === 0) {
      return [];
    }

    // Define the custom filter
    const customFilter = {
      where: {
        and: [
          {date: {gte: desiredStartDate}},
          {date: {lte: desiredEndDate}},
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
      order: ['date ASC'],
    };

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

  @post('/api/dashboard/skuWaste')
  async dashboardWaste(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              month: {type: 'string'},
              year: {type: 'number'},
              token: {type: 'string'},
            },
            required: ['token', 'month', 'year'],
          },
        },
      },
    })
    body: {
      month: string;
      year: number;
      token: string;
    },
  ): Promise<any> {
    let token = body.token;
    let month = body.month;
    let year = body.year;

    let selectedUser = await validateToken(token, this.userRepository);
    let customer_id = selectedUser.customer_id;
    //@ts-ignore
    let connectedChannels: string[] = await getConnectedChannelsList(
      this.channelsRepository,
      //@ts-ignore
      customer_id,
    );

    if (connectedChannels.length === 0) {
      return {
        amazonUSData: [],
        amazonCAData: [],
        amazonUKData: [],
        amazonGEData: [],
        amazonFRData: [],
        amazonITData: [],
      };
    }
    let connectedChannelsTableNames: string[] = [];

    for (let i = 0; i < connectedChannels.length; i++) {
      const element = connectedChannels[i];
      connectedChannelsTableNames.push(TableNamesUsingPlatforms[element]);
    }

    const specificSKUs = await this.ppcRepository.findAllWithSameName(
      connectedChannelsTableNames,
      String(customer_id),
    );

    if (specificSKUs?.length === 0) {
      return [];
    }

    console.log('month: ', month);
    console.log('year: ', year);

    const result = getStartDateAndEndDate(month, year);

    const desiredStartDate = result.startDate;
    const desiredEndDate = result.endDate;

    // Define the custom filter
    const customFilter = {
      where: {
        and: [
          {date: {gte: desiredStartDate}},
          {date: {lte: desiredEndDate}},
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

    // Fetch data from each table
    const amazonUSData = await this.amazonUSRepository.find(customFilter);
    const amazonUKData = await this.amazonUKRepository.find(customFilter);
    const amazonCAData = await this.amazonCARepository.find(customFilter);
    const amazonGEData = await this.amazonGERepository.find(customFilter);
    const amazonFRData = await this.amazonFRRepository.find(customFilter);
    const amazonITData = await this.amazonITRepository.find(customFilter);

    const UScombinedSameDateData = await CombineSameSkuDateData(amazonUSData);
    const UKcombinedSameDateData = await CombineSameSkuDateData(amazonUKData);
    const CAcombinedSameDateData = await CombineSameSkuDateData(amazonCAData);
    const GEcombinedSameDateData = await CombineSameSkuDateData(amazonGEData);
    const FRcombinedSameDateData = await CombineSameSkuDateData(amazonFRData);
    const ITcombinedSameDateData = await CombineSameSkuDateData(amazonITData);

    return {
      amazonUSData: UScombinedSameDateData,
      amazonCAData: CAcombinedSameDateData,
      amazonUKData: UKcombinedSameDateData,
      amazonGEData: GEcombinedSameDateData,
      amazonFRData: FRcombinedSameDateData,
      amazonITData: ITcombinedSameDateData,
    };
  }

  @post('/api/dashboard/skuTracker')
  async dashboardTracker(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              month: {type: 'string'},
              year: {type: 'number'},
              token: {type: 'string'},
            },
            required: ['token', 'month', 'year'],
          },
        },
      },
    })
    body: {
      month: string;
      year: number;
      token: string;
    },
  ): Promise<any> {
    let token = body.token;
    let month = body.month;
    let year = body.year;

    let selectedUser = await validateToken(token, this.userRepository);
    let customer_id = selectedUser.customer_id;
    //@ts-ignore
    let connectedChannels: string[] = await getConnectedChannelsList(
      this.channelsRepository,
      //@ts-ignore
      customer_id,
    );

    if (connectedChannels.length === 0) {
      return {
        amazonUSData: [],
        amazonCAData: [],
        amazonUKData: [],
        amazonGEData: [],
        amazonFRData: [],
        amazonITData: [],
      };
    }
    let connectedChannelsTableNames: string[] = [];

    for (let i = 0; i < connectedChannels.length; i++) {
      const element = connectedChannels[i];
      connectedChannelsTableNames.push(TableNamesUsingPlatforms[element]);
    }

    const specificSKUs = await this.ppcRepository.findAllWithSameName(
      connectedChannelsTableNames,
      String(customer_id),
    );

    if (specificSKUs?.length === 0) {
      return [];
    }

    console.log('month: ', month);
    console.log('year: ', year);

    const result = getStartDateAndEndDate(month, year);

    const desiredStartDate = result.startDate;
    const desiredEndDate = result.endDate;

    // Define the custom filter
    const customFilter = {
      where: {
        and: [
          {date: {gte: desiredStartDate}},
          {date: {lte: desiredEndDate}},
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

    // Fetch data from each table
    const amazonUSData = await this.amazonUSRepository.find(customFilter);
    const amazonUKData = await this.amazonUKRepository.find(customFilter);
    const amazonCAData = await this.amazonCARepository.find(customFilter);
    const amazonGEData = await this.amazonGERepository.find(customFilter);
    const amazonFRData = await this.amazonFRRepository.find(customFilter);
    const amazonITData = await this.amazonITRepository.find(customFilter);

    const UScombinedSameDateData = await CombineSameSkuDateData(amazonUSData);
    const UKcombinedSameDateData = await CombineSameSkuDateData(amazonUKData);
    const CAcombinedSameDateData = await CombineSameSkuDateData(amazonCAData);
    const GEcombinedSameDateData = await CombineSameSkuDateData(amazonGEData);
    const FRcombinedSameDateData = await CombineSameSkuDateData(amazonFRData);
    const ITcombinedSameDateData = await CombineSameSkuDateData(amazonITData);

    return {
      amazonUSData: UScombinedSameDateData,
      amazonCAData: CAcombinedSameDateData,
      amazonUKData: UKcombinedSameDateData,
      amazonGEData: GEcombinedSameDateData,
      amazonFRData: FRcombinedSameDateData,
      amazonITData: ITcombinedSameDateData,
    };
  }

  @post('/api/dashboard/insights')
  async dashboardInsights(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              startDate: {type: 'string'},
              endDate: {type: 'string'},
              token: {type: 'string'},
            },
            required: ['startDate', 'endDate', 'token'],
          },
        },
      },
    })
    body: {
      startDate: string;
      endDate: string;
      token: string;
    },
  ): Promise<any> {
    let token = body.token;

    const startDate = body.startDate;
    const endDate = body.endDate;

    let selectedUser = await validateToken(token, this.userRepository);
    let customer_id = selectedUser.customer_id;
    //@ts-ignore
    let connectedChannels: string[] = await getConnectedChannelsList(
      this.channelsRepository,
      //@ts-ignore
      customer_id,
    );

    if (connectedChannels.length === 0) {
      return {
        amazonUSData: [],
        amazonCAData: [],
        amazonUKData: [],
        amazonGEData: [],
        amazonFRData: [],
        amazonITData: [],
      };
    }
    let connectedChannelsTableNames: string[] = [];

    for (let i = 0; i < connectedChannels.length; i++) {
      const element = connectedChannels[i];
      connectedChannelsTableNames.push(TableNamesUsingPlatforms[element]);
    }

    const specificSKUs = await this.ppcRepository.findAllWithSameName(
      connectedChannelsTableNames,
      String(customer_id),
    );

    if (specificSKUs?.length === 0) {
      return [];
    }

    console.log('desiredStartDate: ', startDate);
    console.log('desiredEndDate: ', endDate);

    // Define the custom filter
    const customFilter = {
      where: {
        and: [
          {date: {gte: startDate}},
          {date: {lte: endDate}},
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

    // Fetch data from each table
    const amazonUSData = await this.amazonUSRepository.find(customFilter);
    const amazonUKData = await this.amazonUKRepository.find(customFilter);
    const amazonCAData = await this.amazonCARepository.find(customFilter);
    const amazonGEData = await this.amazonGERepository.find(customFilter);
    const amazonFRData = await this.amazonFRRepository.find(customFilter);
    const amazonITData = await this.amazonITRepository.find(customFilter);

    const UScombinedSameDateData = await CombineSameSkuDateData(amazonUSData);
    const UKcombinedSameDateData = await CombineSameSkuDateData(amazonUKData);
    const CAcombinedSameDateData = await CombineSameSkuDateData(amazonCAData);
    const GEcombinedSameDateData = await CombineSameSkuDateData(amazonGEData);
    const FRcombinedSameDateData = await CombineSameSkuDateData(amazonFRData);
    const ITcombinedSameDateData = await CombineSameSkuDateData(amazonITData);

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
