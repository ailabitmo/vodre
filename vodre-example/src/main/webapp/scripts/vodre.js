var vodre = new function () {
    //external dependencies
    var _visualization = visualization;

    $(document).ready(function () {
        init();
    });

    var init = function () {
        getBlocks(function (blocks) {
            _visualization.drawBlocks(blocks);
        });
    };

    var getBlocks = function (callback) {
        $.get("./rest/", function (blocks) {
            //test data
            blocks[0].memoryAction = "remove";
            blocks[1].memoryAction = "add";
            blocks[3] = {
                name: "fact3",
                type: "objectInserted",
                memoryAction: "change",
                calledRule: "Rule #1"
            };
            blocks[4] = {
                name: "fact4",
                type: "objectInserted",
                memoryAction: "add",
                calledRule: "Rule #1"
            };
            blocks[5] = {
                name: "fact5",
                type: "objectInserted",
                memoryAction: "change",
                calledRule: "Rule #1"
            };
            //test data

            callback(blocks);
        });
    };
}();