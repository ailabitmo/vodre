var visualization = new function () {
    var self = this;
    var stage;
    var layers = {};
    var _blocks;

    var blockTypes = {
        fact: "objectInserted",
        rule: "ruleTriggered"
    };

    var memoryActions = {
        add: "add",
        remove: "remove",
        change: "change"
    };

    var settings = {
        canvasWidth: 600,
        canvasHeight: 200,
        blockWidth: 300,
        blockHeight: 50,
        blockLeftMargin: 50,
        blockTopMargin: 50,
        timeLineLeftMargin: 10,
        fontSize: 14,
        fontWidth: 6,
        lineHeight: 15,
        rulePolygonIncline: 10, //different in pixels between topLeftCorner and lowerLeftCorner
        arrowWidth: 10,
        arrowHeight: 5
    };

    var lastBlockMarginTop = 0;
    var lastBlockHeight = settings.blockHeight;

    $(document).ready(function () {
        initKinetic();
    });

    var initKinetic = function () {
        stage = new Kinetic.Stage({
            width: settings.canvasWidth,
            height: settings.canvasHeight,
            container: 'droolsVisualizationCanvas'
        });
        layers.main = new Kinetic.Layer();
        layers.texts = new Kinetic.Layer();
        layers.timeLine = new Kinetic.Layer();
        layers.memoryActionLines = new Kinetic.Layer();
        layers.calledRulesLines = new Kinetic.Layer();
        stage.add(layers.main);
        stage.add(layers.texts);
        stage.add(layers.timeLine);
        stage.add(layers.memoryActionLines);
        stage.add(layers.calledRulesLines);
    };

    this.drawBlocks = function (blocks) {
        _blocks = blocks;

        drawBlock(0);
    };

    var drawBlock = function (indexBlock) {
        var block = _blocks[indexBlock];
        if (!block)
            return;
        switch (block.type) {
            case blockTypes.fact:
                self.addFact(block);
                break;
            case blockTypes.rule:
                self.addRule(block);
                break;
        }

        setTimeout(function () {
            drawBlock(indexBlock + 1);
        }, 0);
    };

    this.addFact = function (block) {
        var textLines = getTextLines("Name: " + block.name);
        var blockHeight = getBlockHeight(textLines);

        var newBlockMarginTop = getNewBlockMarginTop(blockHeight);

        lastBlockMarginTop = newBlockMarginTop;
        block.blockMarginTop = newBlockMarginTop;

        resizeCanvas(newBlockMarginTop);
        drawTimeLine();
        drawFactRectangle(blockHeight, newBlockMarginTop);

        lastBlockHeight = blockHeight;
        block.blockHeight = blockHeight;

        drawMemoryAction(block);

        if (block.calledRule)
            addArrow(block);

        addText(textLines, newBlockMarginTop);
    };

    var drawFactRectangle = function (blockHeight, blockMarginTop) {
        var rect = new Kinetic.Rect({
            width: settings.blockWidth,
            height: blockHeight,
            x: settings.blockLeftMargin,
            y: blockMarginTop,
            fill: 'lightgreen',
            stroke: 'black',
            strokeWidth: 1
        });

        layers.main.add(rect);
        layers.main.batchDraw();
    };

    this.addRule = function (block) {
        var textLines = getTextLines("Name: " + block.name);
        var blockHeight = getBlockHeight(textLines);

        var newBlockMarginTop = getNewBlockMarginTop(blockHeight);

        lastBlockMarginTop = newBlockMarginTop;
        block.blockMarginTop = newBlockMarginTop;

        resizeCanvas(newBlockMarginTop);
        drawTimeLine();
        drawRulePolygon(blockHeight, newBlockMarginTop);

        lastBlockHeight = blockHeight;
        block.blockHeight = blockHeight;

        addText(textLines, newBlockMarginTop);
    };

    var drawRulePolygon = function (blockHeight, blockMarginTop) {
        var polygon = new Kinetic.Polygon({
            points: [settings.blockLeftMargin + settings.rulePolygonIncline, blockMarginTop,
                settings.blockLeftMargin + settings.blockWidth, blockMarginTop,
                settings.blockLeftMargin + settings.blockWidth - settings.rulePolygonIncline, blockMarginTop + blockHeight,
                settings.blockLeftMargin, blockMarginTop + blockHeight],
            fill: 'lightgreen',
            stroke: 'black',
            strokeWidth: 1
        });

        layers.main.add(polygon);
        layers.main.batchDraw();
    };

    var drawMemoryAction = function (block) {
        var topMargin = block.blockMarginTop + block.blockHeight / 2;

        drawHorizontLine([settings.timeLineLeftMargin, topMargin, settings.blockLeftMargin, topMargin ]);

        switch (block.memoryAction) {
            case memoryActions.add:
                drawLeftArrow(settings.timeLineLeftMargin, topMargin);
                break;
            case memoryActions.remove:
                drawRightArrow(settings.blockLeftMargin, topMargin);
                break;
            case memoryActions.change:
                drawLeftArrow(settings.timeLineLeftMargin, topMargin);
                drawRightArrow(settings.blockLeftMargin, topMargin);
                break;
        }
    };

    var drawHorizontLine = function (pointsArray) {
        var line = new Kinetic.Line({
            points: pointsArray,
            stroke: 'black'
        });

        layers.memoryActionLines.add(line);
        layers.memoryActionLines.batchDraw();
    };

    var drawLeftArrow = function (leftPointX, leftPointY) {
        var polygon = new Kinetic.Polygon({
            points: [leftPointX, leftPointY,
                leftPointX + settings.arrowWidth, leftPointY + settings.arrowHeight,
                leftPointX + settings.arrowWidth, leftPointY - settings.arrowHeight],
            fill: 'black',
            stroke: 'black',
            strokeWidth: 1
        });

        layers.memoryActionLines.add(polygon);
        layers.memoryActionLines.batchDraw();
    };

    var drawRightArrow = function (rightPointX, rightPointY) {
        var polygon = new Kinetic.Polygon({
            points: [rightPointX, rightPointY,
                rightPointX - settings.arrowWidth, rightPointY + settings.arrowHeight,
                rightPointX - settings.arrowWidth, rightPointY - settings.arrowHeight],
            fill: 'black',
            stroke: 'black',
            strokeWidth: 1
        });

        layers.memoryActionLines.add(polygon);
        layers.memoryActionLines.batchDraw();
    };

    var getTextLines = function (text) {
        var words = text.split(' ');
        var line = '';
        var lines = [];
        var context = layers.texts.getContext()._context;

        for (var i = 0; i < words.length; i++) {
            var testLine = line + words[i] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = testLine.length * settings.fontWidth;
            if (testWidth > settings.blockWidth - 20) {
                lines.push(line);
                line = words[i] + ' ';
            } else
                line = testLine;

            if (i === words.length - 1)
                lines.push(line);
        }

        return lines;
    };

    var getBlockHeight = function (textLines) {
        var blockHeight = settings.blockHeight;
        var textHeight = 20;

        textLines.forEach(function (line) {
            var lineHeight = getLineHeight(line);
            textHeight += lineHeight;
        });

        if (textHeight > settings.blockHeight)
            blockHeight = textHeight;

        return blockHeight;
    };

    var getLineHeight = function (line) {
        var lineHeight = settings.lineHeight;
        var wrapCount = line.match(/[\n]/g);
        if (wrapCount && wrapCount.length)
            lineHeight = (++wrapCount.length) * settings.lineHeight;

        return lineHeight;
    };

    var getNewBlockMarginTop = function (blockHeight) {
        var newBlockMarginTop;
        if (layers.main.getChildren().length > 0)
            newBlockMarginTop = lastBlockMarginTop + settings.blockTopMargin + lastBlockHeight;
        else
            newBlockMarginTop = lastBlockMarginTop + settings.blockTopMargin;

        return newBlockMarginTop;
    };

    var resizeCanvas = function (marginTop) {
        if (marginTop + settings.blockHeight > settings.canvasHeight) {
            settings.canvasHeight = marginTop + settings.blockHeight + settings.blockTopMargin;
            stage.setSize(settings.canvasWidth, settings.canvasHeight);
        }
    };

    var drawTimeLine = function () {
        var line = layers.timeLine.getChildren()[0];
        if (!line) {
            line = new Kinetic.Line({
                points: [settings.timeLineLeftMargin, 0, settings.timeLineLeftMargin, settings.canvasHeight],
                stroke: 'black'
            });

            layers.timeLine.add(line);
        } else {
            line.setPoints([settings.timeLineLeftMargin, 0, settings.timeLineLeftMargin, settings.canvasHeight]);
        }

        layers.timeLine.batchDraw();
    };

    var addArrow = function (block) {
        var calledRule = getCalledRule(block.calledRule);
        var distance = block.blockMarginTop - calledRule.blockMarginTop;
        var topBlockCenterY = calledRule.blockMarginTop + calledRule.blockHeight / 2;
        var lowerBlockCenterY = block.blockMarginTop + block.blockHeight / 2;

        var spline = new Kinetic.Spline({
            points: [
                {
                    x: settings.blockLeftMargin + settings.blockWidth - settings.rulePolygonIncline / 2,
                    y: topBlockCenterY
                },
                {
                    x: settings.blockLeftMargin + settings.blockWidth + distance * 0.3,
                    y: topBlockCenterY + distance / 2
                },
                {
                    x: settings.blockLeftMargin + settings.blockWidth,
                    y: lowerBlockCenterY
                }
            ],
            stroke: 'black',
            strokeWidth: 2,
            tension: 1
        });

        layers.calledRulesLines.add(spline);
        layers.calledRulesLines.batchDraw();
        drawLeftArrow(settings.blockLeftMargin + settings.blockWidth, lowerBlockCenterY);
    };

    var addText = function (textLines, newBlockMarginTop) {
        var leftMargin = settings.blockLeftMargin + 10;
        var topMargin = 10;

        textLines.forEach(function (line) {
            var text = new Kinetic.Text({
                x: leftMargin,
                y: newBlockMarginTop + topMargin,
                text: line,
                fontSize: settings.fontSize,
                fontFamily: 'Calibri',
                fill: 'green'
            });

            layers.texts.add(text);

            topMargin += getLineHeight(line);
        });

        layers.texts.batchDraw();
    };

    var getCalledRule = function (calledRuleName) {
        return _blocks.filter(function (block) {
            return block.name === calledRuleName;
        })[0];
    };
}()