import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';

export default function BlogListPage() {
  const featured = BLOG_POSTS[0];
  const rest = BLOG_POSTS.slice(1);

  return (
    <main>
      {/* Hero */}
      <section className="pt-12 pb-6 max-w-[1440px] mx-auto px-4 md:px-8">
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-gray-900 mb-4">블로그</h1>
        <p className="text-lg text-gray-500 max-w-2xl">최신 AI 연구 성과, 프로젝트 및 업데이트</p>
      </section>

      {/* Featured + List */}
      <section className="py-12 max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Featured */}
          <div className="md:col-span-7">
            <Link to={`/blog/${featured.slug}`} className="group block">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-6 bg-gray-100">
                <img
                  src={featured.coverImage}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center text-sm font-medium text-gray-500 space-x-3 mb-3">
                <span>{featured.date}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>{featured.category}</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-medium tracking-tight mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                {featured.title}
              </h2>
              <p className="text-gray-600 text-[17px] leading-relaxed line-clamp-3 mb-4">
                {featured.description}
              </p>
              <span className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-800 transition-colors">
                더 읽기 <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </Link>
          </div>

          {/* List */}
          <div className="md:col-span-5 flex flex-col divide-y divide-gray-100">
            {rest.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group flex gap-5 py-6 first:pt-0 last:pb-0"
              >
                <div className="flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <div className="flex items-center text-xs font-medium text-gray-500 space-x-2 mb-2">
                    <span>{post.date}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{post.category}</span>
                  </div>
                  <h3 className="text-base md:text-lg font-medium tracking-tight group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
