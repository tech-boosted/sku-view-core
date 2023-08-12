import {CombineSameSkuData} from './combineSameSkuData';

export const getDriversData = async (
  monthDataOne: any[],
  monthDataTwo: any[],
) => {
  return [
    {
      startMonth: await CombineSameSkuData(monthDataOne),
    },
    {
      endMonth: await CombineSameSkuData(monthDataTwo),
    },
  ];
};
