var vodreApp = angular.module("vodreApp", []);

vodreApp.controller("RulesController", function($scope) {
    $scope.fieldTypes = [newFieldType()];
    
    $scope.addField = function(fieldType) {
        fieldType.fields.push(newField());
    };

    $scope.removeField = function($field, fieldType) {
        fieldType.fields.deleteObject($field);
    };

    $scope.addFieldType = function() {
        $scope.fieldTypes.push(newFieldType());
    };

    $scope.removeFieldType = function(fieldType) {
        $scope.fieldTypes.deleteObject(fieldType);
    };

    function newFieldType() {
        return { fields: [newField()], name: ""};
    };

    function newField() {
        return {
            name: "",
            value: ""
        };
    };
    
    $scope.uploadFile = function() {
        var formData = new FormData($('#form')[0]);
        var packagePath = $('#file').val().split("\\");
        var packageName = packagePath[packagePath.length-1].replace(/\.[^/.]+$/, "");
        
        formData.append("package",packageName);
        formData.append("fieldTypesCount",$scope.fieldTypes.length);
        for (var i = 0; i < $scope.fieldTypes.length; i++) {
            formData.append("fieldsCount"+i,$scope.fieldTypes[i].fields.length);
        }
        $.ajax({
            url: 'rest/FileService/processFile/',  //Server script to process data
            type: 'POST',
            // Form data
            data: formData,
            //Options to tell jQuery not to process data or worry about content-type.
            cache: false,
            contentType: false,
            processData: false
        });
    };
});

Array.prototype.deleteObject = function(object) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === object) {
            this.splice(i, 1);
            break;
        }
    }
};