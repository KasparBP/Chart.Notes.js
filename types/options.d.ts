
interface NotesSize {
    width: number;
    height: number;
}
interface NotesPosition {
    x: number;
    y: number;
}
export interface NotesOptions {
    text?: string;
    size?: NotesSize;
    position?: NotesPosition;
    extra?: string;
}

