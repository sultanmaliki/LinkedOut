'use client';

import { useCallback, useEffect, useState } from 'react';
import { Newspaper } from 'lucide-react';

import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Post } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { ComposeBox } from './compose-box';
import { PostCard } from './post-card';

const PAGE_SIZE = 20;

export default function FeedPage() {
  const { isLoading: isAuthLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(() => {
    setIsLoading(true);
    apiFetch<Post[]>(`/posts?limit=${PAGE_SIZE}&offset=0`)
      .then((list) => {
        setPosts(list);
        setHasMore(list.length === PAGE_SIZE);
      })
      .finally(() => setIsLoading(false));
  }, []);

  function loadMore() {
    setLoadingMore(true);
    apiFetch<Post[]>(`/posts?limit=${PAGE_SIZE}&offset=${posts.length}`)
      .then((list) => {
        setPosts((prev) => [...prev, ...list]);
        setHasMore(list.length === PAGE_SIZE);
      })
      .finally(() => setLoadingMore(false));
  }

  useEffect(() => {
    if (isAuthLoading) return;
    load();
  }, [isAuthLoading, load]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <div className="mb-8">
        <h1 className="font-display text-[26px] font-medium tracking-[-0.01em] text-fg">Feed</h1>
        <p className="mt-1 text-[14.5px] text-fg-muted">
          Updates, wins, and news from professionals and companies you follow.
        </p>
      </div>

      <ComposeBox onPosted={load} />

      {isAuthLoading || isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-surface" />
      ) : posts.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 pt-12 pb-12 text-center">
            <Newspaper className="h-7 w-7 text-fg-faint" strokeWidth={1.5} />
            <p className="text-[14.5px] text-fg-muted">No posts yet.</p>
            <p className="max-w-sm text-[13px] text-fg-faint">Be the first to share something.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {hasMore && (
            <Button
              type="button"
              variant="secondary"
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full"
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          )}
        </div>
      )}
    </main>
  );
}
