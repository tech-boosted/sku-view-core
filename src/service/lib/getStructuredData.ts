import {SkuData} from '../../models/SkuData';

export interface UnStructuredDataProps {
  sku: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: string;
  sales: string;
  orders: string;
  campaignId: string;
  campaignName: string;
  platform: string;
}

export const getStructuredData = (
  unstructuredData: UnStructuredDataProps[],
) => {
  let newData: SkuData[] = [];

  unstructuredData.forEach(e => {
    let currentSku = e.sku;
    let existingSkuIndex = -1;
    let currentPlatform = e.platform;
    let existingPlatformIndex = -1;

    // Check if Sku already added
    for (let i = 0; i < newData.length; i++) {
      let element = newData[i];
      if (element.skuName === currentSku) {
        existingSkuIndex = i;
        return;
      }
    }

    // If Sku is already added then check if platform is already added
    if (existingSkuIndex !== -1) {
      for (let i = 0; i < newData[existingSkuIndex].platform.length; i++) {
        let element = newData[existingSkuIndex].platform[i];
        if (element.name === currentPlatform) {
          existingPlatformIndex = i;
          return;
        }
      }
    }

    const propertyMapping = {
      Impressions: 'impressions',
      Spend: 'spend',
      Clicks: 'clicks',
      Orders: 'orders',
      Sales: 'sales',
    };

    // If platform is added then add current data to it
    if (existingPlatformIndex !== -1) {
      for (
        let i = 0;
        i <
        newData[existingSkuIndex].platform[existingPlatformIndex].data.length;
        i++
      ) {
        const element =
          //@ts-ignore
          newData[existingSkuIndex].platform[existingPlatformIndex][i].data;
        for (let j = 0; j < element.length; j++) {
          const obj = element[j];
          //@ts-ignore
          const propertyName = propertyMapping[obj.property];
          if (propertyName && e.hasOwnProperty(propertyName)) {
            //@ts-ignore
            obj.data.push(e[propertyName]);
          }
        }
      }
    }

    // If Sku is not added
    if (existingSkuIndex === -1) {
      newData.push({
        skuName: currentSku,
        platform: [
          {
            name: String(currentPlatform),
            data: [
              {
                property: 'Impressions',
                data: [Number(e.impressions)],
              },
              {
                property: 'Spend',
                data: [Number(e.spend)],
              },
              {
                property: 'Clicks',
                data: [Number(e.clicks)],
              },
              {
                property: 'Orders',
                data: [Number(e.orders)],
              },
              {
                property: 'Sales',
                data: [Number(e.sales)],
              },
            ],
          },
        ],
      });
    } else {
      // If Platform is not added
      if (existingPlatformIndex === -1) {
        newData[existingSkuIndex].platform.push({
          name: String(currentPlatform),
          data: [
            {
              property: 'Impressions',
              data: [Number(e.impressions)],
            },
            {
              property: 'Spend',
              data: [Number(e.spend)],
            },
            {
              property: 'Clicks',
              data: [Number(e.clicks)],
            },
            {
              property: 'Orders',
              data: [Number(e.orders)],
            },
            {
              property: 'Sales',
              data: [Number(e.sales)],
            },
          ],
        });
      }
    }
  });
  return newData;
};
