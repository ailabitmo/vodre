var vodreApp = angular.module("vodreApp", []);

vodreApp.controller("RulesController", function($scope) {
    $scope.classes = [newClass()];

    $scope.addField = function($class) {
        $class.fields.push(newField());
        updateBinding();
    };

    $scope.removeField = function($field, $class) {
        $class.fields.deleteObject($field);
        updateBinding();
    };

    $scope.addClass = function() {
        $scope.classes.push(newClass());
        updateBinding();
    };

    $scope.removeClass = function($class) {
        $scope.classes.deleteObject($class);
        updateBinding();
    };

    function newClass() {
        return { fields: [newField()] };
    }

    function newField() {
        return {
            name: "",
            value: ""
        };
    }

    function updateBinding() {
        setTimeout(function() {
            $scope.$apply();
        }, 1);
    }
});

Array.prototype.deleteObject = function(object) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === object) {
            this.splice(i, 1);
            break;
        }
    }
};