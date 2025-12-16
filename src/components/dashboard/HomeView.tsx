import React from 'react';

const HomeView: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="text-center max-w-4xl mx-auto">
        {/* Logo grande */}
        <div className="mb-12">
          <div className="w-32 h-32 mx-auto mb-8 flex items-center justify-center">
            <img 
              src="/Logo, providencia.png" 
              alt="Centro de Especialidades Divina Providencia" 
              className="w-full h-full object-contain rounded-2xl shadow-2xl"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
            Centro de Especialidades<br />
            <span className="text-blue-600">Divina Providencia</span>
          </h1>
          <p className="text-xl text-gray-600">Sistema de Gestión Médica</p>
        </div>

        {/* Versículo Bíblico */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
          <div className="mb-6">
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full"></div>
          </div>
          
          <blockquote className="text-lg md:text-xl italic text-gray-800 leading-relaxed mb-6">
            "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, 
            pensamientos de paz, y no de mal, para daros el fin que esperáis."
          </blockquote>
          
          <cite className="text-base font-semibold text-blue-600">— Jeremías 29:11</cite>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 leading-relaxed">
              Bienvenido al sistema de gestión médica. Utiliza el menú lateral para navegar 
              entre las diferentes secciones y administrar la información de pacientes, doctores, 
              citas médicas y más.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;