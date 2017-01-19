(function(angular) {
    'use strict';

    angular.module('mdi-LockNBlockLockService', [
        'sdkAdapter'
    ])
        .factory('LockNBlockLockService', LockNBlockLockService);

    /**
     * @ngdoc service
     * @name LockNBlockLockService
     * @requires $http
     * @requires $q
     * @requires sdkAdapter
     * 
     * @description
     * Service for posting a member's settings for a card
     */

    LockNBlockLockService.$inject = ['$http', '$q', '$sdkAdapter'];
    function LockNBlockLockService($http, $q, $sdkAdapter) {
        'use strict';

        var lockService = {
            saveChanges: saveChanges
        };

        return lockService;

        /**
         * @ngdoc method
         * @name LockNBlockLockService#saveChanges
         * 
         * @description
         * Post settings for member's card
         * 
         * @param   {String}   jsonData     JSON string for card settings
         * 
         * @returns {HttpPromise}
         */

        function saveChanges(jsonData) {
            var defer = $q.defer();
            jsonData = JSON.parse(jsonData);

            /* WITH MOCK SUCCESS DATA FOR FIRST CARD */
            //return $http.get('features/lockNBlock/data/locknblock-lock-success-mock.json', { cache: true });

            /* WITH MOCK FAILURE DATA FOR FIRST CARD */
            //return $http.get('features/lockNBlock/data/locknblock-lock-fail-mock.json', { cache: true });

            $sdkAdapter.callSDKPost('cardLock', {
                query: jsonData
            })
                .then(
                    function(response) {
                        defer.resolve(response);
                    },
                    function(response) {
                        defer.reject(response);
                    }
                );
            return defer.promise;
        }
    }
})(angular);
