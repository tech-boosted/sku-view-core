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
  checkDateRange,
  getConnectedChannelsList,
  validateToken,
} from '../service';

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

    await checkDateRange(
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
}
