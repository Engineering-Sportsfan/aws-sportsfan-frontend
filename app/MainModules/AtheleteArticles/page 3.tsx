// \app\MainModules\AtheleteArticles\page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { articleService, type ArticleListItem } from '@/services/article.service';

export default function ArticlesListScreen() {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articleService
      .getAll()
      .then(setArticles)
      .catch((err) => console.error('Failed to load articles:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-screen bg-[#0b0b0f]" />; // replace with real skeleton

  return (
    <div className="bg-[#0b0b0f] min-h-screen">
      {articles.map((a) => (
        <button key={a.slug} onClick={() => router.push(`/MainModules/AtheleteArticles/${a.slug}`)}>
          {a.title}
        </button>
      ))}
    </div>
  );
}