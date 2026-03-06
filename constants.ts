
import { Post, ThumbnailConfig } from './types.ts';

export const COLORS = {
  primary: '#a855f7',
  secondary: '#7e22ce',
  background: '#0a0a0a',
  surface: '#18181b',
  text: '#ffffff',
  textMuted: '#94a3b8'
};

export const DEFAULT_THUMBNAIL: ThumbnailConfig = {
  backgroundColor: '#18181b',
  useGradient: false,
  gradientColor2: '#000000',
  overlayOpacity: 0.3,
  aspectRatio: '16:9',
  layers: [
    {
      id: 'layer-1',
      type: 'text',
      content: '운스튜디오3',
      x: 640,
      y: 320,
      fontSize: 100, // 이 값을 100으로 고정합니다.
      color: '#ffffff',
      visible: true,
      fontWeight: 'bold',
      useBackground: true,
      bgColor: '#000000',
      bgOpacity: 0.6
    },
    {
      id: 'layer-2',
      type: 'text',
      content: '전문적인 썸네일 레이어 시스템',
      x: 640,
      y: 400,
      fontSize: 70, // 이 값을 70으로 고정합니다.
      color: '#22c55e',
      visible: true,
      fontWeight: 'normal',
      useBackground: true,
      bgColor: '#000000',
      bgOpacity: 0.6
    }
  ]
};

export const SAMPLE_POSTS: Post[] = [
  {
    id: '1',
    title: '운스튜디오3 시작하기',
    author: '관리자',
    date: '2024-05-20',
    content: '운스튜디오3에 오신 것을 환영합니다.',
    category: '공지사항',
    thumbnailUrl: 'https://picsum.photos/seed/un1/800/450'
  },
  {
    id: '2',
    title: '고급스러운 썸네일 제작 팁',
    author: '디자이너',
    date: '2024-05-21',
    content: '보라색 포인트를 활용해 보세요.',
    category: '가이드',
    thumbnailUrl: 'https://picsum.photos/seed/un2/800/450'
  }
];