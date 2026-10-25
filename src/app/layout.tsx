import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hot100 学习助手 — 用代码随想录方法系统刷题',
  description: '引导式 LeetCode Hot100 学习网站，按题型分类、分层提示、教练式学习',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
