export const InsertBulkData = async (selectedRespository: any, data: any) => {
  try {
    console.log('inserting data into table');
    await selectedRespository.createAll(data);
    console.log('done inserting data');
    return;
  } catch (err) {
    console.log(err);
    console.log('Could not insert data in amazon: ');
    return;
  }
};
