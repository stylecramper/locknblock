(function(angular) {
    'use strict';

    angular.module('mdi.LockNBlockManageCardController', [])

        /**
         * @ngdoc controller
         * @name mdi.controllers:LockNBlockManageCardController
         *
         * @description
         * Controller for Lock 'n' Block manage card page
         */

    .controller('LockNBlockManageCardController', LockNBlockManageCardController);
    
    LockNBlockManageCardController.$inject = ['$injector',
                                            '$scope',
                                            '$state',
                                            '$stateParams',
                                            'LockNBlockCardsService',
                                            'LockNBlockCardJsonService',
                                            'LockNBlockLockService',
                                            '_TextProperties'];

    function LockNBlockManageCardController($injector,
                                            $scope,
                                            $state,
                                            $stateParams,
                                            LockNBlockCardsService,
                                            LockNBlockCardJsonService,
                                            LockNBlockLockService,
                                            TextProperties) {
        
        var $ionicLoading, $ionicPopup, scrollDelegate;

        console.log('LockNBlockManageCardController started');

        if (typeof window.ionic !== 'undefined') {
            $ionicLoading = $injector.get('$ionicLoading');
            $ionicPopup = $injector.get('$ionicPopup');
            scrollDelegate = $injector.get('$ionicScrollDelegate');
            setupIonicLoading();
        } else {
            scrollDelegate = {
                scrollTop: function() { window.scroll(0, 0); }
            };
            setupDesktopLoading();
        }
        
        $scope.showMessage = false;
        $scope.typeOfError = 'errors';
        $scope.ignoreLockChanges = false;
        
        $scope.strings = {
            pageTitle: TextProperties.get('ManageStep.Label'),
            manageStepHeader: TextProperties.get('ManageStep.Header.Text'),
            nicknameLabel: TextProperties.get('Nickname.Label'),
            cardLockLabel: TextProperties.get('CardLock.Label'),
            cardLockSubheading: TextProperties.get('CardLock.Subheading'),
            blockATMLabel: TextProperties.get('BlockATM.Label'),
            blockPOSLabel: TextProperties.get('BlockPOS.Label'),
            blockINTLabel: TextProperties.get('BlockINT.Label'),
            saveButtonLabel: TextProperties.get('SaveButton.Label'),
            blockATMTitle: TextProperties.get('BlockATM.Title'),
            blockATMMessage: TextProperties.get('BlockATM.Message'),
            unblockATMTitle: TextProperties.get('UnblockATM.Title'),
            unblockATMMessage: TextProperties.get('UnblockATM.Message'),
            blockPOSTitle: TextProperties.get('BlockPOS.Title'),
            blockPOSMessage: TextProperties.get('BlockPOS.Message'),
            unblockPOSTitle: TextProperties.get('UnblockPOS.Title'),
            unblockPOSMessage: TextProperties.get('UnblockPOS.Message'),
            lockCardTitle: TextProperties.get('LockCard.Title'),
            lockCardMessage: TextProperties.get('LockCard.Message'),
            unlockCardTitle: TextProperties.get('UnlockCard.Title'),
            unlockCardMessage: TextProperties.get('UnlockCard.Message'),
            errorTitle: TextProperties.get('Errors.Title.Text'),
            saveChangesError: TextProperties.get('Errors.SaveChangesFailure.Text'),
            lockFailureError: TextProperties.get('Errors.LockFailure.Text')
        };
        
        LockNBlockCardsService.getCards()
            .then(function (response) {
                $scope.cardId = $stateParams.cardId;
                $scope.card = _.findWhere(response.data, { id: parseInt($scope.cardId, 10) });
                $scope.originalSettings = angular.copy($scope.card);
                $scope.settingsChanged = false;
                $scope.$watch('card', function () {
                    $scope.settingsChanged = !angular.equals($scope.originalSettings, $scope.card);
                    $scope.globalLock = $scope.card.locks.CRD.locked;
                }, true);
            });
        
        /**
         * Set up $scope watch for global lock - if the user is unlocking it,
         * show dialog to confirm that user wants to restore any previously set,
         * more granular blocks.
         * 
         * If user is locking it, show dialog to confirm that user wants to
         * completely disable the card.
         */
        $scope.$watch('card.locks.CRD.locked', function(newValue, oldValue) {
            var isLocking = true;

            if (newValue === oldValue) {
                return;
            }

            if ($scope.ignoreLockChanges) {
                $scope.ignoreLockChanges = false;
                return;
            }

            if (newValue === false) {   // if the global (CRD) lock is being unlocked
                if (cardHasNonGlobalLocks() && !$scope.ignoreLockChanges) {
                    showConfirm({
                        title: $scope.strings.unlockCardTitle,
                        message: $scope.strings.unlockCardMessage
                    }, !isLocking);
                }
            } else {
                showConfirm({
                    title: $scope.strings.lockCardTitle,
                    message: $scope.strings.lockCardMessage
                }, isLocking);
            }
        });

        /**
         * Called from click on Save Changes button
         */
        $scope.saveChanges = function() {
            var cardJson;
            
            $scope.showMessage = false;
            $scope.showLoading();
            cardJson =  LockNBlockCardJsonService.assembleCardJson($scope.card, $scope.originalSettings);
            
            LockNBlockLockService.saveChanges(cardJson)
                .then(saveChangesSuccess, saveChangesError);
        };

        /**
         * @param   {Object}    response    Data object from C1 SDK (response.data contains results - array of locks)
         */
        function saveChangesSuccess(resultsList) {
            $scope.hideLoading();
            if (hasFailedLock(resultsList)) {
                $scope.ignoreLockChanges = true;
                lockFailureError();
            } else {
                $state.go('app.locknblock');
            }
            LockNBlockCardsService.updateCard($scope.card);
        }
        
        function saveChangesError() {
            $scope.ignoreLockChanges = true;
            showErrorMessage($scope.strings.saveChangesError);
            LockNBlockCardsService.updateCard($scope.originalSettings);
        }

        function lockFailureError() {
            showErrorMessage($scope.strings.lockFailureError);
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
            $scope.card = angular.copy($scope.originalSettings);
            $scope.hideLoading();
            scrollDelegate.scrollTop();
        }

        /**
         * @param   {Array}     resultsList   Array of lock results returned by C1 SDK
         * 
         * @returns {Boolean}   true if one or more locks has status: "fail", otherwise false
         */
        function hasFailedLock(resultsList) {
            var hasFail;

            hasFail = _.find(resultsList, function(lock) {
                return lock.status === 'fail';
            });

            return !!hasFail;
        }

        /**
         * @returns {Boolean}   true if card has locks other than type CRD, otherwise false 
         */
        function cardHasNonGlobalLocks() {
            var nonGlobalLocks = [];

            nonGlobalLocks = _.filter($scope.card.locks, function(lock) {
                return lock.type !== 'CRD' && lock.locked;
            });
            return nonGlobalLocks.length > 0;
        }
        
        /**
         * Display $ionicPopup with options sent from $scope watches
         * @param {Object}  options      options object
         * @param {Boolean} isLocking    global (CRD) lock is being locked or unlocked
         */
        function showConfirm(options, isLocking) {
            var confirmPopup = $ionicPopup.confirm({
                title: options.title,
                template: options.message
            });

            confirmPopup.then(function(confirmed) {
                if (confirmed) {
                    $scope.card.locks.CRD.locked = isLocking;
                    $scope.globalLock = isLocking;
                } else {
                    $scope.card.locks.CRD.locked = !isLocking;
                    $scope.ignoreLockChanges = true;
                }
            });
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
