
import React, { useState } from 'react';
import { Post } from '../types.ts';

interface AdminDashboardProps {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  siteSettings: { title: string; heroTitle: string; heroDescription: string; apiKey: string };
  setSiteSettings: React.Dispatch<React.SetStateAction<{ title: string; heroTitle: string; heroDescription: string; apiKey: string }>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ posts, setPosts, siteSettings, setSiteSettings }) => {
  const [newPost, setNewPost] = useState<Partial<Post>>({ title: '', content: '', category: '공지사항' });
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const addPost = () => {
    if (!newPost.title || !newPost.content) return;
    const post: Post = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: '관리자',
      date: new Date().toISOString().split('T')[0],
      category: newPost.category || '일반'
    };
    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', category: '공지사항' });
  };

  const deletePost = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  const updatePostField = (id: string, field: keyof Post, value: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSaveSettings = () => {
    alert('시스템 설정 및 API 키가 성공적으로 저장되었습니다.');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '전체 게시글', value: posts.length, color: 'text-purple-500' },
          { label: '방문자수 (오늘)', value: '1,240', color: 'text-blue-500' },
          { label: '썸네일 생성수', value: '458', color: 'text-emerald-500' },
          { label: '활성 사용자', value: '12', color: 'text-orange-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
            <p className="text-zinc-500 text-sm font-medium mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl h-fit">
            <h2 className="text-xl font-bold mb-6 text-white">새 게시글 작성</h2>
            <div className="space-y-4">
              <input type="text" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} placeholder="제목" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm focus:border-purple-500 outline-none" />
              <textarea rows={5} value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} placeholder="내용" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm focus:border-purple-500 outline-none resize-none"></textarea>
              <select value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm focus:border-purple-500 outline-none">
                <option>공지사항</option><option>가이드</option><option>업데이트</option><option>일반</option>
              </select>
              <button onClick={addPost} className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-bold transition-all mt-4">게시글 등록</button>
            </div>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl h-fit">
            <h2 className="text-xl font-bold mb-6 text-white">시스템 설정</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">사이트 제목</label>
                <input type="text" value={siteSettings.title} onChange={e => setSiteSettings({...siteSettings, title: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm focus:border-purple-500 outline-none" placeholder="사이트 제목" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">API 키 설정</label>
                <input 
                  type="password" 
                  value={siteSettings.apiKey} 
                  onChange={e => setSiteSettings({...siteSettings, apiKey: e.target.value})} 
                  className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm focus:border-purple-500 outline-none" 
                  placeholder="Google API Key 입력" 
                />
                <p className="text-[9px] text-zinc-500 mt-1">입력하신 키는 세션 동안 안전하게 유지됩니다.</p>
              </div>
              <button onClick={handleSaveSettings} className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 py-3 rounded-lg font-bold transition-all">설정 저장</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-6 text-white">게시글 관리</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-zinc-500 border-b border-zinc-800">
                <tr><th className="pb-3">제목</th><th className="pb-3">카테고리</th><th className="pb-3">날짜</th><th className="text-right pb-3">관리</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-zinc-800/30 group transition-colors">
                    <td className="py-4 font-medium">{editingPostId === post.id ? <input autoFocus className="bg-zinc-950 border border-purple-500/50 rounded px-2 py-1 w-full outline-none text-white" value={post.title} onChange={(e) => updatePostField(post.id, 'title', e.target.value)} /> : <span className="group-hover:text-purple-400">{post.title}</span>}</td>
                    <td className="py-4"><span className="bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md text-xs">{post.category}</span></td>
                    <td className="py-4 text-zinc-500">{post.date}</td>
                    <td className="py-4 text-right space-x-3">
                      <button onClick={() => setEditingPostId(editingPostId === post.id ? null : post.id)} className={`transition-colors font-bold ${editingPostId === post.id ? 'text-purple-400' : 'text-zinc-500 hover:text-white'}`}>{editingPostId === post.id ? '완료' : '수정'}</button>
                      <button onClick={() => deletePost(post.id)} className="text-red-500/70 hover:text-red-500 transition-colors font-bold">삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
