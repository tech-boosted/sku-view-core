import axios from 'axios';
import jwt from 'jsonwebtoken';
import {Channels, User} from '../../models';
import {GetAccessTokenWithRefreshToken} from './getAccessTokenWithRefreshToken';
const dotenv = require('dotenv').config();

const delay = (ms: number) => new Promise(res => setTimeout(res, ms * 1000));

//@ts-ignore
const secretKey: jwt.Secret = process.env.SECRETKEY;
const AMAZON_CLIENT_ID = process.env.AMAZON_CLIENT_ID;
const AMAZON_CLIENT_SECRECT = process.env.AMAZON_CLIENT_SECRECT;
const AMAZON_FILE_DOWNLOAD_PATH = process.env.AMAZON_FILE_DOWNLOAD_PATH;
const AMAZON_REPORT_CHECK_INTERVAL = Number(
  process.env.AMAZON_REPORT_CHECK_INTERVAL,
);

const amazon_base_urls: {[key: string]: string} = {
  amazon_us: 'https://advertising-api.amazon.com',
  amazon_ca: 'https://advertising-api.amazon.com',
  amazon_uk: 'https://advertising-api-eu.amazon.com',
  amazon_ge: 'https://advertising-api-eu.amazon.com',
  amazon_fr: 'https://advertising-api-eu.amazon.com',
  amazon_it: 'https://advertising-api-eu.amazon.com',
};

export const call_report_status_api = async (
  reportId: string,
  marketplace: string,
  profile_id: string,
  selectedUser: User,
  marketplace_access_token: string,
  channelsRepository: any,
  refresh_token: string,
): Promise<{status: boolean; value: any}> => {
  const channels: Channels | null = await channelsRepository.findOne({
    where: {customer_id: selectedUser.customer_id},
  });

  //@ts-ignore
  let access_token = channels[marketplace_access_token];

  let result = {status: false, value: null};
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: amazon_base_urls[marketplace] + '/reporting/reports/' + reportId,
    headers: {
      'Content-Type': 'application/vnd.createasyncreportrequest.v3+json',
      'Amazon-Advertising-API-ClientId': AMAZON_CLIENT_ID,
      'Amazon-Advertising-API-Scope': profile_id,
      Authorization: 'Bearer ' + access_token,
    },
  };
  console.log('calling status check API: ', reportId);

  // Check report status and download
  await axios
    .request(config)
    .then(response => {
      let fileStatus = response.data.status;
      let fileUrl = response.data.url;
      if (fileStatus != 'PENDING' && fileUrl != null) {
        result.status = true;
        result.value = fileUrl;
      } else {
        console.log('Still pending');
        result.status = false;
        result.value = null;
      }
    })
    .catch(async error => {
      console.log('reportId -', config.url, ' : ', error.data);
      console.log('report status failed');
      if (error.response.status == 401) {
        console.log('unauthorized to create report');
        await GetAccessTokenWithRefreshToken(
          selectedUser,
          marketplace,
          refresh_token,
          channelsRepository,
        );
      }
      result.status = false;
      result.value = null;
    });
  return result;
};

export const check_report_status = (
  reportId: any,
  marketplace: string,
  profile_id: string,
  selectedUser: User,
  marketplace_access_token: string,
  channelsRepository: any,
  refresh_token: string,
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    var count = 15;
    while (count != 0) {
      console.log('count: ', count);
      let result = await call_report_status_api(
        reportId,
        marketplace,
        profile_id,
        selectedUser,
        marketplace_access_token,
        channelsRepository,
        refresh_token,
      );

      if (result.status) {
        count = 0;
        resolve(result.value);
      } else {
        count -= 1;
        await delay(AMAZON_REPORT_CHECK_INTERVAL);
      }
    }
    reject('');
  });
};

export default check_report_status;
