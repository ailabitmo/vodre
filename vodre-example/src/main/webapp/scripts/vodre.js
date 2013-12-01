var vodre = new function () {
    //extarnal dependencies
    var _visualization = visualization;

    $(document).ready(function () {
        init();
    });

    var init = function () {
        getBlocks(function(blocks) {
            visualization.drawBlocks(blocks);
        });
    };

    var getBlocks = function (callback) {
        $.get("./rest/", function(blocks) {
            callback(blocks);
        });
    };
}();