import {repository} from '@loopback/repository';
import {HttpErrors, post, requestBody} from '@loopback/rest';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import {Channels} from '../models';
import {
  AmazonDatesMetaDataRepository,
  AmazonReportIdRepository,
  ChannelsRepository,
  SkuViewRepository,
  UserRepository,
} from '../repositories';

import {createReadStream, createWriteStream} from 'fs';
import zlib from 'zlib';
import {AmazonResponse} from '../models/amazon-response-model';
import {
  AmazonCARepository,
  AmazonFRRepository,
  AmazonGERepository,
  AmazonITRepository,
  AmazonUKRepository,
  AmazonUSRepository,
} from '../repositories';
import {check_report_status, download_report, validateToken} from '../service';
import {create_report} from '../service/amazon/createReport';
import {InsertBulkData} from '../service/amazon/insertBulkData';

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
const amazon_country_code: {[key: string]: string} = {
  amazon_us: 'US',
  amazon_ca: 'CA',
  amazon_uk: 'UK',
  amazon_ge: 'DE',
  amazon_fr: 'FR',
  amazon_it: 'IT',
};

export class AmazonController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(SkuViewRepository)
    public skuViewRepository: SkuViewRepository,
    @repository(ChannelsRepository)
    public channelsRepository: ChannelsRepository,
    @repository(AmazonUSRepository)
    public amazonUSRepository: AmazonUSRepository,
    @repository(AmazonCARepository)
    public amazonCARepository: AmazonCARepository,
    @repository(AmazonUKRepository)
    public amazonUKRepository: AmazonUKRepository,
    @repository(AmazonGERepository)
    public amazonGERepository: AmazonGERepository,
    @repository(AmazonFRRepository)
    public amazonFRRepository: AmazonFRRepository,
    @repository(AmazonITRepository)
    public amazonITRepository: AmazonITRepository,
    @repository(AmazonDatesMetaDataRepository)
    public amazonDatesMetaDataRepository: AmazonDatesMetaDataRepository,
    @repository(AmazonReportIdRepository)
    public amazonReportIdRepository: AmazonReportIdRepository,
  ) {}

  // Fetch data from Amazon API and store in database
  @post('/api/amazon/fetch')
  async fetchAmazonData(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              token: {type: 'string'},
              marketplace: {type: 'string'},
              startDate: {type: 'string'},
              endDate: {type: 'string'},
            },
            required: ['token', 'marketplace', 'startDate', 'endDate'],
          },
        },
      },
    })
    requestBody: {
      token: string;
      marketplace: string;
      startDate: string;
      endDate: string;
    },
  ): Promise<any> {
    const marketplace_access_token = requestBody.marketplace + '_access_token';
    const marketplace_refresh_token =
      requestBody.marketplace + '_refresh_token';
    const marketplace_profile_id = requestBody.marketplace + '_profile_id';

    // '992771789726947'
    let selectedUser = await validateToken(
      requestBody.token,
      this.userRepository,
    );

    var access_token: string = '';
    var refresh_token: string = '';
    var profile_id: string = '';
    var startDate: string = '';
    var endDate: string = '';
    var marketplace: string = '';

    startDate = requestBody?.startDate;
    endDate = requestBody?.endDate;
    marketplace = requestBody.marketplace;

    const channels: Channels | null = await this.channelsRepository.findOne({
      where: {customer_id: selectedUser.customer_id},
    });

    //@ts-ignore
    access_token = channels[marketplace_access_token];
    //@ts-ignore
    refresh_token = channels[marketplace_refresh_token];
    //@ts-ignore
    profile_id = channels[marketplace_profile_id];

    if (access_token !== '') {
      //@ts-ignore
      const download_path_zip = `${AMAZON_FILE_DOWNLOAD_PATH}/${selectedUser?.customer_id}_${profile_id}.json.gz`;
      //@ts-ignore
      const download_path_json = `${AMAZON_FILE_DOWNLOAD_PATH}/${selectedUser?.customer_id}_${profile_id}.json`;

      const callback = () => {
        const amazon_respositories: {[key: string]: any} = {
          amazon_us: this.amazonUSRepository,
          amazon_ca: this.amazonCARepository,
          amazon_uk: this.amazonUKRepository,
          amazon_ge: this.amazonGERepository,
          amazon_fr: this.amazonFRRepository,
          amazon_it: this.amazonITRepository,
        };
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

          let newData: {}[] = [];

          for (let i = 0; i < downloaded_data.length; i++) {
            const x: AmazonResponse = downloaded_data[i];
            let formattedDate = x.date;
            //@ts-ignore
            newData.push({
              customer_id: Number(selectedUser?.customer_id),
              sku: x.advertisedSku,
              date: x.date,
              impressions: x.impressions,
              clicks: x.clicks,
              spend: x.spend,
              sales: x.sales1d,
              orders: x.unitsSoldSameSku1d,
              campaignId: x.campaignId,
              campaignName: x.campaignName,
              profileId: profile_id,
            });
          }

          InsertBulkData(
            amazon_respositories[marketplace],
            //@ts-ignore
            newData,
          );
        });
      };

      try {
        let reportId = await create_report(
          access_token,
          refresh_token,
          profile_id,
          startDate,
          endDate,
          marketplace,
          marketplace_access_token,
          selectedUser,
          this.channelsRepository,
        );

        if (reportId) {
          await this.amazonReportIdRepository.create({
            customer_id: selectedUser.customer_id,
            report_id: reportId,
            start_date: startDate,
            end_date: endDate,
            platform: marketplace,
            status: 'pending',
          });
          check_report_status(
            reportId,
            marketplace,
            profile_id,
            selectedUser,
            marketplace_access_token,
            this.channelsRepository,
            refresh_token,
          )
            .then(async zip_url => {
              if (zip_url === '') {
                return {
                  status: false,
                  value: 'Request failed',
                };
              }
              await this.amazonReportIdRepository.updateAll(
                {
                  status: 'completed',
                },
                {
                  customer_id: selectedUser.customer_id,
                  //@ts-ignore
                  report_id: reportId,
                },
              );
              download_report(zip_url, download_path_zip, callback);
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          return {
            status: false,
            value: 'Request failed',
          };
        }
      } catch (err) {
        console.log(err);
      }
    }

    return {
      status: true,
      value: 'Request received',
    };
  }

  @post('/api/amazon/setStartEndDate')
  async setStartEndDate(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              token: {type: 'string'},
              marketplace: {type: 'string'},
              startDate: {type: 'string'},
              endDate: {type: 'string'},
            },
            required: ['token', 'marketplace', 'startDate', 'endDate'],
          },
        },
      },
    })
    requestBody: {
      token: string;
      marketplace: string;
      startDate: string;
      endDate: string;
    },
  ): Promise<any> {
    let marketplace = requestBody.marketplace;
    let startDate = requestBody.startDate;
    let endDate = requestBody.endDate;

    let selectedUser = await validateToken(
      requestBody.token,
      this.userRepository,
    );
    console.log('setting start date end date');
    console.log('startDate: ', startDate);
    console.log('endDate: ', endDate);

    return this.amazonDatesMetaDataRepository.create({
      customer_id: selectedUser.customer_id,
      marketplace: marketplace,
      start_date: startDate,
      end_date: endDate,
    });
  }

  @post('/api/amazon/profiles')
  async fetchAmazonProfiles(
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
      token: string;
      marketplace: string;
    },
  ): Promise<any> {
    console.log(requestBody);

    const marketplace_connected = requestBody.marketplace + '_connected';
    const marketplace_profile_id = requestBody.marketplace + '_profile_id';
    const marketplace_access_token = requestBody.marketplace + '_access_token';

    let selectedUser = await validateToken(
      requestBody.token,
      this.userRepository,
    );
    //@ts-ignore
    const customer_id: number = selectedUser?.customer_id;

    try {
      // Use the findById method to retrieve the record
      //@ts-ignore
      const channels: Channels | null = await this.channelsRepository.findOne({
        where: {customer_id: customer_id},
      });

      if (channels) {
        //@ts-ignore
        if (channels[marketplace_connected]) {
          //@ts-ignore
          if (!channels[marketplace_profile_id]) {
            let base_url = amazon_base_urls[requestBody.marketplace];

            //@ts-ignore
            let access_token = channels[marketplace_access_token];
            let headers = {
              'Amazon-Advertising-API-ClientId': AMAZON_CLIENT_ID,
              Authorization: 'Bearer ' + access_token,
            };
            let response;
            let result: any[] = [];
            try {
              await axios
                .get(base_url + '/v2/profiles', {headers: headers})
                .then(res => {
                  console.log('Got profiles');
                  for (let i = 0; i < res?.data.length; i++) {
                    const element = res?.data[i];
                    if (
                      element['countryCode'] ===
                      amazon_country_code[requestBody.marketplace]
                    ) {
                      result.push(element);
                    }
                  }
                  response = {status: true, value: result};
                })
                .catch(err => {
                  console.log('ef');
                  if (err.response.status == 401) {
                    // access_token expired
                    console.log('profile failure 401');
                    response = {status: false, value: err.response.status};
                  } else {
                    response = {
                      status: false,
                      value: err.response.statusText,
                    };
                  }
                });
              return response;
            } catch (err) {
              return new HttpErrors.InternalServerError('Something went wrong');
            }
          } else {
            console.log('Profile id exists');
            return new HttpErrors.InternalServerError('Something went wrong');
          }
        } else {
          return new HttpErrors.MethodNotAllowed(
            'Please connect to platform first',
          );
        }
      } else {
        console.log('Channel not found');
        return new HttpErrors.InternalServerError('Something went wrong');
      }
    } catch (err) {
      console.log('channels fetch failed: ', err);
      throw new HttpErrors.InternalServerError('Something went wrong');
    }
  }

  @post('/api/amazon/setProfile')
  async setProfile(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              token: {type: 'string'},
              marketplace: {type: 'string'},
              profileId: {type: 'string'},
            },
            required: ['token', 'marketplace', 'profileId'],
          },
        },
      },
    })
    requestBody: {
      token: string;
      marketplace: string;
      profileId: string;
    },
  ): Promise<any> {
    const marketplace_profile_id = requestBody.marketplace + '_profile_id';

    let selectedUser = await validateToken(
      requestBody.token,
      this.userRepository,
    );
    let customer_id = selectedUser?.customer_id;
    let result;
    try {
      let updatedChannel = await this.channelsRepository.updateAll(
        {
          [marketplace_profile_id]: requestBody?.profileId,
        },
        {
          customer_id: customer_id,
        },
      );

      if (updatedChannel.count === 1) {
        result = 'Successfully updated profile id';
        return {status: true, value: result};
      } else {
        result = 'Failed to update profiel id';
        return {status: false, value: result};
      }
    } catch (err) {
      HttpErrors.InternalServerError('Profile id update failed');
    }
  }
}
