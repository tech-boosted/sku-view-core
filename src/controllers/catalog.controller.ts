import {repository} from '@loopback/repository';
import {post, put, requestBody} from '@loopback/rest';
import {Catalog} from '../models';
import {
  CatalogRepository,
  ChannelsRepository,
  DashboardRepository,
  UserRepository,
} from '../repositories';
import {validateToken} from '../service';

export class CatalogController {
  constructor(
    @repository(CatalogRepository)
    public catalogRepository: CatalogRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(ChannelsRepository)
    public channelsRepository: ChannelsRepository,
    @repository(DashboardRepository)
    public dashboardRepository: DashboardRepository,
  ) {}

  @post('/api/catalog')
  async getCatalogs(
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
    console.log('catalog - validating user');

    let selectedUser = await validateToken(body.token, this.userRepository);
    let customer_id = selectedUser.customer_id;

    console.log('catalog - getting all skus');

    let allSkus = await this.dashboardRepository.getSkusAcrosAllPlatforms(
      //@ts-ignore
      customer_id,
    );

    console.log('catalog - adding missing skus');

    //@ts-ignore
    await this.catalogRepository.addMissingSkus(allSkus, customer_id);

    console.log('catalog - getting all catalogs');

    let result = await this.catalogRepository.find({
      where: {
        customer_id: customer_id,
      },
    });

    console.log('catalog - creating response');

    return result.map(({customer_id, ...rest}) => rest);
  }

  @put('/api/catalog')
  async replaceById(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              token: {type: 'string'},
              catalog: {type: 'object'},
            },
            required: ['token', 'catalog'],
          },
        },
      },
    })
    body: {
      token: string;
      catalog: Omit<Catalog, 'customer_id'>;
    },
  ): Promise<any> {
    let selectedUser = await validateToken(body.token, this.userRepository);
    let customer_id = selectedUser.customer_id;
    let result = await this.catalogRepository.replaceById(body.catalog.id, {
      customer_id: customer_id,
      ...body.catalog,
    });

    return this.catalogRepository.findOne({
      where: {
        customer_id: customer_id,
        id: body.catalog.id,
      },
    });
  }
}
