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
  SkuService,
  checkDateRangeAmazon,
  getConnectedChannelsList,
  getDriversData,
  validateToken,
} from '../service';
import {getStartDateAndEndDate} from '../utils';

const TableNamesUsingPlatforms: {[key: string]: string} = {
  amazon_us: 'AmazonUS',
  amazon_ca: 'AmazonCA',
  amazon_uk: 'AmazonUK',
  amazon_ge: 'AmazonGE',
  amazon_fr: 'AmazonFR',
  amazon_it: 'AmazonIT',
  google: 'Google',
};

export class PPCController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(ChannelsRepository)
    public channelsRepository: ChannelsRepository,
    @repository(AmazonDatesMetaDataRepository)
    public amazonDatesMetaDataRepository: AmazonDatesMetaDataRepository,
    @repository(AmazonReportIdRepository)
    public amazonReportIdRepository: AmazonReportIdRepository,
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

  @post('/api/ppc/data')
  async getData(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              startDate: {type: 'string'},
              endDate: {type: 'string'},
              token: {type: 'string'},
              skus: {type: 'array'},
            },
            required: ['startDate', 'endDate', 'token', 'skus'],
          },
        },
      },
    })
    body: {
      startDate: string;
      endDate: string;
      token: string;
      skus: [];
    },
  ): Promise<any[]> {
    const token = body.token;
    const startDate = body.startDate;
    const endDate = body.endDate;
    const requestedSkus = body.skus;
    // var result: SkuData[] = [];

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

    await checkDateRangeAmazon(
      this.amazonDatesMetaDataRepository,
      startDate,
      endDate,
      selectedUser,
      connectedChannels,
      connectedChannelsTableNames,
      this.channelsRepository,
      this.amazonReportIdRepository,
      this.amazon_respositories,
    );

    return this.ppcRepository.findDataWithSameName(
      connectedChannelsTableNames,
      requestedSkus,
      //@ts-ignore
      customer_id,
      startDate,
      endDate,
    );
  }

  @post('/api/ppc/listSkus')
  async listAllSkus(
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
    let selectedUser = await validateToken(body.token, this.userRepository);
    let customer_id = selectedUser.customer_id;
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

    return this.ppcRepository.findAllWithSameName(
      connectedChannelsTableNames,
      //@ts-ignore
      customer_id,
    );
  }

  @post('/api/ppc/listConnectedChannels')
  async listAllConnectedChannels(
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
    let selectedUser = await validateToken(body.token, this.userRepository);
    let customer_id = selectedUser.customer_id;
    return getConnectedChannelsList(
      this.channelsRepository,
      //@ts-ignore
      customer_id,
    );
  }

  @post('/api/ppc/drivers')
  async ppcDrivers(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              monthOne: {type: 'string'},
              yearOne: {type: 'number'},
              monthTwo: {type: 'string'},
              yearTwo: {type: 'number'},
              token: {type: 'string'},
            },
            required: ['monthOne', 'yearOne', 'monthTwo', 'yearTwo', 'token'],
          },
        },
      },
    })
    body: {
      monthOne: string;
      yearOne: number;
      monthTwo: string;
      yearTwo: number;
      token: string;
    },
  ): Promise<any> {
    const token = body.token;
    const monthOne = body.monthOne;
    const yearOne = body.yearOne;
    const monthTwo = body.monthTwo;
    const yearTwo = body.yearTwo;

    let {customer_id, ...selectedUser} = await validateToken(
      token,
      this.userRepository,
    );
    // let customer_id = selectedUser.customer_id;
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

    const specificSKUs = await this.ppcRepository.findAllWithSameName(
      connectedChannelsTableNames,
      String(customer_id),
    );

    if (specificSKUs?.length === 0) {
      return [];
    }

    const monthOneDates = getStartDateAndEndDate(monthOne, yearOne);
    const monthTwoDates = getStartDateAndEndDate(monthTwo, yearTwo);

    const desiredStartDateOne = monthOneDates.startDate;
    const desiredEndDateOne = monthOneDates.endDate;

    const desiredStartDateTwo = monthTwoDates.startDate;
    const desiredEndDateTwo = monthTwoDates.endDate;

    // Define the custom filter
    const customFilterOne = {
      where: {
        and: [
          {date: {gte: desiredStartDateOne}},
          {date: {lte: desiredEndDateOne}},
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

    // Define the custom filter
    const customFilterTwo = {
      where: {
        and: [
          {date: {gte: desiredStartDateTwo}},
          {date: {lte: desiredEndDateTwo}},
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
    const amazonUSDataOne = await this.amazonUSRepository.find(customFilterOne);
    const amazonUSDataTwo = await this.amazonUSRepository.find(customFilterTwo);

    const amazonCADataOne = await this.amazonCARepository.find(customFilterOne);
    const amazonCADataTwo = await this.amazonCARepository.find(customFilterTwo);

    const amazonUKDataOne = await this.amazonUKRepository.find(customFilterOne);
    const amazonUKDataTwo = await this.amazonUKRepository.find(customFilterTwo);

    const amazonGEDataOne = await this.amazonGERepository.find(customFilterOne);
    const amazonGEDataTwo = await this.amazonGERepository.find(customFilterOne);

    const amazonFRDataOne = await this.amazonFRRepository.find(customFilterOne);
    const amazonFRDataTwo = await this.amazonFRRepository.find(customFilterTwo);

    const amazonITDataOne = await this.amazonITRepository.find(customFilterTwo);
    const amazonITDataTwo = await this.amazonITRepository.find(customFilterTwo);

    return {
      amazonUSData: await getDriversData(amazonUSDataOne, amazonUSDataTwo),
      amazonCAData: await getDriversData(amazonCADataOne, amazonCADataTwo),
      amazonUKData: await getDriversData(amazonUKDataOne, amazonUKDataTwo),
      amazonGEData: await getDriversData(amazonGEDataOne, amazonGEDataTwo),
      amazonFRData: await getDriversData(amazonFRDataOne, amazonFRDataTwo),
      amazonITData: await getDriversData(amazonITDataOne, amazonITDataTwo),
    };
  }

  @post('/api/ppc/split')
  async ppcSplit(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              startDate: {type: 'string'},
              endDate: {type: 'string'},
              selectedSku: {type: 'string'},
              token: {type: 'string'},
            },
            required: ['startDate', 'endDate', 'selectedSku', 'token'],
          },
        },
      },
    })
    body: {
      startDate: string;
      endDate: string;
      selectedSku: string;
      token: string;
    },
  ): Promise<any> {
    const token = body.token;
    const startDate = body.startDate;
    const endDate = body.endDate;
    const selectedSku = body.selectedSku;

    let {customer_id, ...selectedUser} = await validateToken(
      token,
      this.userRepository,
    );

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

    const specificSKUs = await this.ppcRepository.findAllWithSameName(
      connectedChannelsTableNames,
      String(customer_id),
    );

    if (specificSKUs?.length === 0) {
      return [];
    }

    const skuService = new SkuService(
      this.amazonUSRepository,
      this.amazonCARepository,
      this.amazonUKRepository,
      this.amazonGERepository,
      this.amazonFRRepository,
      this.amazonITRepository,
    );

    return skuService.getSkuDataByNameAndRange(selectedSku, startDate, endDate);
  }

  @post('/api/ppc/compare')
  async compare(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              startDate: {type: 'string'},
              endDate: {type: 'string'},
              selectedSkus: {type: 'array'},
              token: {type: 'string'},
            },
            required: ['startDate', 'endDate', 'selectedSku', 'token'],
          },
        },
      },
    })
    body: {
      startDate: string;
      endDate: string;
      selectedSkus: string[];
      token: string;
    },
  ): Promise<any> {
    const token = body.token;
    const startDate = body.startDate;
    const endDate = body.endDate;
    const selectedSkus = body.selectedSkus;

    let {customer_id, ...selectedUser} = await validateToken(
      token,
      this.userRepository,
    );

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

    const specificSKUs = await this.ppcRepository.findAllWithSameName(
      connectedChannelsTableNames,
      String(customer_id),
    );

    if (specificSKUs?.length === 0) {
      return [];
    }

    const skuService = new SkuService(
      this.amazonUSRepository,
      this.amazonCARepository,
      this.amazonUKRepository,
      this.amazonGERepository,
      this.amazonFRRepository,
      this.amazonITRepository,
    );

    return skuService.getSkusDataByNameAndRange(
      selectedSkus,
      startDate,
      endDate,
    );
  }
}
