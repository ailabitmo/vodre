var visualization = new function () {
    var self = this;
    var stage;
    var layers = {};

    var settings = {
        canvasWidth:600,
        canvasHeight:200,
        blockWidth:300,
        blockHeight:50,
        blockLeftMargin:50,
        blockTopMargin:50,
        fontSize:14,
        fontWidth:6,
        lineHeight:15
    };

    var lastBlockMarginTop = 0;
    var lastBlockHeight = settings.blockHeight;

    $(document).ready(function () {
        initKinetic();
    });

    var initKinetic = function () {
        stage = new Kinetic.Stage({
            width:settings.canvasWidth,
            height:settings.canvasHeight,
            container:'droolsVisualizationCanvas'
        });
        layers.main = new Kinetic.Layer();
        layers.texts = new Kinetic.Layer();
        stage.add(layers.main);
        stage.add(layers.texts);
    };

    this.drawBlocks = function (blocks) {
        blocks.forEach(function (block) {
            self.addBlock(block);
        });
    };

    this.addBlock = function (block) {
        var textLines = getTextLines("Name: " + block.name + "\nType: " + block.type);
        var blockHeight = getBlockHeight(textLines);

        var newBlockMarginTop = getNewBlockMarginTop(blockHeight);

        if (layers.main.getChildren().length > 0)
            addArrow(lastBlockMarginTop, newBlockMarginTop);

        lastBlockMarginTop = newBlockMarginTop;

        resizeCanvas(newBlockMarginTop);
        var rect = new Kinetic.Rect({
            width:settings.blockWidth,
            height:blockHeight,
            x:settings.blockLeftMargin,
            y:newBlockMarginTop,
            fill:'lightgreen',
            stroke:'black',
            strokeWidth:1
        });

        layers.main.add(rect);
        layers.main.batchDraw();
        lastBlockHeight = blockHeight;

        addText(textLines, newBlockMarginTop);
    };

    var getTextLines = function (text) {
        var words = text.split(' ');
        var line = '';
        var lines = [];
        var context = layers.texts.getContext()._context;

        for (var i = 0; i < words.length; i++) {
            var testLine = line + words[i] + ' ';
            var metrics = context.measureText(testLine);
            //var testWidth = metrics.width;
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
        if (marginTop + settings.blockHeight > settings.canvasHeight)
            stage.setSize(settings.canvasWidth, marginTop + settings.blockHeight + settings.blockTopMargin);
    };

    var addArrow = function (lastBlockMarginTop, newBlockMarginTop) {
        var leftMargin = settings.blockLeftMargin + settings.blockWidth / 2;

        var line = new Kinetic.Line({
            points:[leftMargin, lastBlockMarginTop + lastBlockHeight, leftMargin, newBlockMarginTop],
            stroke:'black'
        });

        layers.main.add(line);
    };

    var addText = function (textLines, newBlockMarginTop) {
        var leftMargin = settings.blockLeftMargin + 10;
        var topMargin = 10;

        textLines.forEach(function (line) {
            var text = new Kinetic.Text({
                x:leftMargin,
                y:newBlockMarginTop + topMargin,
                text:line,
                fontSize:settings.fontSize,
                fontFamily:'Calibri',
                fill:'green'
            });

            layers.texts.add(text);

            topMargin += getLineHeight(line);
        });

        layers.texts.batchDraw();
    };
}()