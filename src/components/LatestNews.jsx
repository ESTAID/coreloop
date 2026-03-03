import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';

const LatestNews = () => {
  const featured = BLOG_POSTS[0];
  const list = BLOG_POSTS.slice(1);

  return (
    <section className="py-24 max-w-[1440px] mx-auto px-4 md:px-8">
      <div className="flex justify-between items-end mb-12">
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-900">블로그</h2>
        <Link to="/blog" className="hidden md:flex items-center px-5 py-2.5 border border-gray-300 rounded-full font-medium text-sm hover:bg-gray-50 transition-colors">
          전체 보기 <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 md:items-start gap-8 md:gap-12">
        {/* Featured Card */}
        <div className="md:col-span-6 md:sticky md:top-24">
          <Link to={`/blog/${featured.slug}`} className="group block h-full">
            <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden mb-6 bg-gray-100">
              <img
                src={featured.coverImage}
                alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <h3 className="text-3xl md:text-4xl font-medium tracking-tight mb-4 group-hover:text-blue-600 transition-colors leading-tight">
              {featured.title}
            </h3>
            <div className="flex items-center text-sm font-medium text-gray-500 space-x-3 mb-6">
              <span>{featured.date}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>{featured.category}</span>
            </div>
            <span className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-800 transition-colors">
              자세히 보기 <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </Link>
        </div>

        {/* List of Small Cards */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-8">
          {list.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="group flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-full sm:w-40 aspect-square rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center pt-2">
                <h3 className="text-xl md:text-2xl font-medium tracking-tight mb-3 group-hover:text-blue-600 transition-colors leading-snug line-clamp-3">
                  {post.title}
                </h3>
                <div className="flex items-center text-sm font-medium text-gray-500 space-x-3 mb-4">
                  <span>{post.date}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{post.category}</span>
                </div>
                <span className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-800 transition-colors text-sm">
                  자세히 보기 <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
