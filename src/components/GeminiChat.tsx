import React, { useState } from 'react';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { Event } from '../types';

interface GeminiChatProps {
  events: Event[];
}

const GeminiChat: React.FC<GeminiChatProps> = ({ events }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendToGemini = async () => {
    if (!input.trim()) {
      setResponse('Por favor, ingresa un texto.');
      return;
    }

    setIsLoading(true);
    setResponse('');

    try {
      console.log('Texto ingresado:', input);
      console.log('Datos events:', JSON.stringify(events));

      const body = JSON.stringify({
        contents: [{
          parts: [
            { text: `BASE DE DATOS ENTERA: ${JSON.stringify(events)}` },
            { text: input }
          ]
        }]
      });

      console.log('Cuerpo de la petición:', body);

      const apiResponse = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyC05peRrJpZ6JR__skiqK2XByz0wVoKrn0',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: body
        }
      );

      console.log('Respuesta completa:', apiResponse);

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        console.log("Datos de la respuesta:", data);

        if (
          data.candidates &&
          data.candidates.length > 0 &&
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts.length > 0
        ) {
          const content = data.candidates[0].content;
          const geminiResponse = content.parts[0].text;
          
          if (geminiResponse) {
            setResponse(geminiResponse.trim());
          } else {
            setResponse('Respuesta vacía.');
          }
        } else {
          console.error("Formato de respuesta inesperado:", data);
          setResponse('Error: Formato de respuesta de la IA inesperado.');
        }
      } else {
        console.error('Error en la respuesta:', apiResponse.status, apiResponse.statusText);
        setResponse(`Error al obtener la respuesta de la IA: ${apiResponse.status} ${apiResponse.statusText}`);
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      setResponse('Error al obtener la respuesta de la IA: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendToGemini();
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
          <Bot className="w-8 h-8 animate-pulse" />
          Pregunta a la IA de Gemini
          <Sparkles className="w-8 h-8 animate-pulse" />
        </h2>
        <p className="text-purple-100 text-center mt-2">
          Haz preguntas sobre las verbenas y eventos de Tenerife
        </p>
      </div>

      {/* Chat Interface */}
      <div className="p-6 space-y-6">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta aquí... Ej: ¿Qué orquesta tiene más actuaciones este año?"
              rows={4}
              className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 resize-none backdrop-blur-sm"
              disabled={isLoading}
            />
            <div className="absolute top-2 right-2">
              <User className="w-6 h-6 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:cursor-not-allowed group hover:shadow-lg hover:shadow-purple-500/25"
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                <span>Enviar Pregunta</span>
              </>
            )}
          </button>
        </form>

        {/* Response Area */}
        {(response || isLoading) && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-300">
              <Bot className="w-6 h-6" />
              <span className="font-semibold">Respuesta de Gemini:</span>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2 py-8">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                  <div 
                    className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" 
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div 
                    className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" 
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <span className="text-white ml-4">Generando respuesta...</span>
                </div>
              ) : (
                <div className="text-white whitespace-pre-wrap leading-relaxed">
                  {response}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Questions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Preguntas sugeridas:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              '¿Qué eventos hay este fin de semana?',
              '¿Cuál es la orquesta con más actuaciones?',
              '¿Dónde hay verbenas en La Laguna?',
              '¿Qué eventos hay en diciembre?'
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                className="text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/50 rounded-lg text-purple-200 hover:text-white transition-all duration-300 text-sm"
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiChat;
