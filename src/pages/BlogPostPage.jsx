import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getBlogPost } from '../data/blogPosts';

function ImageCarousel({ images }) {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  }, [images.length]);

  if (!images || images.length === 0) return null;

  return (
    <section className="my-10 md:my-14">
      <div className="relative overflow-hidden rounded-xl bg-gray-100">
        <img
          src={images[current].src}
          alt={images[current].caption || ''}
          className="w-full object-cover transition-opacity duration-500"
        />
      </div>
      {images[current].caption && (
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          {images[current].caption}
        </p>
      )}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="이전 이미지"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm text-gray-500 tabular-nums">
            {current + 1} / {images.length}
          </span>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="다음 이미지"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}
    </section>
  );
}


function BlockQuote({ quote }) {
  if (!quote) return null;

  return (
    <figure className="my-10 md:my-14 py-8 border-t border-b border-gray-200">
      <blockquote className="text-xl md:text-2xl font-medium leading-relaxed tracking-tight text-gray-900 mb-6">
        "{quote.text}"
      </blockquote>
      <figcaption className="flex flex-col">
        <span className="font-medium text-gray-900">{quote.author}</span>
        {quote.role && (
          <span className="text-sm text-gray-500 mt-1">{quote.role}</span>
        )}
      </figcaption>
    </figure>
  );
}

function DiagramSection({ diagrams }) {
  if (!diagrams || diagrams.length === 0) return null;

  return diagrams.map((diagram, idx) => (
    <figure key={idx} className="my-10 md:my-14">
      <div className="rounded-xl overflow-hidden bg-gray-50">
        <img
          src={diagram.src}
          alt={diagram.caption || ''}
          className="w-full object-contain"
        />
      </div>
      {diagram.caption && (
        <figcaption className="mt-3 text-sm text-gray-500 leading-relaxed">
          {diagram.caption}
        </figcaption>
      )}
    </figure>
  ));
}

function ActionLinks({ links }) {
  if (!links || links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 my-10">
      {links.map((link, idx) => (
        <a
          key={idx}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-800 transition-colors"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getBlogPost(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-medium text-gray-900 mb-4">게시글을 찾을 수 없습니다</h1>
        <a href="/blog" className="text-blue-600 hover:text-blue-800 font-medium">
          블로그로 돌아가기
        </a>
      </main>
    );
  }

  // Split content by h2 headings to inject rich components between sections
  const sections = post.content.split(/(?=^## )/m);

  return (
    <main>
      {/* Cover Section */}
      <section className="pt-8 md:pt-12">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          {/* Meta + Title */}
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center text-sm font-medium text-gray-500 space-x-3 mb-4">
              <span>{post.date}</span>
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span>{post.category}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-gray-900 leading-tight mb-5">
              {post.title}
            </h1>

            <p className="text-[15px] text-gray-500">{post.author}</p>
          </div>
        </div>

        {/* Cover Image - Full width */}
        <div className="mt-10 max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Article Body */}
      <article className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">
        {/* Lead paragraph */}
        <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium mb-10">
          {post.description}
        </p>

        {/* First section (before first h2) */}
        {sections[0] && (
          <div className="blog-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {sections[0]}
            </ReactMarkdown>
          </div>
        )}

        {/* Image Carousel after intro */}
        {post.images.length > 0 && <ImageCarousel images={post.images} />}

        {/* Remaining sections with diagrams interspersed */}
        {sections.slice(1).map((section, idx) => (
          <React.Fragment key={idx}>
            <div className="blog-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {section}
              </ReactMarkdown>
            </div>
            {/* Insert diagram after first h2 section */}
            {idx === 0 && post.diagrams.length > 0 && (
              <DiagramSection diagrams={post.diagrams} />
            )}
            {/* Insert quote after second h2 section */}
            {idx === 1 && post.quote && <BlockQuote quote={post.quote} />}
          </React.Fragment>
        ))}

        {/* If quote wasn't placed in sections, show it at end */}
        {sections.length <= 2 && post.quote && <BlockQuote quote={post.quote} />}

        {/* Action Links */}
        <ActionLinks links={post.links} />
      </article>
    </main>
  );
}
