angular.module('mdi-LockNBlockFilterMaskPan', [])

/**
 * @ngdoc filter
 * @name MDI-LockNBlockFilterMaskPan
 *
 * @description
 * Filters a PAN number to show just the last four numbers
 * e.g., 5000114094835005 -> ************ 5005
 */
.filter('maskPan', function () {
  return function (panNumber) {
    if (typeof panNumber === 'undefined') {
      return;
    }
    var starSequence = '******************************';
    var numberOfStars = panNumber.length - 4;
    var starMask = starSequence.substr(0, numberOfStars);
    var lastFourDigits = panNumber.slice(-4);

    return  starMask + ' ' + lastFourDigits;
  };
});
