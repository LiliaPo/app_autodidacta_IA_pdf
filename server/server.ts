import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { LLMChain } from 'langchain/chains';
import { ChatGroq } from '@langchain/groq';
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import path from 'path';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('client'));

if (!process.env.GROQ_API_KEY) {
  console.error('Error: GROQ_API_KEY no está configurada en el archivo .env');
  process.exit(1);
}

console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY.substring(0, 5) + '...');

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  modelName: 'mixtral-8x7b-32768'
});

const resumenPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    'Eres un asistente útil que genera resúmenes concisos sobre diversos temas.'
  ),
  HumanMessagePromptTemplate.fromTemplate(
    'Genera un resumen conciso sobre el tema: {tema}'
  )
]);

const testPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    'Eres un experto en crear exámenes tipo test sobre diversos temas.'
  ),
  HumanMessagePromptTemplate.fromTemplate(
    'Crea un examen tipo test de {dificultad} dificultad sobre {tema}. ' +
    'Genera 5 preguntas con 4 opciones cada una, donde solo una es correcta. ' +
    'Asegúrate de indicar cuál es la respuesta correcta para cada pregunta.'
  )
]);

const resumenChain = new LLMChain({ llm, prompt: resumenPrompt });
const testChain = new LLMChain({ llm, prompt: testPrompt });

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/resumen', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../client/resumen.html'));
});

app.get('/test', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../client/test.html'));
});

app.get('/progreso', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../client/progreso.html'));
});

app.post('/resumen', async (req: Request, res: Response) => {
  try {
    const { tema } = req.body;
    console.log('Generando resumen para:', tema);
    const resultado = await resumenChain.call({ tema });
    console.log('Resultado del resumen:', resultado);
    if (resultado.text) {
      res.json({ resumen: resultado.text });
    } else {
      throw new Error('No se generó texto para el resumen');
    }
  } catch (error: unknown) {
    console.error('Error al generar el resumen:', error);
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Error al generar el resumen', 
        details: error.message,
        stack: error.stack
      });
    } else {
      res.status(500).json({ 
        error: 'Error desconocido al generar el resumen'
      });
    }
  }
});

app.post('/test', async (req: Request, res: Response) => {
  try {
    const { tema, dificultad } = req.body;
    console.log('Generando test para:', tema, 'con dificultad:', dificultad);
    const resultado = await testChain.call({ tema, dificultad });
    console.log('Resultado del test:', resultado);
    if (resultado.text) {
      res.json({ test: resultado.text });
    } else {
      throw new Error('No se generó texto para el test');
    }
  } catch (error: unknown) {
    console.error('Error al generar el test:', error);
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Error al generar el test', 
        details: error.message,
        stack: error.stack
      });
    } else {
      res.status(500).json({ 
        error: 'Error desconocido al generar el test'
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
