interface CombineSameDateDataProps {
  platformWiseData: [][];
}

interface GenericModel {
  sku: string;
  date: string;
  impressions: string;
  clicks: string;
  spend: string;
  sales: string;
  orders: string;
}

// Gives data for each date. Dates is the basic entity here. All skus are combined.
export const CombineSameDateData = async (data: any[]) => {
  const combinedData = new Map();

  // for (let i = 0; i < platformWiseData.length; i++) {
  //   const element = platformWiseData[i];

  // Create a Map to store the combined data

  // Group the data by date
  data.forEach((item: GenericModel) => {
    const date = item.date;
    const key = `${date}`;

    if (combinedData.has(key)) {
      const existingItem = combinedData.get(key);
      existingItem.impressions += item.impressions;
      existingItem.clicks += item.clicks;
      existingItem.spend += item.spend;
      existingItem.sales += item.sales;
      existingItem.orders += item.orders;
    } else {
      combinedData.set(key, {
        date: date,
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
