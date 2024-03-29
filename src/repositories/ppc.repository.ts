import {inject} from '@loopback/core';
import {DefaultCrudRepository, repository} from '@loopback/repository';
import {SkuviewDsDataSource} from '../datasources';
import {Ppc, PpcRelations} from '../models';
import {UnStructuredData} from '../models/SkuData';
import {AmazonCARepository} from './amazon-ca.repository';
import {AmazonFRRepository} from './amazon-fr.repository';
import {AmazonGERepository} from './amazon-ge.repository';
import {AmazonITRepository} from './amazon-it.repository';
import {AmazonUKRepository} from './amazon-uk.repository';
import {AmazonUSRepository} from './amazon-us.repository';

const PlatformsUsingTableName: {[key: string]: string} = {
  AmazonUS: 'amazon_us',
  AmazonCA: 'amazon_ca',
  AmazonUK: 'amazon_uk',
  AmazonGE: 'amazon_ge',
  AmazonFR: 'amazon_fr',
  AmazonIT: 'amazon_it',
  Google: 'google',
};

export class PpcRepository extends DefaultCrudRepository<
  Ppc,
  typeof Ppc.prototype.id,
  PpcRelations
> {
  constructor(
    @inject('datasources.skuviewDS') dataSource: SkuviewDsDataSource,
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
  ) {
    super(Ppc, dataSource);
  }

  async findAllWithSameName(
    tableNames: string[],
    customer_id: string,
  ): Promise<any> {
    let query = '';

    for (let i = 0; i < tableNames.length; i++) {
      const element = tableNames[i];

      if (i == 0) {
        if (tableNames.length === 1) {
          query +=
            'SELECT DISTINCT sku FROM ' +
            element +
            ' WHERE customer_id = ' +
            customer_id;
        } else {
          query += 'SELECT DISTINCT sku FROM ' + element + ' WHERE';
        }
      } else {
        if (i === tableNames.length - 1) {
          query +=
            ' sku IN (SELECT sku FROM ' +
            element +
            ' WHERE customer_id = ' +
            customer_id +
            ')';
        } else {
          query +=
            ' sku IN (SELECT sku FROM ' +
            element +
            ' WHERE customer_id = ' +
            customer_id +
            ') AND';
        }
      }
    }

    console.log(query);

    // SELECT DISTINCT sku
    // FROM AmazonUS
    // WHERE sku IN (
    //     SELECT sku FROM AmazonUK WHERE customer_id = 15
    // ) AND sku IN (
    //     SELECT sku FROM AmazonCA WHERE customer_id = 15
    // ) AND sku IN (
    //     SELECT sku FROM AmazonGE WHERE customer_id = 15
    // );

    let skus = await this.dataSource.execute(query, []);

    let result: string[] = [];
    for (let i = 0; i < skus.length; i++) {
      const element = skus[i];
      result.push(element?.sku);
    }
    return result;
  }

  async findDataWithSameName(
    tableNames: string[],
    skus: string[],
    customer_id: string,
    startDate: string,
    endDate: string,
  ): Promise<any> {
    const platform_respositories: {[key: string]: any} = {
      AmazonUS: this.amazonUSRepository,
      AmazonCA: this.amazonCARepository,
      AmazonUK: this.amazonUKRepository,
      AmazonGE: this.amazonGERepository,
      AmazonFR: this.amazonFRRepository,
      AmazonIT: this.amazonITRepository,
    };

    let unstructuredData: UnStructuredData[] = [];

    for (let i = 0; i < tableNames.length; i++) {
      const selectedTable = tableNames[i];

      const query = {
        where: {
          customer_id: customer_id,
          sku: {inq: skus},
          date: {
            between: [startDate, endDate],
          },
        },
      };

      let temp = await platform_respositories[selectedTable].find(query);
      if (temp.length !== 0) {
        for (let k = 0; k < temp.length; k++) {
          const element = temp[k];
          element.platform = PlatformsUsingTableName[selectedTable];
          unstructuredData.push(element);
        }
      }
    }

    return unstructuredData.map(
      ({id, customer_id, profileId, ...keepAttrs}) => keepAttrs,
    );
  }

  async getDashboardLatestInfo(
    tableNames: string[],
    customer_id: string,
  ): Promise<any> {
    return {};
  }
}
