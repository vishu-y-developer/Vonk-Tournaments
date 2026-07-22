'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useHelpArticle } from '@/hooks/useHelpArticle';
import DemoSupportNotice from '@/components/support/DemoSupportNotice';
import { BookOpen, ArrowLeft, Tag } from 'lucide-react';

export default function HelpArticleDetailPage() {
  const params = useParams();
  const articleId = params?.articleId as string;
  const { article } = useHelpArticle(articleId);

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <BookOpen className="h-10 w-10 text-muted" />
        <h2 className="text-lg font-extrabold text-foreground">Help Article Not Found</h2>
        <Link href="/help" className="text-xs text-secondary font-bold hover:underline">
          Return to Help Center
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto">
      <DemoSupportNotice />

      <Link href="/help" className="flex items-center gap-1 text-xs text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Help Center
      </Link>

      <div className="p-8 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-6">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-primary/20 text-primary border border-primary/30">
            {article.category}
          </span>
          <h1 className="text-2xl font-black text-foreground mt-2">{article.title}</h1>
          <p className="text-xs text-muted mt-1 leading-relaxed">{article.summary}</p>
        </div>

        <div className="text-xs text-foreground leading-relaxed space-y-4 border-t border-b border-card-border/50 py-6 whitespace-pre-line">
          {article.content}
        </div>

        <div className="flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5" />
            <span>Keywords: {article.keywords.join(', ')}</span>
          </div>
          <span className="font-mono">Updated: {new Date(article.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
