import '@types/jest';

declare global {
    namespace jest {
        interface Matchers<R> {
            toContain(expected: string): R;
            toBe(expected: number): R;
        }
    }
} 