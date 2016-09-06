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
};
var NoteList = function() {
    this._notes = [];
    this._positioned = false;
};
NoteList.prototype = {
    addNote: function (note) {
        this._notes.push(note);
    },
    getNote: function (index) {
        return this._notes[index];
    },
    length: function () {
        return this._notes.length;
    },
    resetLayout: function () {
        this._positioned = false;
    },
    updateLayout: function(chartInstance) {
        if (!this._positioned) {
            //
        }
        return this.position;
    }
};

var NotesPlugin = Chart.PluginBase.extend({
    beforeInit: function(chartInstance) {
        var options = chartInstance.options;
        options.notes = helpers.configMerge(options.notes, Chart.Notes.defaults);
    },
    afterInit: function(chartInstance) { },
    resize: function(chartInstance, newChartSize) {
        // Unfortunately chartInstance.chartArea is not updated at this point
        // so just reset position and recalculate later
        if (this._noteList) {
            this._noteList.resetLayout();
        }
    },

    beforeUpdate: function(chartInstance) { },
    afterScaleUpdate: function(chartInstance) { },

    beforeDatasetsUpdate: function(chartInstance) { },
    afterDatasetsUpdate: function(chartInstance) {
        this._noteList = new NoteList();
        helpers.each(chartInstance.data.datasets, function(dataset, datasetIndex) {
            var notes = dataset.notes || [];
            for (var i = 0; i < notes.length; ++i) {
                var meta = chartInstance.getDatasetMeta(datasetIndex);
				var originElement = meta.data[notes[i].offset];
                this._noteList.addNote(
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
        var ctx = chartInstance.chart.ctx,
            notes = chartInstance.data.notes || [],
            opts = chartInstance.options.notes;
        this._noteList.updateLayout(chartInstance);
        // Canvas setup
        ctx.lineWidth = 2;
        ctx.strokeStyle = opts.borderColor;

        //console.log(chartInstance.chartArea);
        
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
        for (var i=0; i<this._noteList.length(); ++i) {
            var note = this._noteList.getNote(i);
            var location = note.originElement.tooltipPosition();
            drawNoteAt(location.x, location.y);
        };
    },

    destroy: function(chartInstance) { }

});
module.exports = NotesPlugin;
Chart.pluginService.register(new NotesPlugin());
