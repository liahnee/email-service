const request = require('superagent');
const moment = require('moment');
const fs = require('fs');
const values = require('lodash').values;
const User = require('./model');
const composeEmails = require('./composeEmails');

const stoppingPoint = '';
const writeStream = fs.createWriteStream('users-stream.txt');

// gets users 25 people at a time
const getUsers = function (path) {
  return request
    .get(`https://actionnetwork.org/${path}`)
    .set('OSDI-API-Token', process.env.ACTION_NETWORK_KEY)
    .set('Content-Type', 'application/json')
    .then((res) => {
      let data;
      try {
        data = JSON.parse(res.text);
        return (data);
      } catch (e) {
        console.log(e);
        throw (e);
      }
    })
    .catch(e => {
      console.log(e);
    });
};


const getAllUsers = function (page) {
  console.log('fetching', page);
  // first time call page will not be defined
  let basepath = '/api/v2/people';
  let path = page ? basepath + page : basepath;
  // get 25 users, then add them to the object under their district
  let peopleList = [];
  getUsers(path).then((returnedData) => {
    var people = returnedData['_embedded']['osdi:people'];
    for (const key of Object.keys(people)) {
      var user = new User(people[key]);
      
      if (user.primaryEmail && 
        user.districts.length > 0 ) {
        user.lat = null;
        user.lng = null;

        this.districtsString = JSON.stringify(this.districts);
        delete user.lng;
        delete user.lat;
        delete user.created_date;
        delete user.zip;
        user.created_date = moment(user.created_date).format('MM/DD/YYYY');
        writeStream.write(values(user).join(',') + '\n');
        peopleList.push(user);
      }
    }

    // if no more new pages, or we set a break point for testing

    if (returnedData && !returnedData['_links']['next']) {
      console.log('got all users');
      console.log(peopleList.length);
      return;

    } 
    var nextPage = returnedData['_links']['next']['href'].split('people')[1];

    console.log(nextPage);
    if (nextPage === stoppingPoint) {
      console.log('stopping point');
      console.log(peopleList.length);
      return;
    }
    getAllUsers(nextPage);
    
  }).catch(function (error) {
    console.error(error);
    composeEmails.errorEmail('making people list ', error);
  });
};

getAllUsers();
module.exports = getAllUsers;