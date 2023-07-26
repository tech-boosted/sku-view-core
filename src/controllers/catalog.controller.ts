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

  @post('/catalog')
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
    let selectedUser = await validateToken(body.token, this.userRepository);
    let customer_id = selectedUser.customer_id;

    let allSkus = await this.dashboardRepository.getSkusAcrosAllPlatforms(
      //@ts-ignore
      customer_id,
    );

    //@ts-ignore
    await this.catalogRepository.addMissingSkus(allSkus, customer_id);

    let result = await this.catalogRepository.find({
      where: {
        customer_id: customer_id,
      },
    });

    return result.map(({customer_id, ...rest}) => rest);
  }

  @put('/catalog')
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
