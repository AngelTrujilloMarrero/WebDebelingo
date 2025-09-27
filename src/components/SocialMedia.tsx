import React from 'react';
import { Facebook, MessageCircle, Send, Instagram, Heart } from 'lucide-react';

const SocialMedia: React.FC = () => {
  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/debelingoconangel/',
      icon: Facebook,
      color: 'from-blue-600 to-blue-700',
      hoverColor: 'hover:from-blue-700 hover:to-blue-800'
    },
    {
      name: 'WhatsApp',
      url: 'https://whatsapp.com/channel/0029Va8nc2A77qVZokI0aC2K',
      icon: MessageCircle,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      name: 'Telegram',
      url: 'https://t.me/debelingoconangel',
      icon: Send,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/debelingoconangel/',
      icon: Instagram,
      color: 'from-pink-500 to-purple-600',
      hoverColor: 'hover:from-pink-600 hover:to-purple-700'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
          <Heart className="w-8 h-8 animate-pulse text-pink-200" />
          Síguenos en Nuestras Redes
          <Heart className="w-8 h-8 animate-pulse text-pink-200" />
        </h2>
        <p className="text-pink-100 text-center mt-2">
          Mantente conectado para no perderte ninguna verbena
        </p>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {socialLinks.map((social) => {
            const IconComponent = social.icon;
            return (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative bg-gradient-to-br ${social.color} ${social.hoverColor} text-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 transform`}
              >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
                </div>

                <div className="relative flex flex-col items-center text-center space-y-4">
                  <div className="bg-white/20 p-4 rounded-full group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg">{social.name}</h3>
                    <p className="text-sm opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                      Síguenos
                    </p>
                  </div>

                  {/* Hover effect indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></div>
                </div>

                {/* Shine effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
              </a>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-4 border border-purple-500/20">
            <p className="text-purple-200 text-sm">
              📱 Recibe notificaciones instantáneas de nuevas verbenas y eventos especiales
            </p>
            <p className="text-purple-300 text-xs mt-2">
              ¡Únete a nuestra comunidad de amantes de las verbenas de Tenerife!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMedia;
