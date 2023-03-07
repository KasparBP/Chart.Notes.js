import {ChartType, Plugin} from 'chart.js';
import {NotesOptions} from './options';

declare module 'chart.js' {
    interface ChartDatasetProperties<TType extends ChartType, TData> {
        notes?: NotesOptions;
    }

    interface PluginOptionsByType<TType extends ChartType> {
        notes?: NotesOptions;
    }
}

declare const plugin: Plugin;
export default plugin;
