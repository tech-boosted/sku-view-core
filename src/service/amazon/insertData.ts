export const InsertData = async (selectedRespository: any, data: any) => {
  console.log('selectedRespository: ', selectedRespository);
  try {
    console.log('inserting data into table');
    let response = await selectedRespository.create(data);
    console.log(response);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
