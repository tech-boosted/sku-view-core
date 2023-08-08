import {readFileSync} from 'fs';
import {ApplicationConfig, SkuViewCoreApplication} from './application';
const dotenv = require('dotenv').config();

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new SkuViewCoreApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

const prodVariables =
  process.env.ENV === 'dev'
    ? {}
    : {
        openApiSpec: {
          disabled: true,
        },
        apiExplorer: {
          disabled: true,
        },
        protocol: 'https',
        key: readFileSync('/var/www/acros.key'),
        cert: readFileSync('/var/www/acros_cert_chain.crt'),
      };

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3001),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      ...prodVariables,
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
