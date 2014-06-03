/*global angular: true */
(function (angular) {
  'use strict';
  var challengesModule = angular.module('tc.challenges');
  challengesModule.controller('ChallengeListingCtrl', ['$scope', 'ChallengesService', 'DataService', '$window', 'TemplateService', 'GridService', 'cfpLoadingBar',
    function ($scope, ChallengesService, DataService, $window, TemplateService, GridService, cfpLoadingBar) {

      function startLoading() {
        cfpLoadingBar.start();
        $scope.loading = true;
      }

      function stopLoading() {
        cfpLoadingBar.complete();
        $scope.loading = false;
      }

      startLoading();

      //console.log('routes', $routeParam);
      $scope.allChallenges = [];
      $scope.challenges = [];
      $scope.filteredChallenges = [];
      $scope.contest = {
        contestType: '',
        listType: 'active'
      };
      $scope.titles = {
        '': 'All Open Challenges',
        design: 'Graphic Design Challenges',
        develop: 'Software Development Challenges',
        data: 'Data Science Challenges'
      };
      $scope.view = 'table';
      $scope.getTrackSymbol = TemplateService.getTrackSymbol;
      $scope.formatTimeLeft = TemplateService.formatTimeLeft;
      $scope.getContestDuration = TemplateService.getContestDuration;
      $scope.getPhaseName = TemplateService.getPhaseName;
      $scope.dateFormat = 'dd MMM yyyy hh:mm EDT';
      $scope.images = $window.wordpressConfig.stylesheetDirectoryUri + '/i/';
      $scope.definitions = GridService.definitions($scope.contest);
      $scope.gridOptions = GridService.gridOptions('definitions');
      $scope.search = {
        radioFilterChallenge: 'all',
        show: false,
        allPlatforms: [],
        allTechnologies: []
      };
      $scope.pageSize = 10;
      $scope.page = 1;

      $scope.setPagingData = function (data, page, pageSize) {
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
          $scope.$apply();
        }

        stopLoading();

        return pagedData;
      };


      function getChallenges(contest) {
        var params = {};
        if (contest.contestType && contest.contestType !== '') {
          params = {
            type: contest.contestType
          };
        }
        ChallengesService.all(contest.listType).getList(params).then(function (challenges) {
            $scope.allChallenges = challenges;
            $scope.challenges = $scope.setPagingData($scope.allChallenges, $scope.page, $scope.pageSize);
          },
          function () {
            $scope.challenges = [];
            stopLoading();
          });
      }

      $scope.submit = function () {
        cfpLoadingBar.start();
        $scope.filteredChallenges = $scope.allChallenges.filter(function (contest) {
          if ($scope.search.radioFilterChallenge !== 'all' && $scope.search.radioFilterChallenge !== contest.challengeType) {
            return false;
          }
          if ($scope.search.fSDate && contest.submissionEndDate < $scope.search.fSDate) {
            return false;
          }
          if ($scope.search.fEDate && contest.submissionEndDate > $scope.search.fEDate) {
            return false;
          }
          if($scope.search.technologies && $scope.search.technologies.length > 0) {
            for(var tech in $scope.search.technologies) {
              if(contest.technologies && contest.technologies.length > 0 && contest.technologies[0] != '' && contest.technologies.indexOf(tech) == -1) {
                return false;
              }
            }
          } 
          return true;
        });

        $scope.challenges = $scope.setPagingData($scope.filteredChallenges, $scope.page, $scope.pageSize);
      };

      DataService.one('technologies').get().then(function(data) {
        if(data) {
          $scope.search.allTechnologies = data.technologies;
        }
      });
      
      DataService.one('platforms').get().then(function(data) {
        if(data) {
          $scope.search.allPlatforms = data.platforms;
        }
      });

      $scope.$watch('page', function () {
        $scope.challenges = [];
        startLoading();

        if($scope.page < 0) {
          $scope.page = 0;
        }
        $scope.challenges = $scope.setPagingData($scope.filteredChallenges, $scope.page, $scope.pageSize);
      });

      $scope.$watchCollection('contest', function (contest) {
        $scope.challenges = [];
        startLoading();

        $scope.definitions = GridService.definitions(contest);
        if (contest.listType === 'past') {
          $scope.view = 'table';
        }
        getChallenges(contest);
      });

      getChallenges($scope.contest);

    }]);
}(angular));
