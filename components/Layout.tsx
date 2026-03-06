
import React from 'react';
import { ViewType } from '../types.ts';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  setView: (view: ViewType) => void;
  siteTitle: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setView, siteTitle }) => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(ViewType.HOME)}>
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-xl italic">
            {siteTitle.charAt(0)}
          </div>
          <span className="text-xl font-bold tracking-tighter">{siteTitle}</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button 
            onClick={() => setView(ViewType.HOME)}
            className={`${activeView === ViewType.HOME ? 'text-purple-400' : 'text-zinc-400'} hover:text-white transition-colors`}
          >
            홈
          </button>
          <button 
            onClick={() => setView(ViewType.CREATOR)}
            className={`${activeView === ViewType.CREATOR ? 'text-purple-400' : 'text-zinc-400'} hover:text-white transition-colors`}
          >
            썸네일 제작
          </button>
          <button 
            onClick={() => setView(ViewType.POSTS)}
            className={`${activeView === ViewType.POSTS ? 'text-purple-400' : 'text-zinc-400'} hover:text-white transition-colors`}
          >
            콘텐츠
          </button>
          <button 
            onClick={() => setView(ViewType.ADMIN)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full transition-all"
          >
            관리자 대시보드
          </button>
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden flex items-center gap-4">
           <button onClick={() => setView(ViewType.ADMIN)} className="text-xs bg-purple-600 p-1 px-2 rounded">관리</button>
           <button onClick={() => setView(ViewType.CREATOR)} className="text-xs border border-zinc-700 p-1 px-2 rounded">만들기</button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-zinc-900 bg-zinc-950 py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-lg font-bold text-purple-500 mb-4">{siteTitle}</h3>
            <p className="text-zinc-400 text-sm">최상의 디자인 감각을 담아내는 썸네일 및 콘텐츠 관리 플랫폼입니다.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">링크</h4>
            <ul className="text-zinc-500 text-sm space-y-2">
              <li className="hover:text-purple-400 cursor-pointer">이용약관</li>
              <li className="hover:text-purple-400 cursor-pointer">개인정보처리방침</li>
              <li className="hover:text-purple-400 cursor-pointer">고객지원</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">SNS 연동</h4>
            <div className="flex justify-center md:justify-start gap-4">
               <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-purple-600 cursor-pointer transition-colors">I</div>
               <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-purple-600 cursor-pointer transition-colors">F</div>
               <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-purple-600 cursor-pointer transition-colors">X</div>
            </div>
          </div>
        </div>
        <div className="text-center mt-10 text-zinc-600 text-xs">
          © 2024 {siteTitle}. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
