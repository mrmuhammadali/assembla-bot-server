
const request = require('request');

module.exports = function(){
  const app = this;

  const makeRequest = request.defaults({
    baseUrl: 'https://api.assembla.com/v1',
    json: true,
    auth: {
      bearer: 'b68c758499f479102aa6a81f478237e3'
    }
  });

  const userFuntions = {

    get(space_id) {
      console.log("called", space_id)
      return request({
        method: 'GET',
        uri: `https://api.assembla.com/v1/activity.json?space_id=${space_id}`,
        auth: {
          bearer: 'b68c758499f479102aa6a81f478237e3'
        }
      }, (error, response, body) => {
        //this contains a json object of all the user's spaces
        console.log("Response Body(Assembla): ", body)
        //console.log(req.query)
      });
    },


  };

  // Initialize our service with any options it requires
  app.use('/users', userFuntions);


};
