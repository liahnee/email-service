// saves chunk of data, resolves when all the people in the list have been assigned a district
const User = require('./model');

module.exports = function (people) {
  Object.keys(people)
    .map((key) => {
      return new User(people[key]);
    })
    .filter((user) => {
      return user.primaryEmail && user.include;
    }).forEach((user) => {
      user.getDistricts()
        .then(() => user.getStateDistricts())
        .then(() => {
          const allEvents = user.getDataForUser();
          if (allEvents && allEvents.length > 0 ) {
            user.composeEmail(allEvents);
          }
        }).catch(function (error) {
          console.error('couldnt get district', error);
        });
    });
};
