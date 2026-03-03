import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/constants';

const PortfolioSection = () => {
  const [activeProject, setActiveProject] = useState(0);

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-900 mb-2">포트폴리오</h2>
            <p className="text-xl text-gray-500 tracking-tight">주요 프로젝트</p>
          </div>
          <button className="hidden md:flex px-5 py-2.5 border border-gray-300 rounded-full font-medium text-sm hover:bg-white transition-colors">
            전체 보기
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          {/* Tab List */}
          <div className="md:w-1/3 flex flex-col border-l-2 border-gray-200">
            {PORTFOLIO_DATA.map((project) => (
              <button
                key={project.id}
                onClick={() => setActiveProject(project.id)}
                className={`text-left pl-6 py-5 -ml-[2px] border-l-2 transition-all duration-300 ${
                  activeProject === project.id
                    ? 'border-blue-600 text-gray-900 bg-white shadow-sm rounded-r-2xl'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-r-2xl'
                }`}
              >
                <h3 className="text-xl font-medium tracking-tight mb-2">
                  {project.title}
                </h3>
                {activeProject === project.id && (
                  <p className="text-sm text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-2">
                    {project.subtitle}
                  </p>
                )}
              </button>
            ))}
          </div>

          {/* Project Image Display */}
          <div className="md:w-2/3">
            <div className="relative aspect-video md:aspect-[3/2] rounded-3xl overflow-hidden bg-gray-900 group cursor-pointer shadow-xl">
              <img
                src={PORTFOLIO_DATA[activeProject].image}
                alt={PORTFOLIO_DATA[activeProject].title}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>

              {/* View Project Button */}
              <div className="absolute bottom-6 left-6 flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-md rounded-full text-white font-medium text-sm group-hover:bg-white/30 transition-all duration-300">
                프로젝트 보기 <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
