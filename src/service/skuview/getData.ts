// @post('/api/data')
// async getData(
//   @requestBody({
//     content: {
//       'application/json': {
//         schema: {
//           type: 'object',
//           properties: {
//             startDate: {type: 'string'},
//             endDate: {type: 'string'},
//             token: {type: 'string'},
//           },
//           required: ['startDate', 'endDate', 'token'],
//         },
//       },
//     },
//   })
//   body: {
//     startDate: string;
//     endDate: string;
//     token: string;
//   },
// ): Promise<any[]> {
//   console.log('body: ', body);
//   const token = body.token;
//   const startDate = body.startDate;
//   const endDate = body.endDate;
//   var result: SkuData[] = [];
//   if (!token) {
//     throw new HttpErrors.Forbidden('A token is required for authentication');
//   }

//   try {
//     const userInfo = jwt.verify(token, secretKey);
//     const user: User = await this.userRepository.findById(
//       //@ts-ignore
//       userInfo?.user?.id,
//     );
//     if (!user) {
//       throw new HttpErrors.NotFound('User not found');
//     }
//     const query: Filter<SkuView> = {
//       where: {
//         customer_id: user.customer_id,
//         platform: 'amazon_na',
//         date: {
//           between: [startDate, endDate],
//         },
//       },
//     };
//     query.order = ['date ASC'];
//     let temp = await this.skuViewRepository.find(query);

//     let newData: SkuData[] = [];

//     temp.forEach(e => {
//       let currentSku = e.sku;
//       let existingSkuIndex = -1;
//       let currentPlatform = e.platform;
//       let existingPlatformIndex = -1;

//       // Check if Sku already added
//       for (let i = 0; i < newData.length; i++) {
//         let element = newData[i];
//         if (element.skuName === currentSku) {
//           existingSkuIndex = i;
//           return;
//         }
//       }

//       // If Sku is already added then check if platform is already added
//       if (existingSkuIndex !== -1) {
//         for (let i = 0; i < newData[existingSkuIndex].platform.length; i++) {
//           let element = newData[existingSkuIndex].platform[i];
//           if (element.name === currentPlatform) {
//             existingPlatformIndex = i;
//             return;
//           }
//         }
//       }

//       const propertyMapping = {
//         Impressions: 'impressions',
//         Spend: 'spend',
//         Clicks: 'clicks',
//         Orders: 'orders',
//         Sales: 'sales',
//       };

//       // If platform is added then add current data to it
//       if (existingPlatformIndex !== -1) {
//         for (
//           let i = 0;
//           i <
//           newData[existingSkuIndex].platform[existingPlatformIndex].data
//             .length;
//           i++
//         ) {
//           const element =
//             //@ts-ignore
//             newData[existingSkuIndex].platform[existingPlatformIndex][i].data;
//           for (let j = 0; j < element.length; j++) {
//             const obj = element[j];
//             //@ts-ignore
//             const propertyName = propertyMapping[obj.property];
//             if (propertyName && e.hasOwnProperty(propertyName)) {
//               //@ts-ignore
//               obj.data.push(e[propertyName]);
//             }
//           }
//         }
//       }

//       // If Sku is not added
//       if (existingSkuIndex === -1) {
//         newData.push({
//           skuName: currentSku,
//           platform: [
//             {
//               name: String(currentPlatform),
//               data: [
//                 {
//                   property: 'Impressions',
//                   data: [Number(e.impressions)],
//                 },
//                 {
//                   property: 'Spend',
//                   data: [Number(e.spend)],
//                 },
//                 {
//                   property: 'Clicks',
//                   data: [Number(e.clicks)],
//                 },
//                 {
//                   property: 'Orders',
//                   data: [Number(e.orders)],
//                 },
//                 {
//                   property: 'Sales',
//                   data: [Number(e.sales)],
//                 },
//               ],
//             },
//           ],
//         });
//       } else {
//         // If Platform is not added
//         if (existingPlatformIndex === -1) {
//           newData[existingSkuIndex].platform.push({
//             name: String(currentPlatform),
//             data: [
//               {
//                 property: 'Impressions',
//                 data: [Number(e.impressions)],
//               },
//               {
//                 property: 'Spend',
//                 data: [Number(e.spend)],
//               },
//               {
//                 property: 'Clicks',
//                 data: [Number(e.clicks)],
//               },
//               {
//                 property: 'Orders',
//                 data: [Number(e.orders)],
//               },
//               {
//                 property: 'Sales',
//                 data: [Number(e.sales)],
//               },
//             ],
//           });
//         }
//       }

//       result = newData;
//     });
//   } catch (err) {
//     // throw new HttpErrors.Unauthorized('Invalid Token');
//     console.log(err);
//   }
//   return result;
// }
