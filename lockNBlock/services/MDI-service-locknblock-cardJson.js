(function(angular) {
    'use strict';

    angular.module('mdi-LockNBlockCardJsonService', [])
        .factory('LockNBlockCardJsonService', LockNBlockCardJsonService);

    /**
     * @ngdoc service
     * @name LockNBlockCardJsonService
     *
     * @description
     * Service for assembling JSON data for a member's card, for posting to web service
     */

    function LockNBlockCardJsonService() {
        'use strict';

        var cardJsonService = {
            assembleCardJson: assembleCardJson
        };

        return cardJsonService;

        /**
         * @ngdoc method
         * @name LockNBlockCardJsonService#assembleCardJson
         * 
         * @description
         * Return JSON string representing diff of card
         * 
         * @returns {String}
         */
        function assembleCardJson(card, originalSettings) {
            var nicknameMember;
            var cardJson;

            nicknameMember =    (card.nickname !== originalSettings.nickname) ?
                                '", "nickname": "' + card.nickname :
                                '';
            
            cardJson = '{'          +
                '"PAN": "'          +
                card.PAN            +
                nicknameMember      +
                '", "locks": [';
            
            _.each(card.locks, function(lockObject, lockType) {
                if (lockObject.locked !== originalSettings.locks[lockType].locked) {
                    var lockJson = assembleLockJson(lockObject, lockType);
                    cardJson += lockJson;
                }
            });

            // crop off last comma
            if (cardJson.slice(-1) === ',') {
                cardJson = cardJson.substring(0, cardJson.length - 1);
            }
            cardJson += ']}';

            return cardJson;
        }

        /**
         * Create the JSON string for a single lock
         * 
         * @param   {Object}    lockObject   the lock object, e.g., {locked: true}
         * @param   {String}    lockType     the name of the lock, e.g., ATM
         * 
         * @returns {String}
         */
        function assembleLockJson(lockObject, lockType) {
            var lockToken = (lockObject.locked) ? 'L' : 'U';
            var lockJson = '{'          +
                    '"type": "'         +
                    lockType                 +
                    '", "value": "'     +
                    lockToken           +
                    '"},';

            return lockJson;
        }
    }
})(angular);
