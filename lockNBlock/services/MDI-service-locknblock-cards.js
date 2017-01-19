(function(angular) {
    'use strict';

    angular.module('mdi-LockNBlockCardsService', [
        'sdkAdapter'
    ])
        .factory('LockNBlockCardsService', LockNBlockCardsService);
        
    /**
     * @ngdoc service
     * @name LockNBlockCardsService
     * @requires $http
     * @requires sdkAdapter
     *
     * @description
     * Service for fetching the details for a member's cards
     */

    LockNBlockCardsService.$inject = ['$http', '$q', '$sdkAdapter'];
    function LockNBlockCardsService($http, $q, $sdkAdapter) {
        'use strict';

        var cardsList = [];
        
        var cardsService = {
            getCards: getCards,
            updateCard: updateCard,
            clearCache: clearCache
        };

        return cardsService;

        /**
         * @ngdoc method
         * @name LockNBlockCardsService#getCards
         *
         * @description
         * Get list of cards for member
         *
         * @returns {HttpPromise} 
         */

        function getCards() {
            var defer = $q.defer();

            if (cardsList.length > 0) {
                defer.resolve({ error: false, data: cardsList});
                return defer.promise;
            }

            /* WITH MOCK DATA */
            /*return $http.get('features/lockNBlock/data/locknblock-mock.json', { cache: true })
                .then(function (response) { cardsList = updateCardsList(response.data); return { error: false, data: cardsList }; });*/

            /* WITH EMPTY MOCK DATA (EL-79) */
            /*return $http.get('features/lockNBlock/data/locknblock-empty-mock.json', { cache: true })
                .then(function (response) { return { error: false, data: updateCardsList(response.data) }; });*/
            
            /* WITH SDK CALL */
            $sdkAdapter.callSDKGet('cardsList')
                .then(
                    function (response) {
                        cardsList = updateCardsList(response);
                        defer.resolve({ error: false, data: cardsList });
                    },
                    function (response) {
                        defer.reject({ error: true, data: [] });
                    });
            return defer.promise;
        }

        /**
         * @ngdoc method
         * @name LockNBlockCardsService#updateCard
         * 
         * @description Updates one card to the new settings saved by the member
         * 
         * @param   {Object}    card    Object representing a single card
         */
        function updateCard(card) {
            var cardsListIndex = -1;

            _.each(cardsList, function(cardObject, index) {
                if (cardObject.PAN === card.PAN) {
                    cardsListIndex = index;
                    return;
                }
            });
            if (cardsListIndex >= 0) {
                cardsList[cardsListIndex] = card;
            }
        }

        /**
         * @ngdoc method
         * @name LockNBlockCardsService#clearCache
         * 
         * @description Reset the cardsList array
         */
        function clearCache() {
            cardsList = [];
        }

        function updateCardsList(cardsList) {
            cardsList.forEach(function(card, index) {
                assignCardId(card, index);
                buildCardLocksModel(card);
            });
            return cardsList;
        }

        function assignCardId(card, index) {
            card.id = index + 1;
        }
        
        function buildCardLocksModel(card) {
            var convertedLocks = {};
            var LOCKED = 'L';
            var LOCK_TYPES = [
                'CRD',
                'ATM',
                'INT',
                'POS',
            ];
            
            LOCK_TYPES.forEach(function (lockType) {
                var existingLock = _.findWhere(card.locks, { lockType: lockType });
                var lockBoolean = (existingLock) ? existingLock.lockStatus === LOCKED : false;

                convertedLocks[lockType] = {
                    locked: lockBoolean
                };
            });

            card.locks = convertedLocks;
        }
    }
})(angular);
