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
  const { tema } = req.body;
  const resultado = await resumenChain.call({ tema });
  res.json({ resumen: resultado.text });
});

app.post('/test', async (req, res) => {
  const { tema, dificultad } = req.body;
  const resultado = await testChain.call({ tema, dificultad });
  res.json({ test: resultado.text });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
