var vodre = new function () {
    //extarnal dependencies
    var _visualization = visualization;

    $(document).ready(function () {
        init();
    });

    var init = function () {
        var blocks = getBlocks();
        visualization.drawBlocks(blocks);
    };

    var getBlocks = function () {
        var blocks = [
            {"type":"objectInserted", "name":"ApplicationForCredit( AmountOfCredit\u003d0, PeriodOfCredit\u003d0, Salary\u003d0, Age\u003d17, Sex\u003dnull, JobExperience\u003d0, LastPeriodOfWork\u003d0, CurrentObligations\u003d0 )"},
            {"type":"objectInserted", "name":"CreditDecision( Decision\u003dfalse, MonthyFee\u003d0 )"},
            {"name":"Rule #1", "type":"ruleTriggered"}
        ];

        return blocks;
    };
}()