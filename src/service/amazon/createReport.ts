import {HttpErrors} from '@loopback/rest';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import {Channels, User} from '../../models';

import {GetAccessTokenWithRefreshToken} from './getAccessTokenWithRefreshToken';

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

export const create_report = async (
  access_token: string,
  refresh_token: string,
  profile_id: string,
  start_date: string,
  end_date: string,
  marketplace: string,
  marketplace_access_token: string,
  user: User,
  channelsRepository: any,
) => {
  // Generate report
  let reportId = '';
  let createReportCount = 2;

  while (createReportCount !== 0) {
    const channels: Channels | null = await channelsRepository.findOne({
      where: {customer_id: user.customer_id},
    });

    //@ts-ignore
    access_token = channels[marketplace_access_token];

    let requestData = JSON.stringify({
      name: 'SP Report Exmaple',
      startDate: start_date,
      endDate: end_date,
      configuration: {
        adProduct: 'SPONSORED_PRODUCTS',
        groupBy: ['advertiser'],
        columns: [
          'advertisedSku',
          'impressions',
          'clicks',
          'spend',
          'sales1d',
          'campaignId',
          'date',
          'campaignName',
          'unitsSoldSameSku1d',
        ],
        reportTypeId: 'spAdvertisedProduct',
        timeUnit: 'DAILY',
        format: 'GZIP_JSON',
      },
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: amazon_base_urls[marketplace] + '/reporting/reports',
      headers: {
        'Content-Type': 'application/vnd.createasyncreportrequest.v3+json',
        'Amazon-Advertising-API-ClientId': AMAZON_CLIENT_ID,
        'Amazon-Advertising-API-Scope': profile_id,
        Authorization: 'Bearer ' + access_token,
      },
      data: requestData,
    };

    console.log('creating report');

    await axios
      .request(config)
      .then(response => {
        reportId = response?.data.reportId;
        console.log('got report id');
        console.log('reportId: ', reportId);
        createReportCount = 0;
      })
      .catch(async error => {
        // console.log(config.url, ' : ', error.response);
        console.log('report generate failed');
        if (error.response.status == 401) {
          console.log('unauthorized to create report');
          await GetAccessTokenWithRefreshToken(
            user,
            marketplace,
            refresh_token,
            channelsRepository,
          );
          createReportCount -= 1;
        } else {
          console.log('Amazon: Failed to create report');
          throw new HttpErrors.Unauthorized();
        }
      });
  }
  return reportId;
};
