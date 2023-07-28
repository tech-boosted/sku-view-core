export interface CombineSameSkuDateDataProps {
  sku: string;
  date: string;
  impressions: string;
  clicks: string;
  spend: string;
  sales: string;
  orders: string;
}

// Gives data for each Sku per date. Dates and Sku are the basic entity here. All campaigns are combined.
export const CombineSameSkuDateData = async (data: any[]) => {
  // Create a Map to store the combined data
  const combinedData = new Map();

  // Group the data by SKU and date
  data.forEach(item => {
    const sku = item.sku;
    const date = item.date;
    const key = `${sku}-${date}`;

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
        date: date,
        impressions: item.impressions,
        clicks: item.clicks,
        spend: item.spend,
        sales: item.sales,
        orders: item.orders,
      });
    }
  });

  // Convert the Map to an array of combined data
  return [...combinedData.values()];
};
