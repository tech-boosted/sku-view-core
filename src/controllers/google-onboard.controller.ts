// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  Response,
  RestBindings,
  get,
  param,
  post,
  requestBody,
} from '@loopback/rest';
import {google} from 'googleapis';
import {ChannelsRepository, UserRepository} from '../repositories';
import {validateToken} from '../service';

var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;
var CLIENT_GOOGLE_SUCCESS_URL = process.env.CLIENT_GOOGLE_SUCCESS_URL;
var CLIENT_GOOGLE_FAIL_URL = process.env.CLIENT_GOOGLE_FAIL_URL;

const google_auth_url = 'https://accounts.google.com/o/oauth2/v2/auth';
const google_scope_url = 'https://accounts.google.com/o/oauth2/v2/auth';

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URL,
);

export class GoogleOnboardController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(ChannelsRepository)
    public channelsRepository: ChannelsRepository,
  ) {}

  //Generate Login with Amazon URL
  @post('/api/google/link')
  async linkGoogleAccount(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              token: {type: 'string'},
            },
            required: ['token'],
          },
        },
      },
    })
    requestBody: {
      token: string;
    },
  ): Promise<any> {
    await validateToken(requestBody.token, this.userRepository);

    const loginWithGoogleUrl =
      google_auth_url +
      '?scope=' +
      google_scope_url +
      '&access_type=offline&include_granted_scopes=true&response_type=code&state=' +
      requestBody.token +
      '&redirect_uri=' +
      GOOGLE_REDIRECT_URL +
      '&client_id=' +
      GOOGLE_CLIENT_ID;

    //https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/adwords&
    //access_type=offline&include_granted_scopes=true&response_type=code&state={}&redirect_uri={{REDIRECT_URI}}&client_id={{CLIENT_ID}}
    return loginWithGoogleUrl;
  }

  @get('/api/google/callback')
  async callbackGoogleAccount(
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @param.query.string('code') code: string,
    @param.query.string('state') state: string,
    @param.query.string('error') error: string,
  ): Promise<any> {
    if (error) {
      console.log(error);
      return response.redirect(String(CLIENT_GOOGLE_FAIL_URL));
    }
    var user_token = JSON.parse(state).token;

    let selectedUser = await validateToken(user_token, this.userRepository);
    let customer_id = selectedUser?.customer_id;

    let {tokens} = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    var access_token = tokens.access_token;
    var refresh_token = tokens.refresh_token;

    let updatedChannel = await this.channelsRepository.updateAll(
      {
        google_refresh_token: refresh_token ?? '',
        google_access_token: access_token ?? '',
        google_connected: true,
      },
      {
        customer_id: customer_id,
      },
    );

    if (updatedChannel.count === 1) {
      console.log('Successfully updated access/refresh token');
      return response.redirect(String(CLIENT_GOOGLE_SUCCESS_URL));
    } else {
      console.log('Failed to update access/refresh token');
      return response.redirect(String(CLIENT_GOOGLE_FAIL_URL));
    }
  }
}
