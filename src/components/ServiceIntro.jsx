import React from 'react';
import { Zap, Sparkles, Shield } from 'lucide-react';

const CORE_VALUES = [
  {
    icon: Zap,
    title: '빠른 기술 적용력',
    desc: '급변하는 IT 시장에서 새로운 기술을 가장 먼저 테스트하고 실제 프로젝트에 적용합니다. 최신 프레임워크 도입으로 개발 효율을 극대화하고, 민첩한 문제 해결을 통해 납기일과 퀄리티를 동시에 충족합니다.',
  },
  {
    icon: Sparkles,
    title: '수준 높은 인터랙션',
    desc: '단순한 화면 구성을 넘어 브랜드 가치를 높이는 역동적인 웹 경험을 구현합니다. 사용자 경험(UX)을 극대화하는 섬세한 애니메이션과 인터랙션으로 차별화된 디지털 제품을 만듭니다.',
  },
  {
    icon: Shield,
    title: '안정적인 동반 성장',
    desc: '프로젝트 완료 후에도 안정적인 유지보수와 고도화 작업을 통해 비즈니스의 동반자로서 함께 성장합니다. 장기적인 관점에서 기술 파트너십을 이어갑니다.',
  },
];

const ServiceIntro = () => {
  return (
    <section className="py-24 border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* 철학 */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center mb-20">
          <div className="md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-900 mb-6">
              서비스소개
            </h2>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-6">
              CoreLoop은 기업의 디지털 전환을 이끄는 소프트웨어 개발 아웃소싱 전문 기업입니다. 다년간의 축적된 경험과 민첩한 개발 프로세스를 통해 고객의 비즈니스 목표를 실현하는 최적의 솔루션을 제공합니다.
            </p>
            <p className="text-base text-gray-500 leading-relaxed border-l-2 border-blue-600 pl-5">
              CoreLoop은 단순한 개발 외주 회사가 아닙니다. 기술로 비즈니스의 내일을 설계하는 여러분의 든든한 기술 파트너입니다.
            </p>
          </div>
          <div className="md:w-1/2">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1440&auto=format&fit=crop"
                alt="CoreLoop 팀 협업"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* 핵심 경쟁력 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {CORE_VALUES.map((item, idx) => (
            <div
              key={idx}
              className="group p-8 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-lg hover:border-gray-200 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                <item.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-medium tracking-tight text-gray-900 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-[15px]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceIntro;
