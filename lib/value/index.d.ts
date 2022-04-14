declare namespace Value {
    type type = 'string' | 'number' | 'float' | 'boolean' | 'id' | '[string]' | '[number]' | '[float]' | '[boolean]' | '[id]';
    interface ValueConstructor {
        unique?: boolean;
        description?: string;
        key?: string;
        default?: any;
        type: type;
    }
}
export default Value;
