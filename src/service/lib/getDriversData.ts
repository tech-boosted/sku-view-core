import {CombineSameSkuData} from './combineSameSkuData';

export const getDriversData = (monthDataOne: any[], monthDataTwo: any[]) => {
  return [
    {
      startMonth: CombineSameSkuData(monthDataOne),
    },
    {
      endMonth: CombineSameSkuData(monthDataTwo),
    },
  ];
};
