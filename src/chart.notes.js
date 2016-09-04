var Chart = require('chart.js');
Chart = typeof(Chart) === 'function' ? Chart : window.Chart;

var helpers = Chart.helpers;

Chart.Notes = Chart.Notes || {};
// Default options if none are provided
var defaultOptions = Chart.Notes.defaults = {
	notes: [] // default to no notes
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
    afterDatasetsUpdate: function(chartInstance) { },
    afterUpdate: function(chartInstance) { },

    // This is called at the start of a render. It is only called once, even if the animation will run for a number of frames. Use beforeDraw or afterDraw
    // to do something on each animation frame
    beforeRender: function(chartInstance) { },

    // Easing is for animation
    beforeDraw: function(chartInstance, easing) { },
    afterDraw: function(chartInstance, easing) { },
    // Before the datasets are drawn but after scales are drawn
    beforeDatasetsDraw: function(chartInstance, easing) { },
    afterDatasetsDraw: function(chartInstance, easing) { },

    destroy: function(chartInstance) { }

});
module.exports = NotesPlugin;
Chart.pluginService.register(new NotesPlugin());
