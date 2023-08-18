export interface TableColumn {
    name: string;
    dataKey: string;
    position?: 'right' | 'left';
    isSortable?: boolean;
    isClickable?: boolean;
    canHighlighted?: boolean;
    color?:string;
}