interface GenericModel {
  sku: string;
  date: string;
  impressions: string;
  clicks: string;
  spend: string;
  sales: string;
  orders: string;
}

// Gives data for each sku. Skus is the basic entity here. All skus are combined.
export const CombineSameSkuData = async (data: any[]) => {
  const combinedData = new Map();

  // Group the data by date
  data.forEach((item: GenericModel) => {
    const sku = item.sku;
    const key = `${sku}`;

    if (combinedData.has(key)) {
      const existingItem = combinedData.get(key);
      existingItem.impressions += item.impressions;
      existingItem.clicks += item.clicks;
      existingItem.spend += item.spend;
      existingItem.sales += item.sales;
      existingItem.orders += item.orders;
    } else {
      combinedData.set(key, {
        sku: sku,
        impressions: item.impressions,
        clicks: item.clicks,
        spend: item.spend,
        sales: item.sales,
        orders: item.orders,
      });
    }
  });
  // }

  // Convert the Map to an array of combined data
  return [...combinedData.values()];
};
