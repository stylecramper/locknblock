angular.module('mdi-LockNBlockFilterLockName', [])

/**
 * @ngdoc filter
 * @name MDI-LockNBlockFilterLockName
 *
 * @description
 * Filters lock type names and replaces them with more user-friendly text
 */
.filter('lockName', ['PropertiesLoaderService', function (PropertiesLoaderService) {
  var TextProperties = null;
  var serviceInvoked = false;

  function lockNameFilter(input) {
    var newLock = '';

    switch (input) {
      case 'CRD':
        newLock = TextProperties.get('LockList.CRD.Label');
        break;
      
      case 'ATM':
        newLock = TextProperties.get('LockList.ATM.Label');
        break;
      
      case 'POS':
        newLock = TextProperties.get('LockList.POS.Label');
        break;

      case 'INT':
        newLock = TextProperties.get('LockList.INT.Label');
        break;
      
      default:
        newLock = input;
        break;
    }

    return newLock;
  }

  filterStub.$stateful = true;

  function filterStub(input) {
    if (TextProperties === null) {
      if (!serviceInvoked) {
        serviceInvoked = true;
        PropertiesLoaderService.getProperties('features/lockNBlock/data/locknblock-text.json')
          .then(function(response) {
            TextProperties = response;
          });
      }
      return function() {};
    } else {
      return lockNameFilter(input);
    }
  }
  return filterStub;
}]);
