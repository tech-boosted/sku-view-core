import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SkuviewDsDataSource} from '../datasources';
import {Catalog, CatalogRelations} from '../models';

export class CatalogRepository extends DefaultCrudRepository<
  Catalog,
  typeof Catalog.prototype.id,
  CatalogRelations
> {
  constructor(
    @inject('datasources.skuviewDS') dataSource: SkuviewDsDataSource,
  ) {
    super(Catalog, dataSource);
  }

  async addMissingSkus(listOfSkus: string[], customer_id: number) {
    const productsToAdd: Catalog[] = [];

    for (const sku of listOfSkus) {
      const existingProduct = await this.findOne({where: {sku}});

      if (!existingProduct) {
        const newProduct = new Catalog({sku, customer_id});
        productsToAdd.push(newProduct);
      }
    }

    return this.createAll(productsToAdd);
  }
}
