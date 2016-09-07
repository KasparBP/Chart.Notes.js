(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
var Chart = require("chart.js");
Chart = typeof(Chart) === "function" ? Chart : window.Chart;
var helpers = Chart.helpers;

Chart.Notes = Chart.Notes || {};

// Default options if none are provided
var defaultOptions = Chart.Notes.defaults = {
    backgroundColor: "rgba(180,180,180,0.5)",
    borderColor: "rgba(60,60,60,1)",
    fontColor: "#000000", 
};

var Note = function(originElement, text) {
    this.originElement = originElement;
    this.text = text;
};
Note.prototype = {
    minSize: function() {
        // TODO Hardcoded for now
        return {
            width: 120,
            height: 20
        }
    },
    reposition: function(chartArea) {
        // Do not count gutters
        var originPosition = this.originElement.tooltipPosition(),
            x = originPosition.x - chartArea.left,
            y = originPosition.y - chartArea.top,
            chartWidth = chartArea.right - chartArea.left,
            chartHeight = chartArea.bottom - chartArea.top,
            halfChartWidth = chartWidth/2,
            halfChartHeight = chartHeight/2,
            distance = 8,
            finalPosition;
        /*
          ------------------------
          | Q1       | Q2        |
          ------------------------
          | Q3       | Q4        |
          ------------------------
         */

        if (x <= halfChartWidth && y <= halfChartHeight) {
           // Q1
           finalPosition = {
               x: originPosition.x + distance,
               y: (originPosition.y - this.minSize().height) - distance
           } 
        } else if (x > halfChartWidth && y <= halfChartHeight) {
            // Q2
            finalPosition = {
               x: (originPosition.x - this.minSize().width) - distance,
               y: (originPosition.y - this.minSize().height) - distance
           } 
        } else if (x <= halfChartWidth && y > halfChartHeight) {
            // Q3
            finalPosition = {
               x: originPosition.x + distance,
               y: (originPosition.y - this.minSize().height) - distance
           }
        } else {
            // Q4
            finalPosition = {
               x: (originPosition.x - this.minSize().width) - distance,
               y: (originPosition.y - this.minSize().height) - distance
           }
        }
        if (finalPosition.x < chartArea.left) {
            finalPosition.x = chartArea.left;
        }
        if (finalPosition.y < chartArea.top) {
            finalPosition.x = chartArea.top;
        }
        
        this.position = finalPosition;
    },
    draw: function (chartInstance, ctx) {
        var originPosition = this.originElement.tooltipPosition(),
            opts = chartInstance.options.notes,
            oldDash = ctx.getLineDash(),
            oldFill = ctx.fillStyle;

        ctx.setLineDash([2, 2]);
        ctx.beginPath();
		ctx.moveTo(originPosition.x, originPosition.y);
        ctx.lineTo(this.position.x, this.position.y + this.minSize().height);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash(oldDash);

        helpers.drawRoundedRectangle(ctx, this.position.x, this.position.y, 
            this.minSize().width, this.minSize().height, 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = opts.fontColor;
        ctx.fillText(this.text, this.position.x + 3, this.position.y + 3);
        ctx.fillStyle = oldFill;
    }
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
            for (var i=0; i<this._notes.length; ++i) {
                this._notes[i].reposition(chartInstance.chartArea);
            }
            this._positioned = true;
        }
    },
    draw: function(chartInstance, ctx) {
        for (var i=0; i<this._notes.length; ++i) {
            this._notes[i].draw(chartInstance, ctx);
        }
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
        if (easing != this._easing) {
            // Make sure we reset layout when we are done "easing".
            this._noteList.resetLayout();
            this._easing = easing;
        }
        // Canvas setup
        ctx.lineWidth = 1;
        ctx.fillStyle = opts.backgroundColor;
        ctx.strokeStyle = opts.borderColor;

        this._noteList.draw(chartInstance, ctx);
    },

    destroy: function(chartInstance) { }

});
module.exports = NotesPlugin;
Chart.pluginService.register(new NotesPlugin());

},{"chart.js":1}]},{},[2])