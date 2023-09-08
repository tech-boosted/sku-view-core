import {
  AmazonCARepository,
  AmazonFRRepository,
  AmazonGERepository,
  AmazonITRepository,
  AmazonUKRepository,
  AmazonUSRepository,
} from '../../repositories';
import {CombineSameDateData} from '../lib';

interface DateRange {
  startDate: string;
  endDate: string;
}

export interface historicalTrendProps {
  amazonUSRepository: AmazonUSRepository;
  amazonUKRepository: AmazonUKRepository;
  amazonCARepository: AmazonCARepository;
  amazonGERepository: AmazonGERepository;
  amazonFRRepository: AmazonFRRepository;
  amazonITRepository: AmazonITRepository;
  startDateRange: DateRange;
  endDateRange: DateRange;
  customer_id: number | undefined;
  specificSKUs: string[];
}

export const historicalTrend = async ({
  amazonUSRepository,
  amazonUKRepository,
  amazonCARepository,
  amazonGERepository,
  amazonFRRepository,
  amazonITRepository,
  startDateRange,
  endDateRange,
  customer_id,
  specificSKUs,
}: historicalTrendProps) => {
  const customFilter1 = {
    where: {
      and: [
        {date: {gte: startDateRange.startDate}},
        {date: {lte: startDateRange.endDate}},
        {customer_id: customer_id},
        {sku: {inq: specificSKUs}},
      ],
    },
    fields: {
      sku: true,
      impressions: true,
      clicks: true,
      spend: true,
      sales: true,
      orders: true,
      date: true,
    },
    order: ['date ASC'],
  };

  // Fetch data from each table
  const amazonUSData1 = await amazonUSRepository.find(customFilter1);
  const amazonUKData1 = await amazonUKRepository.find(customFilter1);
  const amazonCAData1 = await amazonCARepository.find(customFilter1);
  const amazonGEData1 = await amazonGERepository.find(customFilter1);
  const amazonFRData1 = await amazonFRRepository.find(customFilter1);
  const amazonITData1 = await amazonITRepository.find(customFilter1);

  const UScombinedSameDateData1 = await CombineSameDateData(amazonUSData1);
  const UKcombinedSameDateData1 = await CombineSameDateData(amazonUKData1);
  const CAcombinedSameDateData1 = await CombineSameDateData(amazonCAData1);
  const GEcombinedSameDateData1 = await CombineSameDateData(amazonGEData1);
  const FRcombinedSameDateData1 = await CombineSameDateData(amazonFRData1);
  const ITcombinedSameDateData1 = await CombineSameDateData(amazonITData1);

  const customFilter2 = {
    where: {
      and: [
        {date: {gte: endDateRange.startDate}},
        {date: {lte: endDateRange.endDate}},
        {customer_id: customer_id},
        {sku: {inq: specificSKUs}},
      ],
    },
    fields: {
      sku: true,
      impressions: true,
      clicks: true,
      spend: true,
      sales: true,
      orders: true,
      date: true,
    },
    order: ['date ASC'],
  };

  // Fetch data from each table
  const amazonUSData2 = await amazonUSRepository.find(customFilter2);
  const amazonUKData2 = await amazonUKRepository.find(customFilter2);
  const amazonCAData2 = await amazonCARepository.find(customFilter2);
  const amazonGEData2 = await amazonGERepository.find(customFilter2);
  const amazonFRData2 = await amazonFRRepository.find(customFilter2);
  const amazonITData2 = await amazonITRepository.find(customFilter2);

  const UScombinedSameDateData2 = await CombineSameDateData(amazonUSData2);
  const UKcombinedSameDateData2 = await CombineSameDateData(amazonUKData2);
  const CAcombinedSameDateData2 = await CombineSameDateData(amazonCAData2);
  const GEcombinedSameDateData2 = await CombineSameDateData(amazonGEData2);
  const FRcombinedSameDateData2 = await CombineSameDateData(amazonFRData2);
  const ITcombinedSameDateData2 = await CombineSameDateData(amazonITData2);

  return {
    month1: {
      amazonUSData: UScombinedSameDateData1,
      amazonUKData: UKcombinedSameDateData1,
      amazonCAData: CAcombinedSameDateData1,
      amazonGEData: GEcombinedSameDateData1,
      amazonFRData: FRcombinedSameDateData1,
      amazonITData: ITcombinedSameDateData1,
    },
    month2: {
      amazonUSData: UScombinedSameDateData2,
      amazonUKData: UKcombinedSameDateData2,
      amazonCAData: CAcombinedSameDateData2,
      amazonGEData: GEcombinedSameDateData2,
      amazonFRData: FRcombinedSameDateData2,
      amazonITData: ITcombinedSameDateData2,
    },
  };
};
