angular.module('mdi-LockNBlock-Directives', [])
    
    .directive('lockToggle', function () {
        return {
            restrict: 'E',
            template: [
                '<ion-toggle toggle-class="toggle-calm" ng-model="lockModel.locked" class="lockToggle">',
                '{{ label }}',
                '</ion-toggle>'
            ].join(''),
            scope: {
                label: '@',
                lockModel: '='
            },
            controller: function ($scope, $element, $attrs, $transclude) {
                $scope.filterInput = function (event) {
                    var inputValue = event.target.value;
                    event.target.value = parseInt(inputValue, 10);
                };
            }
        };
    })
    
    .directive('noRestrictedChars', function() {
        return {
            require: '?ngModel',
            restrict: 'A',
            link: function($scope, $element, $attrs, ngModel) {
                ngModel.$parsers.push(function(inputValue) {
                    var cleanInputValue;

                    if (inputValue === null) {
                        return '';
                    }
                    cleanInputValue = inputValue.replace(/[|\\\";,&=<>]/gi, '');
                    if (cleanInputValue !== inputValue) {
                        ngModel.$setViewValue(cleanInputValue);
                        ngModel.$render();
                    }
                    return cleanInputValue;
                });
            }
        };
    })

    .directive('c1MaxLength', function() {
        return {
            restrict: 'A',
            scope: {
                ngModel: '=ngModel'
            },
            link: function($scope, $element, $attrs) {
                var maxLength = parseInt($attrs.c1MaxLength);
                $scope.$watch('ngModel', function(newValue, oldValue) {
                    if (newValue.length > maxLength) {
                        $scope.ngModel = oldValue.substr(0, maxLength);
                    }
                });
            }
        };
    });