declare module 'pdfjs-dist' {
    export const getDocument: any;
    export const GlobalWorkerOptions: {
        workerSrc: any;
    };
}

declare module 'pdfjs-dist/build/pdf.worker.mjs' {
    const worker: any;
    export default worker;
} 