import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import StoreProvider from '@/store/StoreProvider';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '링크비자 (LinkVisa) | 외국인 비자 업무 관리 도구 | 서류처리 10분만에 끝',
  description:
    '반복되는 비자 서류 작성과 정리는 LinkVisa가 처리합니다. 행정사는 고객 상담과 매출에만 집중하세요!',
  keywords: [
    '비자 서류 자동화',
    '행정사 업무 도구',
    '외국인 비자 관리',
    '출입국 서류 작성',
    'AI OCR 문서 인식',
    '비자 업무 효율화',
    '행정사 SaaS',
    '링크비자',
    'LinkVisa',
    '비자 서류처리',
    '외국인 체류 관리',
    '행정사 솔루션',
  ],
  alternates: {
    canonical: 'https://www.linkvisa.kr',
  },
  openGraph: {
    title: '링크비자 (LinkVisa) | 외국인 비자 업무 관리 도구',
    description:
      '반복되는 비자 서류 작성과 정리는 LinkVisa가 처리합니다. 행정사는 고객 상담과 매출에만 집중하세요!',
    url: 'https://www.linkvisa.kr',
    siteName: '링크비자 (LinkVisa)',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '링크비자 (LinkVisa) | 외국인 비자 업무 관리 도구',
    description:
      '반복되는 비자 서류 작성과 정리는 LinkVisa가 처리합니다. 행정사는 고객 상담과 매출에만 집중하세요!',
  },
  verification: {
    other: {
      'naver-site-verification': ['b45dda53e81a0fdb101e001fd808ede340f7ca88'],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${manrope.variable} ${inter.variable}`}>
      <body><StoreProvider>{children}</StoreProvider></body>
    </html>
  );
}
