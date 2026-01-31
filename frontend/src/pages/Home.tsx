import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Willkommen bei meiner Haushaltsbuch App
        </h1>
        <p className="text-xl md:text-2xl mb-8">
          Moderne Full-Stack Anwendung mit React, TypeScript und MongoDB. Die App bildet ein einfaches Haushaltsbuch ab, auf dieses haben Sie nach der Anmeldung bzw. Registrierung Zugriff.
        </p>

        {isAuthenticated ? (
          <Link to="/dashboard" className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-200 shadow-lg">
            Zum Dashboard
          </Link>
        ) : (
          <div className="space-x-4">
            <Link to="/login" className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-200 shadow-lg">
              Anmelden
            </Link>
            <Link to="/register" className="inline-block px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition duration-200">
              Registrieren
            </Link>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">Frontend</h3>
            <p className="text-sm">Benutzerfreundliche Oberfläche mit React, Tailwind CSS und TypeScript</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">Backend</h3>
            <p className="text-sm">Robustes Backend mit Node.js, Express, TypeScript und JWT Authentifizierung</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">Datenbank</h3>
            <p className="text-sm">Leistungsstarke NoSQL-Datenbank mit MongoDB</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
