import {getChannelsList} from './getChannelsList';

export const getConnectedChannelsList = async (
  channelsRepository: any,
  customer_id: string,
) => {
  let channels = await channelsRepository.findOne({
    where: {
      customer_id: customer_id,
    },
  });

  //@ts-ignore
  let userChannels = await getChannelsList(channels);
  let connectedChannels = [];
  for (const key in userChannels) {
    //@ts-ignore
    if (userChannels[key].connected) {
      connectedChannels.push(key);
    }
  }
  return connectedChannels;
};
