
import React, { useState } from 'react';
import { ViewType, Post } from './types.ts';
import Layout from './components/Layout.tsx';
import ThumbnailEditor from './components/ThumbnailEditor.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import { SAMPLE_POSTS } from './constants.ts';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>(ViewType.HOME);
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [siteSettings, setSiteSettings] = useState({
    title: '운스튜디오3',
    heroTitle: '고급스러운 썸네일의 완성',
    heroDescription: '전문적인 디자인 감각이 돋보이는 썸네일을 누구나 쉽게 만들 수 있습니다. 오프라인에서도 완벽하게 작동하는 강력한 에디터를 경험해 보세요.',
    apiKey: ''
  });

  const renderContent = () => {
    switch (view) {
      case ViewType.HOME:
        return (
          <div className="animate-fadeIn space-y-20">
            {/* Hero Section */}
            <section className="text-center py-20 px-4 space-y-6">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
                {siteSettings.heroTitle.split(',')[0]} <span className="text-purple-500">{siteSettings.heroTitle.split(',')[1] || '썸네일'}</span>의 완성,<br /> 
                {siteSettings.title}
              </h1>
              <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
                {siteSettings.heroDescription}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
                <button 
                  onClick={() => setView(ViewType.CREATOR)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-full text-lg transition-all transform hover:scale-105"
                >
                  무료로 시작하기
                </button>
                <button 
                  onClick={() => setView(ViewType.POSTS)}
                  className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold px-8 py-4 rounded-full text-lg transition-all"
                >
                  기능 살펴보기
                </button>
              </div>
            </section>

            {/* Features Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl group hover:border-purple-500 transition-colors">
                <div className="w-12 h-12 bg-purple-500/20 text-purple-500 rounded-xl flex items-center justify-center font-bold mb-6">01</div>
                <h3 className="text-xl font-bold mb-3">직관적인 에디터</h3>
                <p className="text-zinc-500 leading-relaxed">복잡한 디자인 툴 없이도 클릭 몇 번으로 텍스트와 이미지를 조정하여 고품질 썸네일을 제작합니다.</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl group hover:border-purple-500 transition-colors">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center font-bold mb-6">02</div>
                <h3 className="text-xl font-bold mb-3">완벽한 반응형</h3>
                <p className="text-zinc-500 leading-relaxed">PC부터 모바일까지 모든 기기에서 최적화된 화면을 제공하며 오프라인 환경에서도 원활합니다.</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl group hover:border-purple-500 transition-colors">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center font-bold mb-6">03</div>
                <h3 className="text-xl font-bold mb-3">관리자 대시보드</h3>
                <p className="text-zinc-500 leading-relaxed">작성한 콘텐츠를 관리하고 사이트 설정을 손쉽게 변경할 수 있는 사용자 중심의 관리 기능을 제공합니다.</p>
              </div>
            </section>
          </div>
        );
      case ViewType.CREATOR:
        return <ThumbnailEditor />;
      case ViewType.ADMIN:
        return (
          <AdminDashboard 
            posts={posts} 
            setPosts={setPosts} 
            siteSettings={siteSettings} 
            setSiteSettings={setSiteSettings} 
          />
        );
      case ViewType.POSTS:
        return (
          <div className="animate-fadeIn">
            <h2 className="text-3xl font-black mb-10 text-center">최신 콘텐츠</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => (
                <div key={post.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:scale-[1.02] transition-all">
                  <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                    <img src={post.thumbnailUrl || 'https://picsum.photos/seed/'+post.id+'/800/450'} alt={post.title} className="w-full h-full object-cover" />
                    <span className="absolute top-4 left-4 bg-purple-600 text-[10px] font-bold px-2 py-1 rounded uppercase">{post.category}</span>
                  </div>
                  <div className="p-6">
                    <p className="text-zinc-500 text-xs mb-2">{post.date} • {post.author}</p>
                    <h3 className="text-xl font-bold mb-3 line-clamp-1">{post.title}</h3>
                    <p className="text-zinc-400 text-sm line-clamp-2 mb-6">{post.content}</p>
                    <button className="text-purple-400 font-bold text-sm hover:underline">자세히 보기 →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <div>페이지를 찾을 수 없습니다.</div>;
    }
  };

  return (
    <Layout activeView={view} setView={setView} siteTitle={siteSettings.title}>
      {renderContent()}
    </Layout>
  );
};

export default App;
