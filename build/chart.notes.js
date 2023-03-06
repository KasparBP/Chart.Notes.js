import { Chart } from 'chart.js';
import * as helpers from 'chart.js/helpers';

const drawRoundedRect = function (ctx, x, y, width, height, radius) {
    const r = Math.min(radius, height / 2, width / 2);
    const left = x + r;
    const top = y + r;
    const right = x + width - r;
    const bottom = y + height - r;
    ctx.moveTo(x, top);
    const halfPi = Math.PI / 2;
    if (left < right && top < bottom) {
        ctx.arc(left, top, r, -Math.PI, - halfPi);
        ctx.arc(right, top, r, -halfPi, 0);
        ctx.arc(right, bottom, r, 0, halfPi);
        ctx.arc(left, bottom, r, halfPi, Math.PI);
    } else if (left < right) {
        ctx.moveTo(left, y);
        ctx.arc(right, top, r, -halfPi, halfPi);
        ctx.arc(left, top, r, halfPi, Math.PI + halfPi);
    } else if (top < bottom) {
        ctx.arc(left, top, r, -Math.PI, 0);
        ctx.arc(left, bottom, r, 0, Math.PI);
    } else {
        ctx.arc(left, top, r, -Math.PI, Math.PI);
    }
    ctx.closePath();
    ctx.moveTo(x, y);
};
const Note = function(originElement, text, extra) {
    console.log("Note");
    this.originElement = originElement;
    this.text = text;
    this.size = {width: 120, height: 20};
    this.position = {x: 0, y: 0};
    this._textShorted = text;
    this.extra = extra;
};
Note.prototype = {
    _setFont: function (opts, ctx) {
        ctx.font = helpers.fontString(opts.fontSize, opts.fontStyle, opts.fontFamily);
    },
    resize: function (chartInstance, ctx) {
        let opts = chartInstance.options.plugins.notes,
            gutter = 2 * opts.fontSpacing,
            width;
        this._setFont(opts, ctx);
        this._textShorted = this.text;
        width = ctx.measureText(this.text).width + gutter;
        while (width > opts.maxWidth) {
            const diff = width - opts.maxWidth,
                estimatedCharWidth = opts.fontSize / 2,
                newLen = this._textShorted.length - Math.ceil(diff / estimatedCharWidth + 3);
            this._textShorted = this._textShorted.substring(0, 
                Math.max(1, newLen)) + "...";
            width = ctx.measureText(this._textShorted).width + gutter;
        }
        this.size = {
            height: opts.fontSize + gutter,
            width: Math.max(width, opts.minWidth)
        };
    },
    reposition: function(chartArea) {
        let originPosition = this.originElement.tooltipPosition(),
            x = originPosition.x - chartArea.left,
            y = originPosition.y - chartArea.top,
            chartWidth = chartArea.right - chartArea.left,
            chartHeight = chartArea.bottom - chartArea.top,
            halfChartWidth = chartWidth / 2,
            halfChartHeight = chartHeight / 2,
            distance = 8,
            finalPosition;
        /*------------------------
          | Q1       | Q2        |
          ------------------------
          | Q3       | Q4        |
          ------------------------ */
        if (x <= halfChartWidth && y <= halfChartHeight) { // Q1
           finalPosition = {
               x: originPosition.x + distance,
               y: (originPosition.y - this.size.height) - distance
           };
        } else if (x > halfChartWidth && y <= halfChartHeight) { // Q2
            finalPosition = {
               x: (originPosition.x - this.size.width) - distance,
               y: (originPosition.y - this.size.height) - distance
           };
        } else if (x <= halfChartWidth && y > halfChartHeight) { // Q3
            finalPosition = {
               x: originPosition.x + distance,
               y: (originPosition.y - this.size.height) - distance
           };
        } else { // Q4
            finalPosition = {
               x: (originPosition.x - this.size.width) - distance,
               y: (originPosition.y - this.size.height) - distance
           };
        }
        finalPosition.x = Math.max(finalPosition.x, chartArea.left);
        finalPosition.y = Math.max(finalPosition.y, chartArea.top);
        this.position = finalPosition;
    },
    draw: function (chartInstance, ctx) {
        const originPosition = this.originElement.tooltipPosition(),
            opts = chartInstance.options.plugins.notes,
            oldDash = ctx.getLineDash(),
            oldFill = ctx.fillStyle;

        ctx.setLineDash([2, 2]);
        ctx.beginPath();
		ctx.moveTo(originPosition.x, originPosition.y);
        ctx.lineTo(this.position.x, this.position.y + this.size.height);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash(oldDash);

        drawRoundedRect(ctx, this.position.x, this.position.y, this.size.width, this.size.height, 3);
        ctx.fill();
        ctx.stroke();
        this._setFont(chartInstance, ctx);
        ctx.fillStyle = opts.fontColor;
        ctx.fillText(this._textShorted, this.position.x + opts.fontSpacing, 
            this.position.y + this.size.height / 2);
        ctx.fillStyle = oldFill;
    },
    hit: function(position) {
        const left = this.position.x,
            top = this.position.y,
            right = this.position.x + this.size.width,
            bottom = this.position.y + this.size.height;
        return left <= position.x &&
            top <= position.y &&
            right >= position.x &&
            bottom >= position.y;

    }
};

const NoteList = function () {
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
    updateLayout: function(chartInstance, ctx) {
        if (!this._positioned) {
            for (let i=0, l=this._notes.length; i<l; ++i) {
                const note = this._notes[i];
                note.resize(chartInstance, ctx);
                note.reposition(chartInstance.chartArea);
            }
            this._positioned = true;
        }
    },
    draw: function(chartInstance, ctx) {
        for (let i=0; i<this._notes.length; ++i) {
            this._notes[i].draw(chartInstance, ctx);
        }
    },
    didHitNote: function(position) {
        for (let i=0; i<this._notes.length; ++i) {
            const note = this._notes[i];
            if (note.hit(position)) {
                return note;
            }
        }
        return null;
    }
};

const NotesOnClick = function (event, active) {
    console.log("NotesOnClick");
    // !!!! 'this' is pointing to the chart controller.
    let chartInstance = this,
        hitNote;
    if (chartInstance._noteList) {
        const options = chartInstance.options.notes,
            pos = helpers.getRelativePosition(event, chartInstance.chart);
        hitNote = chartInstance._noteList.didHitNote(pos);
        if (hitNote && options && options.onClick) {
            options.onClick.call(this, event, hitNote);
        }
    }
    if (!hitNote && chartInstance._notesOriginalOnClick) {
        chartInstance._notesOriginalOnClick.call(this, event, active);
    }
};

const notesPlugin = {
    id: 'notes',
    beforeRegister: () => { },
    afterRegister: () => { },
    afterUnregister: () => { },
    afterDataLimits: (chart, args) => { },
    beforeEvent: (chart, args, options) => { },
    beforeInit: (chartInstance) => {
        const options = chartInstance.options;
        
        // Chart.JS only support one onClick handler, so save the user configured handler 
        // override it and call it from our own handler instead.
        chartInstance._notesOriginalOnClick = options.onClick;
        options.onClick = NotesOnClick;
    },
    afterInit: (chartInstance) => { },

    resize: (chartInstance, newChartSize) => {
        // Unfortunately chartInstance.chartArea is not updated at this point
        // so just reset position and recalculate later
        if (chartInstance._noteList) {
            chartInstance._noteList.resetLayout();
        }
    },

    beforeUpdate: (chart, args, options) => { },
    afterScaleUpdate: (chartInstance) => { },
    afterDatasetDraw: (chartInstance) => { },
    beforeDatasetsUpdate: (chartInstance) => { },
    afterDatasetsUpdate: function (chartInstance) {
        chartInstance._noteList = new NoteList();
        helpers.each(chartInstance.data.datasets, function(dataset, datasetIndex) {
            const notes = dataset.plugins.notes.notes || [];
            for (let i = 0; i < notes.length; ++i) {
                const meta = chartInstance.getDatasetMeta(datasetIndex);
                const originElement = meta.data[notes[i].offset];
                chartInstance._noteList.addNote(
                    new Note(originElement, notes[i].text, notes[i].extra));
            }
        }, this);
    },
    afterUpdate: (chart, args, options) => { },

    // This is called at the start of a render. It is only called once, even if the animation will run for a number of frames. Use beforeDraw or afterDraw
    // to do something on each animation frame
    beforeRender: (chartInstance) => { },

    // Easing is for animation
    beforeDraw: (chartInstance, easing) => { },
    afterDraw: (chartInstance, easing) => { },

    // Before the datasets are drawn but after scales are drawn
    beforeDatasetsDraw: (chart, _args, options) => { },
    afterDatasetsDraw: (chart, _args, options) => {
        const ctx = chart.ctx,
            opts = chart.options.plugins.notes,
            noteList = chart._noteList;
        noteList.resetLayout();
        noteList.updateLayout(chart, ctx);
        // Canvas setup
        ctx.lineWidth = 1;
        ctx.fillStyle = opts.backgroundColor;
        ctx.strokeStyle = opts.borderColor;

        noteList.draw(chart, ctx);
    },

    destroy: (chartInstance)  => {
        console.log("destroy");
    },

    defaults: {
        backgroundColor: "rgba(0,0,0,0.8)",
        borderColor: "rgba(0,0,0,0.8)",
        fontColor: "#fff",
        fontStyle: "normal",
        fontSize: 13,
        fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        fontSpacing: 5,
        maxWidth: 180,
        minWidth: 60
    },

    additionalOptionScopes: ['']
};
Chart.register(notesPlugin);

export { notesPlugin as default };
