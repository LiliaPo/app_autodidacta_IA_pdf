require('dotenv').config();
const express = require('express');
const { LLMChain } = require('langchain/chains');
const { ChatGroq } = require('@langchain/groq');
const { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } = require('@langchain/core/prompts');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('client'));

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.1-instant'
});

const resumenPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    'Eres un asistente educativo especializado en crear resúmenes adaptados a diferentes niveles educativos.'
  ),
  HumanMessagePromptTemplate.fromTemplate(
    'Genera un resumen sobre el tema: {tema}. ' +
    'La dificultad solicitada es: {dificultad}. ' +
    'IMPORTANTE: Adapta el resumen estrictamente según estas pautas:\n' +
    '- Si la dificultad es "fácil": Proporciona un resumen muy corto y simple (máximo 3 frases) adecuado para nivel de primaria. Usa vocabulario básico y conceptos generales que un niño pueda entender fácilmente.\n' +
    '- Si la dificultad es "medio": Ofrece un resumen más detallado (5-7 frases) apropiado para nivel de instituto. Incluye algunos términos técnicos básicos y conceptos más específicos, explicándolos brevemente.\n' +
    '- Si la dificultad es "difícil": Elabora un resumen extenso y técnico (8-10 frases) con información de nivel universitario. Utiliza terminología especializada, conceptos avanzados y, si es relevante, menciona teorías o investigaciones recientes en el campo.\n' +
    'Asegúrate de que la longitud, complejidad y nivel educativo del resumen se ajusten estrictamente al nivel de dificultad solicitado.'
  )
]);

const testPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    'Eres un experto en crear exámenes tipo test sobre diversos temas.'
  ),
  HumanMessagePromptTemplate.fromTemplate(
    'Crea un examen tipo test de {dificultad} dificultad sobre {tema}. ' +
    'Genera 10 preguntas con 4 opciones cada una, donde solo una es correcta. ' +
    'Usa el siguiente formato para cada pregunta:\n' +
    'Pregunta X: [texto de la pregunta]\n' +
    'a) [opción a]\n' +
    'b) [opción b]\n' +
    'c) [opción c]\n' +
    'd) [opción d]\n' +
    'Respuesta correcta: [letra de la respuesta correcta]\n\n'
  )
]);

const resumenChain = new LLMChain({ llm, prompt: resumenPrompt });
const testChain = new LLMChain({ llm, prompt: testPrompt });

app.post('/resumen', async (req, res) => {
  try {
    const { tema, dificultad } = req.body;
    console.log('Generando resumen para:', tema, 'con dificultad:', dificultad);
    const resultado = await resumenChain.call({ tema, dificultad });
    console.log('Resultado del resumen:', resultado);
    if (resultado.text) {
      res.json({ resumen: resultado.text });
    } else {
      throw new Error('No se generó texto para el resumen');
    }
  } catch (error) {
    console.error('Error al generar el resumen:', error);
    res.status(500).json({ 
      error: 'Error al generar el resumen', 
      details: error.message
    });
  }
});

app.post('/test', async (req, res) => {
  const { tema, dificultad } = req.body;
  const resultado = await testChain.call({ tema, dificultad });
  res.json({ test: resultado.text });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
