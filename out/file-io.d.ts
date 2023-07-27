export type read_type = {
    message: string;
    bytes_read: number;
    num_lines: number | any;
    payload: string | null;
};
export declare const write: (path: string, data: string) => Promise<string>;
export declare const read: (path: string) => Promise<read_type>;
