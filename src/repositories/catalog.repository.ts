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
    console.log('fetching skus from the list in table');
    const existingRecords = await this.find({
      where: {
        customer_id: customer_id,
        sku: {inq: listOfSkus},
      },
    });

    console.log('creating set');

    const existingSKUsSet = new Set(existingRecords.map(record => record.sku));

    console.log('filtering');

    const skusToAdd = listOfSkus.filter(sku => !existingSKUsSet.has(sku));

    if (skusToAdd.length > 0) {
      console.log('creating newrecords');
      const newRecords: Partial<Catalog>[] = skusToAdd.map(sku => ({
        customer_id: customer_id,
        sku: sku,
      }));
      console.log('inserting data');
      return this.createAll(newRecords);
    }
    return [];
  }
}
