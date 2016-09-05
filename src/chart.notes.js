var Chart = require("chart.js");
Chart = typeof(Chart) === "function" ? Chart : window.Chart;
var helpers = Chart.helpers;

Chart.Notes = Chart.Notes || {};

// Default options if none are provided
var defaultOptions = Chart.Notes.defaults = {
    backgroundColor: "rgba(166,85,15,0.2)",
    borderColor: "#333333",
    fontColor: "#333333", 
};

var Note = function(originElement, text) {
    this.originElement = originElement;
    this.text = text;
    return this;
};
Note.prototype.resetPosition = function () {
    this.position = null;
};
Note.prototype.updatePosition = function () {
    // TODO
    this.position = null;
};

var NotesPlugin = Chart.PluginBase.extend({
    beforeInit: function(chartInstance) {
        var options = chartInstance.options;
        options.notes = helpers.configMerge(options.notes, Chart.Notes.defaults);
        this._notes = [];
    },
    afterInit: function(chartInstance) { },
    resize: function(chartInstance, newChartSize) {
        helpers.each(this._notes, function(note) {
            note.resetPosition();
        }, this);
    },

    beforeUpdate: function(chartInstance) { },
    afterScaleUpdate: function(chartInstance) { },

    beforeDatasetsUpdate: function(chartInstance) { },
    afterDatasetsUpdate: function(chartInstance) {
        this._notes = [];
        helpers.each(chartInstance.data.datasets, function(dataset, datasetIndex) {
            var notes = dataset.notes || [];
            for (var i = 0; i < notes.length; ++i) {
                var meta = chartInstance.getDatasetMeta(datasetIndex);
				var originElement = meta.data[notes[i].offset];
                this._notes.push(
                    new Note(originElement, notes[i].text));
            }
        }, this);
    },
    afterUpdate: function(chartInstance) { },

    // This is called at the start of a render. It is only called once, even if the animation will run for a number of frames. Use beforeDraw or afterDraw
    // to do something on each animation frame
    beforeRender: function(chartInstance) { },

    // Easing is for animation
    beforeDraw: function(chartInstance, easing) { },
    afterDraw: function(chartInstance, easing) { },

    // Before the datasets are drawn but after scales are drawn
    beforeDatasetsDraw: function(chartInstance, easing) { },
    afterDatasetsDraw: function(chartInstance, easing) {
        var ctx = chartInstance.chart.ctx;
        var notes = chartInstance.data.notes || [];
        var opts = chartInstance.options.notes;

        // Canvas setup
        ctx.lineWidth = 2;
        ctx.strokeStyle = opts.borderColor;

        //console.log(chartInstance.chartArea);
        //console.log(this._notes);
        
        ctx.beginPath();
        ctx.moveTo(chartInstance.chartArea.left, chartInstance.chartArea.top);
        ctx.lineTo(chartInstance.chartArea.right, chartInstance.chartArea.bottom);
        ctx.moveTo(chartInstance.chartArea.right, chartInstance.chartArea.top);
        ctx.lineTo(chartInstance.chartArea.left, chartInstance.chartArea.bottom);
        ctx.stroke();

        function drawNoteAt(x, y) {
            ctx.beginPath();
            ctx.moveTo(x - 10, y - 10);
            ctx.lineTo(x + 10, y + 10);
            ctx.moveTo(x + 10, y - 10);
            ctx.lineTo(x - 10, y + 10);
            ctx.stroke();
        }
        helpers.each(this._notes, function (note) {
            var location = note.originElement.tooltipPosition();
            drawNoteAt(location.x, location.y);
        }, this);
    },

    destroy: function(chartInstance) { }

});
module.exports = NotesPlugin;
Chart.pluginService.register(new NotesPlugin());
