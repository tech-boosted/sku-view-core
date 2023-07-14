import {repository} from '@loopback/repository';
import {post, requestBody} from '@loopback/rest';
import {
  AmazonDatesMetaDataRepository,
  ChannelsRepository,
  SkuViewRepository,
  UserRepository,
} from '../repositories';
import {checkDateRange, validateToken} from '../service';
import {getConnectedChannelsList} from '../service/getConnectedChannelsList';

const TableNamesUsingPlatforms: {[key: string]: string} = {
  amazon_us: 'AmazonUS',
  amazon_ca: 'AmazonCA',
  amazon_uk: 'AmazonUK',
  amazon_ge: 'AmazonGE',
  amazon_fr: 'AmazonFR',
  amazon_it: 'AmazonIT',
  google: 'Google',
};

export class SkuviewController {
  constructor(
    @repository(SkuViewRepository)
    public skuViewRepository: SkuViewRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(ChannelsRepository)
    public channelsRepository: ChannelsRepository,
    @repository(AmazonDatesMetaDataRepository)
    public amazonDatesMetaDataRepository: AmazonDatesMetaDataRepository,
  ) {}

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
    );

    return this.skuViewRepository.findDataWithSameName(
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

    return this.skuViewRepository.findAllWithSameName(
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

  // @post('/api/skus')
  // @response(200, {
  //   description: 'SkuView model instance',
  //   content: {'application/json': {schema: getModelSchemaRef(SkuView)}},
  // })
  // async create(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(SkuView, {
  //           title: 'NewSkuView',
  //           exclude: ['id'],
  //         }),
  //       },
  //     },
  //   })
  //   skuView: Omit<SkuView, 'id'>,
  // ): Promise<SkuView> {
  //   return this.skuViewRepository.create(skuView);
  // }

  // @get('/api/skus/count')
  // @response(200, {
  //   description: 'SkuView model count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async count(@param.where(SkuView) where?: Where<SkuView>): Promise<Count> {
  //   return this.skuViewRepository.count(where);
  // }

  // @get('/api/skus')
  // @response(200, {
  //   description: 'Array of SkuView model instances',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'array',
  //         items: getModelSchemaRef(SkuView, {includeRelations: true}),
  //       },
  //     },
  //   },
  // })
  // async find(
  //   @param.filter(SkuView) filter?: Filter<SkuView>,
  // ): Promise<SkuView[]> {
  //   return this.skuViewRepository.find(filter);
  // }

  // @patch('/api/skus')
  // @response(200, {
  //   description: 'SkuView PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(SkuView, {partial: true}),
  //       },
  //     },
  //   })
  //   skuView: SkuView,
  //   @param.where(SkuView) where?: Where<SkuView>,
  // ): Promise<Count> {
  //   return this.skuViewRepository.updateAll(skuView, where);
  // }

  // @get('/api/skus/{id}')
  // @response(200, {
  //   description: 'SkuView model instance',
  //   content: {
  //     'application/json': {
  //       schema: getModelSchemaRef(SkuView, {includeRelations: true}),
  //     },
  //   },
  // })
  // async findById(
  //   @param.path.string('id') id: number,
  //   @param.filter(SkuView, {exclude: 'where'})
  //   filter?: FilterExcludingWhere<SkuView>,
  // ): Promise<SkuView> {
  //   return this.skuViewRepository.findById(id, filter);
  // }

  // @patch('/api/skus/{id}')
  // @response(204, {
  //   description: 'SkuView PATCH success',
  // })
  // async updateById(
  //   @param.path.string('id') id: number,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(SkuView, {partial: true}),
  //       },
  //     },
  //   })
  //   skuView: SkuView,
  // ): Promise<void> {
  //   await this.skuViewRepository.updateById(id, skuView);
  // }

  // @put('/api/skus/{id}')
  // @response(204, {
  //   description: 'SkuView PUT success',
  // })
  // async replaceById(
  //   @param.path.string('id') id: number,
  //   @requestBody() skuView: SkuView,
  // ): Promise<void> {
  //   await this.skuViewRepository.replaceById(id, skuView);
  // }

  // @del('/api/skus/{id}')
  // @response(204, {
  //   description: 'SkuView DELETE success',
  // })
  // async deleteById(@param.path.string('id') id: number): Promise<void> {
  //   await this.skuViewRepository.deleteById(id);
  // }
}
