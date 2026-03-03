import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { FEATURED_CAROUSEL } from '../data/constants';

const FeaturedCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect).on('select', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="pt-8 pb-16 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 relative">

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 md:gap-6 touch-pan-y">
            {FEATURED_CAROUSEL.map((item) => (
              <article
                key={item.id}
                className="flex-none min-w-0 relative group w-[85vw] sm:w-[75vw] md:w-[calc(62.5%-1rem)] lg:w-[calc(41.666%-1rem)] xl:w-[calc(33.333%-1rem)] aspect-[3/4] rounded-[24px] lg:rounded-[36px] overflow-hidden"
              >
                <a href="#" className="absolute inset-0 z-30 focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_#ffffff] rounded-[24px] lg:rounded-[36px]" aria-label={item.title}></a>

                <div className="absolute inset-0 z-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-all duration-[350ms] ease-in-out group-hover:scale-[1.05] group-hover:contrast-[1.05] group-hover:brightness-[0.975]"
                  />
                </div>

                <div className="absolute inset-0 z-10 bg-[#2f3034]/40 group-hover:bg-[#2f3034]/50 transition-colors duration-150 pointer-events-none"></div>

                <div className="relative z-20 h-full flex flex-col justify-between p-6 lg:p-[24px] pointer-events-none">
                  <div>
                    <h3 className="text-white text-[1.125rem] font-medium tracking-[-0.00389em] leading-[1.45] mb-[0.25rem]">
                      {item.title}
                    </h3>
                    <p className="text-white/72 text-[1.09375rem] font-normal leading-[1.45] tracking-[0.01188em]">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-auto">
                    <button className="pointer-events-auto flex items-center justify-center px-[16px] py-[8px] bg-white/10 border border-white/20 text-white font-medium rounded-full text-[0.90625rem] leading-[1.25] transition-colors hover:bg-white/20 z-40 relative">
                      자세히 보기
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-start">
          <div className="flex items-center space-x-2">
            <button
              onClick={scrollPrev}
              disabled={prevBtnDisabled}
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${
                prevBtnDisabled
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-800 hover:bg-gray-50'
              }`}
              aria-label="이전 슬라이드"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={scrollNext}
              disabled={nextBtnDisabled}
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${
                nextBtnDisabled
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-800 hover:bg-gray-50'
              }`}
              aria-label="다음 슬라이드"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FeaturedCarousel;
