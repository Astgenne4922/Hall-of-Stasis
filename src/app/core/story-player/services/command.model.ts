export type Command = {
    command: string;
    parameters: {
        [key: string]: string;
    } | null;
    content: string | null;
};
