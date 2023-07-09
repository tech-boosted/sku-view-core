// Uncomment these imports to begin using these cool features!

import {repository} from '@loopback/repository';
import {HttpErrors, post, requestBody} from '@loopback/rest';
import axios from 'axios';
import jwt, {JwtPayload} from 'jsonwebtoken';
import qs from 'qs';
import {SkuView, User} from '../models';
import {SkuViewRepository, UserRepository} from '../repositories';

import {createReadStream, createWriteStream} from 'fs';
import * as stream from 'stream';
import {promisify} from 'util';
import zlib from 'zlib';
const finished = promisify(stream.finished);

const delay = (ms: number) => new Promise(res => setTimeout(res, ms * 1000));

//@ts-ignore
const secretKey: jwt.Secret = process.env.SECRETKEY;
const AMAZON_CLIENT_ID = process.env.AMAZON_CLIENT_ID;
const AMAZON_CLIENT_SECRECT = process.env.AMAZON_CLIENT_SECRECT;
const AMAZON_FILE_DOWNLOAD_PATH = process.env.AMAZON_FILE_DOWNLOAD_PATH;
const AMAZON_REPORT_CHECK_INTERVAL = Number(
  process.env.AMAZON_REPORT_CHECK_INTERVAL,
);

const startDate = '2023-07-01';
const endDate = '2023-07-01';

export class AmazonController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(SkuViewRepository)
    public skuViewRepository: SkuViewRepository,
  ) {}

  @post('/api/amazon/fetch')
  async fetchAmazonData(
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
    const userPlatform = 'amazon_na';
    const token = requestBody.token;

    if (!token) {
      throw new HttpErrors.Forbidden('A token is required for authentication');
    }

    try {
      const userInfo = jwt.verify(token, secretKey);
      console.log('userInfo: ', userInfo);
      //@ts-ignore
      const userId = userInfo?.user?.id;
      var access_token: string = '';

      const user: User = await this.userRepository.findById(
        //@ts-ignore
        userInfo?.user?.id,
      );
      if (!user) {
        throw new HttpErrors.NotFound('User not found');
      }

      //@ts-ignore
      access_token = user['amazon_na_access_token'];

      if (access_token !== '') {
        //@ts-ignore
        const download_path_zip = `${AMAZON_FILE_DOWNLOAD_PATH}/${user?.customer_id}.json.gz`;
        //@ts-ignore
        const download_path_json = `${AMAZON_FILE_DOWNLOAD_PATH}/${user?.customer_id}.json`;

        let reportId = await this.create_report(access_token, userInfo);
        // let reportId = '0fd0443d-f321-4f11-932a-7bafd1c95601';
        this.check_report_status(reportId, access_token, userInfo).then(
          zip_url => {
            const callback = () => {
              console.log('Download complete');
              var gunzip = zlib.createGunzip();
              var rstream = createReadStream(download_path_zip);
              var wstream = createWriteStream(download_path_json);
              rstream.pipe(gunzip).pipe(wstream);
              console.log('writing');
              wstream.on('finish', async () => {
                console.log('completed writing');
                let downloaded_data = await import(download_path_json);
                downloaded_data = downloaded_data.default;

                for (let i = 0; i < downloaded_data.length; i++) {
                  const x = downloaded_data[i];
                  let formattedDate = x.date;
                  // formattedDate;
                  //@ts-ignore
                  let newData: Omit<SkuView, 'id'> = {
                    customerId: Number(user?.customer_id),
                    sku: x.advertisedSku,
                    date: x.date,
                    platform: userPlatform,
                    impressions: x.impressions,
                    clicks: x.clicks,
                    spend: x.spend,
                    sales: x.sales1d,
                    orders: x.unitsSoldSameSku1d,
                    campaignId: x.campaignId,
                    campaignName: x.campaignName,
                  };
                  await this.skuViewRepository.create(newData);
                }
              });
            };

            this.download_report(zip_url ?? '', download_path_zip, callback);
          },
        );
      }
    } catch (err) {
      throw new HttpErrors.Unauthorized('Invalid Token');
    }

    return {
      message: 'Request received',
    };
  }

  create_report = async (
    access_token: string,
    userInfo: string | JwtPayload,
  ) => {
    let data = JSON.stringify({
      name: 'SP Report Exmaple',
      startDate: startDate,
      endDate: endDate,
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
      url: 'https://advertising-api.amazon.com/reporting/reports',
      headers: {
        'Content-Type': 'application/vnd.createasyncreportrequest.v3+json',
        'Amazon-Advertising-API-ClientId': AMAZON_CLIENT_ID,
        'Amazon-Advertising-API-Scope': '992771789726947',
        Authorization: 'Bearer ' + access_token,
      },
      data: data,
    };

    console.log('creating report');
    // Generate report
    let reportId = '';
    await axios
      .request(config)
      .then(response => {
        reportId = response.data.reportId;
        console.log('got report id');
        console.log('reportId: ', reportId);
      })
      .catch(async error => {
        console.log(config.url, ' : ', error.response.data);
        console.log('report generate failed');
        if (error.response.status == 401) {
          // var refreshToken =
          //   'Atzr|IwEBIPu2goeg7wEbx8n9icc_WPqbIN6MTMl6ZsE5nq0XFZIxVW0H7m4J6GcNCPYiSjN7k1u00pJSddC3st69aWrkdM_FBmEw8xVyB2wpIDIgQASvxq7gQW33v-rQB5H_al7lwJIl5OvnqQ2F1stKIxbRMRtaYjk8klB_dHNX18fZUPxKLT70N4bd-eWx5fed9k7Q5ic7Lz8owWUBQvH7kwlEnKW18cSHqc0LR-xNZbMm8JWTRNZ5fVVHz-cnKdQi60DOa13-uRm4N8nN5_kbBZU_9Wv3PC9okJsOZht2K94UR_Bh6_ewZLQ6oJ9L_pF7t00UecNTE9SYIkdl9qB1oOmTBHXDH4P85QMh15kN_AyXcfUACsvJ9czJ8lVmgtBrYes9t23BkLY5Md3a6ZN256gduKsVOfi0ln1lprSBzaPXrPvhIRwo5XaWlEnoNsxX9qA0AVIcownk_V-Eni3W20hfjp4u';
          // var new_access_token_result =
          //   await this.get_access_token_from_refresh_token(refreshToken);
          //   //@ts-ignore
          // if (new_access_token_result['status']) {
          //   //@ts-ignore
          //   var new_access_token = new_access_token_result['value'];
          // }
        }
      });
    return reportId;
  };

  check_report_status = async (
    reportId: any,
    access_token: string,
    userInfo: string | JwtPayload,
  ) => {
    var count = 10;
    var result;
    while (count != 0) {
      console.log('count: ', count);
      result = await this.call_report_status_api(reportId, access_token);
      console.log(result);
      if (result.status) {
        count = 0;
      } else {
        count -= 1;
        await delay(AMAZON_REPORT_CHECK_INTERVAL);
      }
    }

    if (result?.status) {
      return result.value;
    }
    return '';
  };

  call_report_status_api = async (reportId: string, access_token: string) => {
    let result = {status: false, value: null};
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://advertising-api.amazon.com/reporting/reports/' + reportId,
      headers: {
        'Content-Type': 'application/vnd.createasyncreportrequest.v3+json',
        'Amazon-Advertising-API-ClientId': AMAZON_CLIENT_ID,
        'Amazon-Advertising-API-Scope': '3999774442873617',
        Authorization: 'Bearer ' + access_token,
      },
    };

    // Check report status and download
    await axios
      .request(config)
      .then(response => {
        let fileStatus = response.data.status;
        let fileUrl = response.data.url;
        if (fileStatus != 'PENDING' && fileUrl != null) {
          console.log('fileUrl: ', fileUrl);
          result.status = true;
          result.value = fileUrl;
        } else {
          console.log('Still pending');
          result.status = false;
          result.value = null;
        }
      })
      .catch(error => {
        console.log(config.url, ' : ', error.data.message);
        console.log('report status failed');
        result.status = false;
        result.value = null;
      });
    return result;
  };

  download_report = (
    fileUrl: string,
    outputLocationPath: string,
    callback: () => void,
  ): Promise<any> => {
    const writer = createWriteStream(outputLocationPath);
    return axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    }).then(response => {
      response.data.pipe(writer);
      return finished(writer).then(callback); //this is a Promise
    });
  };

  get_access_token_from_refresh_token = async (refresh_token: string) => {
    var result;
    console.log('getting access token from refresh token');
    let data = qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
      client_id: AMAZON_CLIENT_ID,
      client_secret: AMAZON_CLIENT_SECRECT,
    });

    var headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    await axios
      .post('https://api.amazon.com/auth/o2/token', data, {headers: headers})
      .then(response => {
        console.log('Got access token from refresh token');
        result = {status: true, value: response.data.access_token};
      })
      .catch(error => {
        console.log('failed access token from refresh token');
        console.log(error.response.data.error_description);
        result = {status: false, value: error.response.data.error_description};
      });
    return result;
  };
}
