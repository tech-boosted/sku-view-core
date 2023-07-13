import {HttpErrors} from '@loopback/rest';

export const checkDateRange = async (
  amazonDatesMetaDataRepository: any,
  desiredStartDate: string,
  desiredEndDate: string,
) => {
  try {
    const existingRanges = await amazonDatesMetaDataRepository.find({
      where: {
        start_date: {lte: desiredEndDate},
      },
    });

    if (existingRanges.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return HttpErrors.InternalServerError('Date range check failed');
  }
};
