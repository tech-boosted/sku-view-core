import {repository} from '@loopback/repository';
import {post, requestBody} from '@loopback/rest';
import {
  AmazonDatesMetaDataRepository,
  ChannelsRepository,
  SkuViewRepository,
  UserRepository,
} from '../repositories';
import {validateToken} from '../service';
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

  @post('/api/data')
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

    // for (let i = 0; i < connectedChannels.length; i++) {
    //   const channel = connectedChannels[i];
    //   if (channel.includes('amazon')) {
    //     let metadata = await this.amazonDatesMetaDataRepository.findOne({
    //       where: {
    //         customer_id: customer_id,
    //         marketplace: channel,
    //       },
    //     });
    //   }
    // }

    // try {
    //   const query: Filter<SkuView> = {
    //     where: {
    //       customer_id: customer_id,
    //       platform: 'amazon_na',
    //       date: {
    //         between: [startDate, endDate],
    //       },
    //     },
    //   };
    //   query.order = ['date ASC'];
    //   let temp = await this.skuViewRepository.find(query);

    //   let newData: SkuData[] = [];

    //   temp.forEach(e => {
    //     let currentSku = e.sku;
    //     let existingSkuIndex = -1;
    //     let currentPlatform = e.platform;
    //     let existingPlatformIndex = -1;

    //     // Check if Sku already added
    //     for (let i = 0; i < newData.length; i++) {
    //       let element = newData[i];
    //       if (element.skuName === currentSku) {
    //         existingSkuIndex = i;
    //         return;
    //       }
    //     }

    //     // If Sku is already added then check if platform is already added
    //     if (existingSkuIndex !== -1) {
    //       for (let i = 0; i < newData[existingSkuIndex].platform.length; i++) {
    //         let element = newData[existingSkuIndex].platform[i];
    //         if (element.name === currentPlatform) {
    //           existingPlatformIndex = i;
    //           return;
    //         }
    //       }
    //     }

    //     const propertyMapping = {
    //       Impressions: 'impressions',
    //       Spend: 'spend',
    //       Clicks: 'clicks',
    //       Orders: 'orders',
    //       Sales: 'sales',
    //     };

    //     // If platform is added then add current data to it
    //     if (existingPlatformIndex !== -1) {
    //       for (
    //         let i = 0;
    //         i <
    //         newData[existingSkuIndex].platform[existingPlatformIndex].data
    //           .length;
    //         i++
    //       ) {
    //         const element =
    //           //@ts-ignore
    //           newData[existingSkuIndex].platform[existingPlatformIndex][i].data;
    //         for (let j = 0; j < element.length; j++) {
    //           const obj = element[j];
    //           //@ts-ignore
    //           const propertyName = propertyMapping[obj.property];
    //           if (propertyName && e.hasOwnProperty(propertyName)) {
    //             //@ts-ignore
    //             obj.data.push(e[propertyName]);
    //           }
    //         }
    //       }
    //     }

    //     // If Sku is not added
    //     if (existingSkuIndex === -1) {
    //       newData.push({
    //         skuName: currentSku,
    //         platform: [
    //           {
    //             name: String(currentPlatform),
    //             data: [
    //               {
    //                 property: 'Impressions',
    //                 data: [Number(e.impressions)],
    //               },
    //               {
    //                 property: 'Spend',
    //                 data: [Number(e.spend)],
    //               },
    //               {
    //                 property: 'Clicks',
    //                 data: [Number(e.clicks)],
    //               },
    //               {
    //                 property: 'Orders',
    //                 data: [Number(e.orders)],
    //               },
    //               {
    //                 property: 'Sales',
    //                 data: [Number(e.sales)],
    //               },
    //             ],
    //           },
    //         ],
    //       });
    //     } else {
    //       // If Platform is not added
    //       if (existingPlatformIndex === -1) {
    //         newData[existingSkuIndex].platform.push({
    //           name: String(currentPlatform),
    //           data: [
    //             {
    //               property: 'Impressions',
    //               data: [Number(e.impressions)],
    //             },
    //             {
    //               property: 'Spend',
    //               data: [Number(e.spend)],
    //             },
    //             {
    //               property: 'Clicks',
    //               data: [Number(e.clicks)],
    //             },
    //             {
    //               property: 'Orders',
    //               data: [Number(e.orders)],
    //             },
    //             {
    //               property: 'Sales',
    //               data: [Number(e.sales)],
    //             },
    //           ],
    //         });
    //       }
    //     }

    //     result = newData;
    //   });
    // } catch (err) {
    //   console.log(err);
    // }
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
