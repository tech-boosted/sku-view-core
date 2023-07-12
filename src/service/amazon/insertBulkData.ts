export const InsertBulkData = async (selectedRespository: any, data: any) => {
  try {
    console.log('inserting data into table');
    let response = await selectedRespository.createAll(data);
    console.log('done inserting data');
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
