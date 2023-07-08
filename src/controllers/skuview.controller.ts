import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {SkuView} from '../models';
import {SkuViewRepository} from '../repositories';

export class SkuviewController {
  constructor(
    @repository(SkuViewRepository)
    public skuViewRepository: SkuViewRepository,
  ) {}

  @post('/api/skus')
  @response(200, {
    description: 'SkuView model instance',
    content: {'application/json': {schema: getModelSchemaRef(SkuView)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SkuView, {
            title: 'NewSkuView',
            exclude: ['id'],
          }),
        },
      },
    })
    skuView: Omit<SkuView, 'id'>,
  ): Promise<SkuView> {
    return this.skuViewRepository.create(skuView);
  }

  @get('/api/skus/count')
  @response(200, {
    description: 'SkuView model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(SkuView) where?: Where<SkuView>): Promise<Count> {
    return this.skuViewRepository.count(where);
  }

  @get('/api/skus')
  @response(200, {
    description: 'Array of SkuView model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(SkuView, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(SkuView) filter?: Filter<SkuView>,
  ): Promise<SkuView[]> {
    return this.skuViewRepository.find(filter);
  }

  @patch('/api/skus')
  @response(200, {
    description: 'SkuView PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SkuView, {partial: true}),
        },
      },
    })
    skuView: SkuView,
    @param.where(SkuView) where?: Where<SkuView>,
  ): Promise<Count> {
    return this.skuViewRepository.updateAll(skuView, where);
  }

  @get('/api/skus/{id}')
  @response(200, {
    description: 'SkuView model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(SkuView, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: number,
    @param.filter(SkuView, {exclude: 'where'})
    filter?: FilterExcludingWhere<SkuView>,
  ): Promise<SkuView> {
    return this.skuViewRepository.findById(id, filter);
  }

  @patch('/api/skus/{id}')
  @response(204, {
    description: 'SkuView PATCH success',
  })
  async updateById(
    @param.path.string('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SkuView, {partial: true}),
        },
      },
    })
    skuView: SkuView,
  ): Promise<void> {
    await this.skuViewRepository.updateById(id, skuView);
  }

  @put('/api/skus/{id}')
  @response(204, {
    description: 'SkuView PUT success',
  })
  async replaceById(
    @param.path.string('id') id: number,
    @requestBody() skuView: SkuView,
  ): Promise<void> {
    await this.skuViewRepository.replaceById(id, skuView);
  }

  @del('/api/skus/{id}')
  @response(204, {
    description: 'SkuView DELETE success',
  })
  async deleteById(@param.path.string('id') id: number): Promise<void> {
    await this.skuViewRepository.deleteById(id);
  }
}
