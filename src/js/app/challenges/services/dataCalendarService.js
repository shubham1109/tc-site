/*global angular*/
/**
 * Changelog
 * 10/15/2014 Add My Challenges Filter and Improve Filters
 * - Added UserChallengesService to query for usr challenges
*/
(function () {
  'use strict';
  
  /**
   * @name UserChallengesService
   * @desc Gets user challenges
   * @param {Object} Restangular - Restangular API
   */
  function DataChallengesService(Restangular) {
    var userChallengesService = {
      getUserChallenges: getUserChallenges
    };
    
    return userChallengesService;
    
    function getUserChallenges(listType, params) {
      var fullParams = angular.extend({}, params);
      fullParams.type = listType;
      return Restangular.one('user').getList('challenges', fullParams);
    }
    
  }
  UserChallengesService.$inject = ['Restangular'];
  
  angular.module('tc.challenges.services').factory('DataChallengesService', UserChallengesService);
}());