export interface FilterInterface {
    [key: string]: number | FilterInterface;
}
export interface ArgumentsInterface {
    [key: string]: any;
}
declare const _default: (context: any) => {
    filter: FilterInterface;
    arguments: ArgumentsInterface;
};
export default _default;
