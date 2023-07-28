import {Channels} from '../models';

export const getChannelsList = async (channels: Channels) => {
  let userChannels = {};

  for (let key in channels) {
    if (key.includes('_connected')) {
      let channel = key.slice(0, key.length - 10);
      //@ts-ignore
      let connected = channels[key];

      //@ts-ignore
      if (!userChannels[channel]) {
        //@ts-ignore
        userChannels[channel] = {
          connected: false,
          profile_id: '',
          profile_name: '',
        };
      }

      //@ts-ignore
      userChannels[channel].connected = connected;
    }

    if (key.includes('_profile_id')) {
      let channel = key.slice(0, key.length - 11);
      //@ts-ignore
      let profileId = channels[key];

      //@ts-ignore
      if (!userChannels[channel]) {
        //@ts-ignore
        userChannels[channel] = {
          connected: false,
          profile_id: '',
          profile_name: '',
        };
      }

      //@ts-ignore
      userChannels[channel].profile_id = profileId;
    }

    if (key.includes('_profile_name')) {
      let channel = key.slice(0, key.length - 13);
      //@ts-ignore
      let profileName = channels[key];

      //@ts-ignore
      if (!userChannels[channel]) {
        //@ts-ignore
        userChannels[channel] = {
          connected: false,
          profile_id: '',
          profile_name: '',
        };
      }

      //@ts-ignore
      userChannels[channel].profile_name = profileName;
    }
  }

  return userChannels;
};
