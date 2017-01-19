angular.module('mdi-LockNBlock', [
    'ionic',
    'ui.router',

    // Directives
    'mdi-LockNBlock-Directives',

    // Services
    'mdi-LockNBlockCardsService',
    'mdi-LockNBlockCardJsonService',
    'mdi-LockNBlockLockService',

    // Controllers
    'mdi.LockNBlockController',
    'mdi.LockNBlockManageCardController',

    // Filters
    'mdi-LockNBlockFilterLockName',
    'mdi-LockNBlockFilterMaskPan'
])
.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

        .state('app.locknblock', {
            url: '/locknblock',
            cache: false,
            views: {
                'appContent': {
                    templateUrl: 'features/lockNBlock/html/locknblock.html',
                    controller: 'LockNBlockController'
                }
            },
            resolve: {
                _TextProperties: getLockNBlockText
            }
        })

        .state('app.locknblock_manage_card', {
            url: '/locknblock_manage_card/:cardId',
            cache: false,
            views: {
                'appContent': {
                    templateUrl: 'features/lockNBlock/html/manage-card.html',
                    controller: 'LockNBlockManageCardController'
                }
            },
            resolve: {
                _TextProperties: getLockNBlockText
            }
        });

    //$urlRouterProvider.when('/app/locknblock', '/app/locknblock/locknblock_landing_page');
    
    getLockNBlockText.$inject = ['PropertiesLoaderService'];

    function getLockNBlockText(PropertiesLoaderService) {
        return PropertiesLoaderService.getProperties('features/lockNBlock/data/locknblock-text.json');
    }
});