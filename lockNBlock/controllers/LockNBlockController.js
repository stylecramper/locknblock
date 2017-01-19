(function(angular) {
    'use strict';
    
    angular.module('mdi.LockNBlockController', [])

    /**
     * @ngdoc controller
     * @name mdi.controllers:LockNBlockController
     *
     * @description
     * Controller for Lock 'n' Block feature landing page
     */
    .controller('LockNBlockController', LockNBlockController);
    
    LockNBlockController.$inject = ['$injector', '$scope', '$state', 'LockNBlockCardsService', '_TextProperties'];

    function LockNBlockController($injector, $scope, $state, LockNBlockCardsService, TextProperties) {
        var $ionicLoading, mdiTransition;

        console.log('LockNBlockController started.');

        if (typeof window.ionic !== 'undefined') {
            $ionicLoading = $injector.get('$ionicLoading');
            setupIonicLoading();
        } else {
            setupDesktopLoading();
        }

        if (typeof window.MDI !== 'undefined' && typeof window.MDI.AppConfig !== 'undefined') {
            mdiTransition = $injector.get('mdiTransition');
            $scope.$on('$ionicView.enter', function () {
                mdiTransition.transitionEnd();
            });
            MDI.addOnViewLoadedListener('LockNBlockController - LockNBlock', 'LockNBlock', function () {
                console.log("LockNBlockController - Card List View Loaded");
                mdiTransition.transitionEnd();
            });
        }

        $scope.showMessage = false;
        $scope.typeOfError = 'errors';
        
        $scope.showLoading();

        LockNBlockCardsService.getCards().then(addCardsToScope, addCardsErrorToScope);

        $scope.strings = {
            pageTitle: TextProperties.get('SelectStep.Label'),
            selectCardHeader: TextProperties.get('SelectStep.Header.Text'),
            errorTitle: TextProperties.get('Errors.Title.Text'),
            notAvailableError: TextProperties.get('Errors.LockNBlockNotAvailable.Text'),
            noCardsError: TextProperties.get('Errors.NoCardsAvailable.Text')
        };

        $scope.showCard = function showCard(id) {
            $state.go('app.locknblock_manage_card', { cardId: id });
        };

        $scope.shouldHideGranularLocks = function(card, key) {
            return card.locks.CRD.locked && key !== 'CRD';
        };

        MDI.addOnLogoutListener('LOGOUT:CLEAR LOCKNBLOCK CARDSLIST CACHE', function() {
            LockNBlockCardsService.clearCache();
        });

        /**
         * @param   {Object}   response  Data from LockNBlockCardsService
         */
        function addCardsToScope(response) {
            $scope.cards = response;
            if ($scope.cards.data.length === 0) {
                showErrorMessage($scope.strings.noCardsError);
            }
            $scope.hideLoading();
        }

        function addCardsErrorToScope() {
            showErrorMessage($scope.strings.notAvailableError);
            $scope.hideLoading();
        }

        /**
         * @param   {String}   messageDetails  Text to display in message details list
         */
        function showErrorMessage(messageDetails) {
            $scope.showMessage = true;
            $scope.errorMessage = {
                title: $scope.strings.errorTitle,
                details: [messageDetails]
            };
        }

        function setupIonicLoading() {
            $scope.showLoading = function() {
                $ionicLoading.show({
                    template: TextProperties.get('Loading.Label'),
                    duration: 10000
                });
            };

            $scope.hideLoading = function() {
                $ionicLoading.hide();
            };
        }

        function setupDesktopLoading() {
            $scope.showLoading = function() {
                // TODO: create desktop loading progress overlay
            };
            $scope.hideLoading = function() {
                // TODO: hide desktop loading progress overlay
            };
        }
    }
})(angular);

