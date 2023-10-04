export function isTruthy<T>(v: T | undefined | null): v is T {return !!v};

export function not<T>(fn: (t: T) => boolean) {
    return (t: T) => !(fn(t));
}

