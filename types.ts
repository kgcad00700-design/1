
export type LayerType = 'text' | 'image';

export interface Layer {
  id: string;
  type: LayerType;
  content: string; // 텍스트 내용 또는 이미지 데이터 URL
  x: number;
  y: number;
  fontSize: number;
  color: string;
  visible: boolean;
  fontWeight: string;
  useBackground?: boolean;
  bgColor?: string;      // 배경 박스 색상
  bgOpacity?: number;    // 배경 박스 투명도
  imageAspectRatio?: number; // 이미지의 원본 가로/세로 비율
}

export interface ThumbnailConfig {
  backgroundColor: string;
  useGradient?: boolean;   // 그라데이션 사용 여부
  gradientColor2?: string; // 그라데이션 두 번째 색상
  layers: Layer[];
  overlayOpacity: number;
  backgroundImage?: string;
  aspectRatio: '16:9' | '9:16';
}

export interface Post {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  category: string;
  thumbnailUrl?: string;
}

export enum ViewType {
  HOME = 'home',
  CREATOR = 'creator',
  ADMIN = 'admin',
  POSTS = 'posts'
}
