import {repository} from '@loopback/repository';
import {
  AmazonCARepository,
  AmazonFRRepository,
  AmazonGERepository,
  AmazonITRepository,
  AmazonUKRepository,
  AmazonUSRepository,
} from '../../repositories';

interface CombinedSkuData {
  impressions: number;
  clicks: number;
  orders: number;
  sales: number;
  spend: number;
}

export const processPlatformData = (
  plarformName: string,
  data: any[],
  combinedDataMap: Map<string, CombinedSkuData>,
) => {
  for (const obj of data) {
    if (!combinedDataMap.has(plarformName)) {
      combinedDataMap.set(plarformName, {
        impressions: 0,
        clicks: 0,
        orders: 0,
        sales: 0,
        spend: 0,
      });
    }
    const platformData = combinedDataMap.get(plarformName)!;

    if (platformData) {
      platformData.impressions += obj.impressions;
      platformData.clicks += obj.clicks;
      platformData.orders += obj.orders;
      platformData.sales += obj.sales;
      platformData.spend += obj.spend;
    } else {
      combinedDataMap.set(platformData, {
        impressions: obj.impressions,
        clicks: obj.clicks,
        orders: obj.orders,
        sales: obj.sales,
        spend: obj.spend,
      });
    }
  }
};

export class SkuService {
  constructor(
    @repository(AmazonUSRepository) private amazonUSRepo: AmazonUSRepository,
    @repository(AmazonCARepository) private amazonCARepo: AmazonCARepository,
    @repository(AmazonUKRepository) private amazonUKRepo: AmazonUKRepository,
    @repository(AmazonGERepository) private amazonGERepo: AmazonGERepository,
    @repository(AmazonFRRepository) private amazonFRRepo: AmazonFRRepository,
    @repository(AmazonITRepository) private amazonITRepo: AmazonITRepository,
  ) {}

  async getSkuDataByNameAndRange(
    skuName: string,
    start_date: string,
    end_date: string,
  ) {
    const customFilter = {
      where: {
        and: [
          {sku: {inq: [skuName]}},
          {date: {gte: start_date}},
          {date: {lte: end_date}},
        ],
      },
      fields: {
        sku: true,
        impressions: true,
        clicks: true,
        spend: true,
        sales: true,
        orders: true,
      },
    };

    const usData = await this.amazonUSRepo.find(customFilter);
    const caData = await this.amazonCARepo.find(customFilter);
    const ukData = await this.amazonUKRepo.find(customFilter);
    const geData = await this.amazonGERepo.find(customFilter);
    const frData = await this.amazonFRRepo.find(customFilter);
    const itData = await this.amazonITRepo.find(customFilter);

    const combinedDataMap = new Map<string, CombinedSkuData>();

    // Process data from each platform and aggregate by SKU
    processPlatformData('amazonUS', usData, combinedDataMap);
    processPlatformData('amazonCA', caData, combinedDataMap);
    processPlatformData('amazonUK', ukData, combinedDataMap);
    processPlatformData('amazonGE', geData, combinedDataMap);
    processPlatformData('amazonFR', frData, combinedDataMap);
    processPlatformData('amazonIT', itData, combinedDataMap);

    // console.log(combinedDataMap);

    // Convert map values to an array
    // const combinedData = Array.from(combinedDataMap.values());

    // return combinedData;
    return Object.fromEntries(combinedDataMap);
  }
}
