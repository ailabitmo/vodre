$(document).ready(function () {
       // var classesDescriptionNumber = $('.classDescr').size();
    });

function addNewField(sender){
    btnId = $(sender).attr("id");
    parentId = $(sender).parent('.classDescr').attr("id");
    var fieldsNumber = $(sender).parent('.classDescr').find('.classFields').size();
    
    $('<p>Field: <input id="' + parentId + '_fieldName' + fieldsNumber + '" type="text">' +
            ' Value: <input id="' + parentId + '_fieldValue' + fieldsNumber + '" type="text">' +
            ' <input id="' + parentId + '_removeField' + fieldsNumber + '" type="button"' +
                'value="Remove" onclick="removeField(this);"></p>')
            .fadeIn('slow').insertBefore('#' + btnId);
};

function addNewClass(sender){
    btnId = $(sender).attr("id");
    var classesDescriptionNumber = $('.classDescr').size();
    
    $('<div id="classDescription' + classesDescriptionNumber + '" ' +
             'class="classDescr" style="border:1px solid black;">' +
                    '<p>' + 
                        'Class name' +
                        '<input id="classDescription' + classesDescriptionNumber + '_className"' +
                            'type="text">' +
                            '<input id="classDescription' + classesDescriptionNumber +
                                '_removeClass" type="button" value="Remove class" onclick="removeClass(this);">' +
                    '</p>' +
                    '<p class="classFields">' +
                        'Field: ' +
                        '<input id="classDescription' + classesDescriptionNumber + 
                            '_fieldName0" type="text"> ' +
                        'Value: ' +
                        '<input id="classDescription' + classesDescriptionNumber + 
                            '_fieldValue0" type="text"> ' +
                        //'' +
                    '</p>' +
                    '<input id="classDescription' + classesDescriptionNumber +
                        '_newField" type="button" value="New field" onclick="addNewField(this);">' +
               '</div>')
            .fadeIn('slow').insertBefore('#' + btnId);
}

function removeClass(sender){
    parent = $(sender).parent().parent();
    $(parent).fadeOut('slow', function(){$(parent).remove();});
}

function removeField(sender){
    parent = $(sender).parent('p');
    $(parent).fadeOut('slow', function(){$(parent).remove();});
}