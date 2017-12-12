const moment = require('moment');
const getLastSent = require('../getLastSent');

describe('getLastSent', () => {
  test('it gets the time of the last time an email was sent', () => {
    return getLastSent().then((lastSent) => {
      expect(moment(lastSent.daily).isValid()).toEqual(true);
      expect(moment(lastSent.weekly).isValid()).toEqual(true);
    });
  });

  test('last daily should be less than 24 hours ago',  () => {
    return getLastSent().then((lastSent) => {
      expect(moment(lastSent.daily).add(1, 'days').isAfter()).toEqual(true);
    });

  });
  test('last weekely should be less than 7 ago',  () => {
    return getLastSent().then((lastSent) => {
      expect(moment(lastSent.weekly).add(7, 'days').isAfter()).toEqual(true);
    });
  });
});
