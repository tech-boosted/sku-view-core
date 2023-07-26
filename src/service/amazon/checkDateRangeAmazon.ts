import {HttpErrors} from '@loopback/rest';
import {Channels, User} from '../../models';

import {createReadStream, createWriteStream} from 'fs';
import zlib from 'zlib';
import {AmazonResponse} from '../../models/amazon-response-model';
import check_report_status from './checkReportStatus';
import {create_report} from './createReport';
import {download_report} from './downloadReport';
import {InsertBulkData} from './insertBulkData';

const AMAZON_FILE_DOWNLOAD_PATH = process.env.AMAZON_FILE_DOWNLOAD_PATH;

export const checkDateRangeAmazon = async (
  amazonDatesMetaDataRepository: any,
  desiredStartDate: string,
  desiredEndDate: string,
  selectedUser: User,
  connectedChannels: string[],
  connectedChannelsTableNames: string[],
  channelsRepository: any,
  amazonReportIdRepository: any,
  amazon_respositories: any,
) => {
  let customer_id = selectedUser.customer_id;

  console.log('desiredStartDate ' + desiredStartDate);
  console.log('desiredEndDate ' + desiredEndDate);

  let desiredEndDateObj = new Date(desiredEndDate);

  const today = new Date();
  const yesterday = new Date(today);
  today.setHours(0, 0, 0, 0);
  yesterday.setDate(today.getDate() - 1);

  desiredEndDateObj.setHours(0, 0, 0, 0);

  if (desiredEndDateObj.getTime() === today.getTime()) {
    console.log('desired end date is todays');
    let month = yesterday.getMonth() + 1 + '';
    if (yesterday.getMonth() + 1 < 10) {
      month = '0' + (yesterday.getMonth() + 1);
    }
    let yesterdayFormattedDate =
      yesterday.getFullYear() + '-' + month + '-' + yesterday.getDate();
    desiredEndDate = yesterdayFormattedDate;
  }

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

      let oldestDate = metaData[0].start_date;
      let latestDate = metaData[0].end_date;

      console.log('checking date range of ' + marketplace);
      console.log('DB_oldestDate: ', oldestDate);
      console.log('DB_latestDate: ', latestDate);
      console.log('checking start date: ' + desiredStartDate);
      console.log('checking end date: ' + desiredEndDate);

      let latestDateObj = new Date(latestDate);
      let desiredEndDateObj = new Date(desiredEndDate);

      if (desiredEndDateObj.getTime() > latestDateObj.getTime()) {
        console.log('latestDateObj: ', latestDateObj);
        latestDateObj.setDate(latestDateObj.getDate() + 1);
        console.log('date updated latestDateObj: ', latestDateObj);
        let month = latestDateObj.getMonth() + 1 + '';
        let date = latestDateObj.getDate() + '';
        console.log('date: ', date);
        if (latestDateObj.getDate() < 10) {
          date = '0' + latestDateObj.getDate();
        }
        if (latestDateObj.getMonth() + 1 < 10) {
          month = '0' + (latestDateObj.getMonth() + 1);
        }
        let updatedLatestDate =
          latestDateObj.getFullYear() + '-' + month + '-' + date;
        console.log('updatedLatestDate: ', updatedLatestDate);

        await amazonDatesMetaDataRepository.updateAll(
          {
            end_date: desiredEndDate,
          },
          {
            customer_id: customer_id,
            marketplace: marketplace,
          },
        );
        try {
          const marketplace_access_token = marketplace + '_access_token';
          const marketplace_refresh_token = marketplace + '_refresh_token';
          const marketplace_profile_id = marketplace + '_profile_id';

          const channels: Channels | null = await channelsRepository.findOne({
            where: {customer_id: selectedUser.customer_id},
          });

          //@ts-ignore
          let access_token = channels[marketplace_access_token];
          //@ts-ignore
          let refresh_token = channels[marketplace_refresh_token];
          //@ts-ignore
          let profile_id = channels[marketplace_profile_id];

          //@ts-ignore
          const download_path_zip = `${AMAZON_FILE_DOWNLOAD_PATH}/${selectedUser?.customer_id}_${startDate}_${endDate}_${marketplace}_${profile_id}.json.gz`;
          //@ts-ignore
          const download_path_json = `${AMAZON_FILE_DOWNLOAD_PATH}/${selectedUser?.customer_id}_${startDate}_${endDate}_${marketplace}_${profile_id}.json`;

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
          console.log(
            'creating report for dates: ',
            updatedLatestDate + ' - ' + desiredEndDate,
          );

          let reportId = await create_report(
            access_token,
            refresh_token,
            profile_id,
            updatedLatestDate,
            desiredEndDate,
            marketplace,
            marketplace_access_token,
            selectedUser,
            channelsRepository,
          );

          if (reportId) {
            await amazonReportIdRepository.create({
              customer_id: selectedUser.customer_id,
              report_id: reportId,
              start_date: updatedLatestDate,
              end_date: desiredEndDate,
              platform: marketplace,
              status: 'pending',
            });
            check_report_status(
              reportId,
              marketplace,
              profile_id,
              selectedUser,
              marketplace_access_token,
              channelsRepository,
              refresh_token,
            )
              .then(async zip_url => {
                if (zip_url === '') {
                  return {
                    status: false,
                    value: 'Request failed',
                  };
                }
                await amazonReportIdRepository.updateAll(
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
    }

    return true;
  } catch (err) {
    console.log(err);
    return HttpErrors.InternalServerError('Date range check failed');
  }
};
