import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  get,
  param,
  post,
  requestBody,
  Response,
  RestBindings,
} from '@loopback/rest';
import axios from 'axios';
import {ChannelsRepository, UserRepository} from '../repositories';
import {validateToken} from '../service';
const qs = require('qs');

const AMAZON_CLIENT_ID = process.env.AMAZON_CLIENT_ID;
const AMAZON_REDIRECT_URL = process.env.AMAZON_REDIRECT_URL;
const AMAZON_CLIENT_SECRECT = process.env.AMAZON_CLIENT_SECRECT;
const CLIENT_AMAZON_SUCCESS_URL = process.env.CLIENT_AMAZON_SUCCESS_URL;
const CLIENT_AMAZON_FAIL_URL = process.env.CLIENT_AMAZON_FAIL_URL;

const amazon_base_urls: {[key: string]: string} = {
  amazon_us: 'https://www.amazon.com/ap/oa',
  amazon_ca: 'https://www.amazon.com/ap/oa',
  amazon_uk: 'https://eu.account.amazon.com/ap/oa',
  amazon_ge: 'https://eu.account.amazon.com/ap/oa',
  amazon_fr: 'https://eu.account.amazon.com/ap/oa',
  amazon_it: 'https://eu.account.amazon.com/ap/oa',
};

const amazon_access_token_base_urls: {[key: string]: string} = {
  amazon_us: 'https://api.amazon.com/auth/o2/token',
  amazon_ca: 'https://api.amazon.com/auth/o2/token',
  amazon_uk: 'https://api.amazon.co.uk/auth/o2/token',
  amazon_ge: 'https://api.amazon.co.uk/auth/o2/token',
  amazon_fr: 'https://api.amazon.co.uk/auth/o2/token',
  amazon_it: 'https://api.amazon.co.uk/auth/o2/token',
};

const amazon_marketplaces = [
  'amazon_us',
  'amazon_ca',
  'amazon_uk',
  'amazon_ge',
  'amazon_fr',
  'amazon_it',
];

const updateTokensOfAllAmazons = (
  access_token: string,
  refresh_token: string,
) => {
  let tokensInsertedData = {};
  for (let i = 0; i < amazon_marketplaces.length; i++) {
    tokensInsertedData = {
      ...tokensInsertedData,
      [amazon_marketplaces[i] + '_access_token']: access_token,
      [amazon_marketplaces[i] + '_refresh_token']: refresh_token,
      [amazon_marketplaces[i] + '_connected']: true,
    };
  }
  console.log('tokensInsertedData: ', tokensInsertedData);
  return tokensInsertedData;
};

export class AmazonOnboardController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(ChannelsRepository)
    public channelsRepository: ChannelsRepository,
  ) {}

  //Generate Login with Amazon URL
  @post('/api/amazon/link')
  async linkAmazonAccount(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              token: {type: 'string'},
              marketplace: {type: 'string'},
            },
            required: ['token', 'marketplace'],
          },
        },
      },
    })
    requestBody: {
      marketplace: string;
      token: string;
    },
  ): Promise<any> {
    let selectedUser = await validateToken(
      requestBody.token,
      this.userRepository,
    );

    const loginWithAmazonUrl =
      amazon_base_urls[requestBody.marketplace] +
      '?client_id=' +
      AMAZON_CLIENT_ID +
      '&scope=advertising::campaign_management&response_type=code&state=[' +
      requestBody.token +
      ',' +
      requestBody.marketplace +
      ']&redirect_uri=' +
      AMAZON_REDIRECT_URL;

    return {url: loginWithAmazonUrl};
  }

  // Callback for Amazon
  @get('/api/amazon/callback')
  async callbackAmazonAccount(
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @param.query.string('code') code: string,
    @param.query.string('state') state: string,
    @param.query.string('error') error: string,
  ): Promise<any> {
    if (error) {
      console.log(error);
      return response.redirect(String(CLIENT_AMAZON_FAIL_URL));
    }

    var cleanedString = state.slice(1, -1);
    var elements = cleanedString.split(',');

    try {
      let token = elements[0];
      let marketplace = elements[1];

      const marketplace_access_token = marketplace + '_access_token';
      const marketplace_refresh_token = marketplace + '_refresh_token';
      const marketplace_connected = marketplace + '_connected';

      let selectedUser = await validateToken(token, this.userRepository);

      let data = qs.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: AMAZON_REDIRECT_URL,
        client_id: AMAZON_CLIENT_ID,
        client_secret: AMAZON_CLIENT_SECRECT,
      });
      let access_token_url = amazon_access_token_base_urls[marketplace];
      let headers = {'Content-Type': 'application/x-www-form-urlencoded'};

      await axios
        .post(access_token_url, data, {headers: headers})
        .then(async token_response => {
          var access_token = token_response.data.access_token;
          var refresh_token = token_response.data.refresh_token;

          let customer_id = selectedUser?.customer_id;

          // If only one refresh and one access token is required for all the amazon marketplaces
          // let tokensInsertedData = updateTokensOfAllAmazons(
          //   access_token,
          //   refresh_token,
          // );
          // let updatedChannel = await this.channelsRepository.updateAll(
          //   tokensInsertedData,
          //   {
          //     customer_id: customer_id,
          //   },
          // );

          // If there are different access tokens and refresh tokens for all the amazon marketplaces
          let updatedChannel = await this.channelsRepository.updateAll(
            {
              [marketplace_refresh_token]: refresh_token,
              [marketplace_access_token]: access_token,
              [marketplace_connected]: true,
            },
            {
              customer_id: customer_id,
            },
          );

          if (updatedChannel.count === 1) {
            console.log('Successfully updated access/refresh token');
            return response.redirect(
              String(CLIENT_AMAZON_SUCCESS_URL + '/' + marketplace),
            );
          } else {
            console.log('Failed to update access/refresh token');
            return response.redirect(
              String(CLIENT_AMAZON_FAIL_URL + '/' + marketplace),
            );
          }
        })
        .catch(err => {
          console.log(err.response);
          return response.redirect(
            String(CLIENT_AMAZON_FAIL_URL + '/' + marketplace),
          );
        });
    } catch (err) {
      console.log(err);
      return response.redirect(String(CLIENT_AMAZON_FAIL_URL));
    }
  }
}
