"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const chains_1 = require("langchain/chains");
const groq_1 = require("@langchain/groq");
const prompts_1 = require("@langchain/core/prompts");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use(express_1.default.static('client'));
if (!process.env.GROQ_API_KEY) {
    console.error('Error: GROQ_API_KEY no está configurada en el archivo .env');
    process.exit(1);
}
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY.substring(0, 5) + '...');
const llm = new groq_1.ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    modelName: 'llama-3.1-70b-versatile',
    maxTokens: 20000
});
const resumenPrompt = prompts_1.ChatPromptTemplate.fromPromptMessages([
    prompts_1.SystemMessagePromptTemplate.fromTemplate('Eres un asistente útil que genera informes detallados sobre diversos temas.'),
    prompts_1.HumanMessagePromptTemplate.fromTemplate('Genera un informe detallado de 1000 palabras sobre el tema y añade dos urls de referencia: {tema}')
]);
const testPrompt = prompts_1.ChatPromptTemplate.fromPromptMessages([
    prompts_1.SystemMessagePromptTemplate.fromTemplate('Eres un experto en crear exámenes tipo test sobre diversos temas.'),
    prompts_1.HumanMessagePromptTemplate.fromTemplate('Crea un examen tipo test de {dificultad} dificultad sobre {tema}. ' +
        'Genera 10 preguntas con 4 opciones cada una, donde solo una es correcta. ' +
        'Usa el siguiente formato para cada pregunta:\n' +
        'Pregunta X: [texto de la pregunta]\n' +
        'a) [opción a]\n' +
        'b) [opción b]\n' +
        'c) [opción c]\n' +
        'd) [opción d]\n' +
        'Respuesta correcta: [letra de la respuesta correcta]\n\n') +
        'Cada vez que generas un test, genera un nuevo examen con preguntas diferentes. '
]);
const resumenChain = new chains_1.LLMChain({ llm, prompt: resumenPrompt });
const testChain = new chains_1.LLMChain({ llm, prompt: testPrompt });
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../client/index.html'));
});
app.post('/resumen', async (req, res) => {
    try {
        const { tema } = req.body;
        //console.log('Generando resumen para:', tema);
        const resultado = await resumenChain.call({ tema });
        //console.log('Resultado del resumen:', resultado);
        if (resultado.text) {
            res.json({ resumen: resultado.text });
        }
        else {
            throw new Error('No se generó texto para el resumen');
        }
    }
    catch (error) {
        //console.error('Error al generar el resumen:', error);
        if (error instanceof Error) {
            res.status(500).json({
                error: 'Error al generar el resumen',
                details: error.message,
                stack: error.stack
            });
        }
        else {
            res.status(500).json({
                error: 'Error desconocido al generar el resumen'
            });
        }
    }
});
app.post('/test', async (req, res) => {
    try {
        const { tema, dificultad } = req.body;
        //console.log('Generando test para:', tema, 'con dificultad:', dificultad);
        const resultado = await testChain.call({ tema, dificultad });
        //console.log('Resultado del test:', resultado);
        if (resultado.text) {
            res.json({ test: resultado.text });
        }
        else {
            throw new Error('No se generó texto para el test');
        }
    }
    catch (error) {
        //console.error('Error al generar el test:', error);
        if (error instanceof Error) {
            res.status(500).json({
                error: 'Error al generar el test',
                details: error.message,
                stack: error.stack
            });
        }
        else {
            res.status(500).json({
                error: 'Error desconocido al generar el test'
            });
        }
    }
});
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
