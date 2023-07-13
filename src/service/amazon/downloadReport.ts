import axios from 'axios';
import {createWriteStream} from 'fs';
import * as stream from 'stream';
import {promisify} from 'util';

const finished = promisify(stream.finished);

export const download_report = (
  fileUrl: string,
  outputLocationPath: string,
  callback: () => void,
) => {
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
