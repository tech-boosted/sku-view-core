import {HttpErrors} from '@loopback/rest';
import axios from 'axios';
import qs from 'qs';
import {User} from '../../models';
import {ChannelsRepository} from '../../repositories';
const AMAZON_CLIENT_ID = process.env.AMAZON_CLIENT_ID;
const AMAZON_CLIENT_SECRECT = process.env.AMAZON_CLIENT_SECRECT;

const amazon_refresh_token_base_urls: {[key: string]: string} = {
  amazon_us: 'https://api.amazon.com/auth/o2/token',
  amazon_ca: 'https://api.amazon.com/auth/o2/token',
  amazon_uk: 'https://api.amazon.co.uk/auth/o2/token',
  amazon_ge: 'https://api.amazon.co.uk/auth/o2/token',
  amazon_fr: 'https://api.amazon.co.uk/auth/o2/token',
  amazon_it: 'https://api.amazon.co.uk/auth/o2/token',
};

export const GetAccessTokenWithRefreshToken = async (
  selectedUser: User,
  marketplace: string,
  refreshToken: string,
  channelsRepository: ChannelsRepository,
) => {
  const marketplace_access_token = marketplace + '_access_token';

  console.log('getting access token from refresh token');
  let data = qs.stringify({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: AMAZON_CLIENT_ID,
    client_secret: AMAZON_CLIENT_SECRECT,
  });

  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  await axios
    .post(amazon_refresh_token_base_urls[marketplace], data, {headers: headers})
    .then(async response => {
      console.log('Got access token from refresh token');
      let new_access_token = response.data.access_token;

      let customer_id = selectedUser?.customer_id;
      try {
        let updatedChannel = await channelsRepository.updateAll(
          {
            [marketplace_access_token]: new_access_token,
          },
          {
            customer_id: customer_id,
          },
        );

        if (updatedChannel.count === 1) {
          console.log('Successfully updated access token');
        } else {
          console.log('Failed to update access token');
        }
        return;
      } catch (err) {
        HttpErrors.InternalServerError('Access token update failed');
        return false;
      }
    })
    .catch(error => {
      console.log('failed access token from refresh token');
      console.log(error.response.data.error_description);
      return false;
    });
};
