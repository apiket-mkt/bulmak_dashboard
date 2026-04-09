import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '불막열삼 점주님용 레퍼런스 사이트',
  description: '불막열삼 점주님들을 위한 마케팅 레퍼런스 모음',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
