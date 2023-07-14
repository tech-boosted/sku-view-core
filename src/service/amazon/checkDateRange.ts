import {HttpErrors} from '@loopback/rest';
import {User} from '../../models';

export const checkDateRange = async (
  amazonDatesMetaDataRepository: any,
  desiredStartDate: string,
  desiredEndDate: string,
  selectedUser: User,
  connectedChannels: string[],
  connectedChannelsTableNames: string[],
) => {
  let customer_id = selectedUser.customer_id;

  try {
    let marketplace = '';
    let metaData;
    for (let i = 0; i < connectedChannels.length; i++) {
      marketplace = connectedChannels[i];
      metaData = await amazonDatesMetaDataRepository.find({
        where: {
          customer_id: customer_id,
          marketplace: marketplace,
        },
      });
      console.log(metaData && metaData[0]);

      let oldestDate = metaData[0].start_date;
      let latestDate = metaData[0].end_date;

      console.log(oldestDate);
      console.log(latestDate);
    }

    return true;
  } catch (err) {
    return HttpErrors.InternalServerError('Date range check failed');
  }
};
