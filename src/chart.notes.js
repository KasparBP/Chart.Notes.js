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

var NotesPlugin = Chart.PluginBase.extend({
    beforeInit: function(chartInstance) { 
        var options = chartInstance.options;
        options.notes = helpers.configMerge(options.notes, Chart.Notes.defaults);
    },
    afterInit: function(chartInstance) { },
    resize: function(chartInstance, newChartSize) { },
    beforeUpdate: function(chartInstance) { },
    afterScaleUpdate: function(chartInstance) { },

    beforeDatasetsUpdate: function(chartInstance) { },
    afterDatasetsUpdate: function(chartInstance) { 
        // Save notes here?
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

        function drawNoteAt(x, y) {
            ctx.beginPath();
            
            ctx.moveTo(x - 10, y - 10);
            ctx.lineTo(x + 10, y + 10);

            ctx.moveTo(x + 10, y - 10);
            ctx.lineTo(x - 10, y + 10);

            ctx.stroke();
        }

        helpers.each(chartInstance.data.datasets, function(dataset, datasetIndex) {
            var notes = dataset.notes || [];
            for (var i = 0; i < notes.length; ++i) {
                var text = notes[i].text;
                var meta = chartInstance.getDatasetMeta(datasetIndex);
				var noteOriginElement = meta.data[notes[i].offset];
                // The tooltip position is where we want the notes to originate from. 
                var location = noteOriginElement.tooltipPosition();
                drawNoteAt(location.x, location.y);
            }
        }, this);
    },

    destroy: function(chartInstance) { }

});
module.exports = NotesPlugin;
Chart.pluginService.register(new NotesPlugin());
