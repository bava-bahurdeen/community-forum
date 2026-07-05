import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../api/client';

export interface Post {
  id: string;
  title: string;
  content: string;
  courseId: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  hasSaved: boolean;
  savesCount: number;
}

export interface Course {
  id: string;
  name: string;
}

export interface PaginatedResult<T> {
  posts: T[];
  total: number;
}

// 1. Query Key Factory
export const queryKeys = {
  courses: {
    all: ['courses'] as const,
  },
  posts: {
    all: ['posts'] as const,
    feed: (courseId: string, page: number) => [...queryKeys.posts.all, 'feed', courseId, { page }] as const,
    saved: (userId: string, page: number) => [...queryKeys.posts.all, 'saved', userId, { page }] as const,
  },
};

// 2. Fetch Courses Hook
export function useCourses() {
  return useQuery({
    queryKey: queryKeys.courses.all,
    queryFn: () => apiFetch<{ courses: Course[] }>('/courses').then((r) => r.courses),
  });
}

// 3. Fetch Course Feed Hook
export function useCourseFeed(courseId: string, page: number, options = { enabled: true }) {
  return useQuery({
    queryKey: queryKeys.posts.feed(courseId, page),
    queryFn: () => apiFetch<PaginatedResult<Post>>(`/courses/${courseId}/posts?page=${page}&limit=5`),
    placeholderData: (prev) => prev, // Keep previous page data during fetching
    enabled: options.enabled && !!courseId,
  });
}

// 4. Fetch Saved Posts Hook
export function useSavedPosts(userId: string, page: number, options = { enabled: true }) {
  return useQuery({
    queryKey: queryKeys.posts.saved(userId, page),
    queryFn: () => apiFetch<PaginatedResult<Post>>(`/saved-posts?userId=${userId}&page=${page}&limit=5`),
    placeholderData: (prev) => prev,
    enabled: options.enabled && !!userId,
  });
}

// Helper to update a post's bookmark status inside the cache across all active queries
function updatePostInCache(
  queryClient: any,
  postId: string,
  updater: (post: Post) => Post
) {
  // Update Feed queries
  const feedQueries = queryClient.getQueriesData({ queryKey: [...queryKeys.posts.all, 'feed'] });
  for (const [queryKey, data] of feedQueries) {
    if (!data) continue;
    const paginated = data as PaginatedResult<Post>;
    const index = paginated.posts.findIndex((p) => p.id === postId);
    if (index !== -1) {
      const updatedPosts = [...paginated.posts];
      updatedPosts[index] = updater(updatedPosts[index]);
      queryClient.setQueryData(queryKey, { ...paginated, posts: updatedPosts });
    }
  }

  // Update Saved queries
  const savedQueries = queryClient.getQueriesData({ queryKey: [...queryKeys.posts.all, 'saved'] });
  for (const [queryKey, data] of savedQueries) {
    if (!data) continue;
    const paginated = data as PaginatedResult<Post>;
    const index = paginated.posts.findIndex((p) => p.id === postId);
    if (index !== -1) {
      const updatedPosts = [...paginated.posts];
      updatedPosts[index] = updater(updatedPosts[index]);
      queryClient.setQueryData(queryKey, { ...paginated, posts: updatedPosts });
    }
  }
}

// 5. Save Post Mutation (optimistic)
export function useSavePost(courseId: string, currentUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) =>
      apiFetch<{ hasSaved: boolean; savesCount: number }>(`/posts/${postId}/save`, {
        method: 'POST',
      }),
    onMutate: async (postId) => {
      // Cancel outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.all });

      // Save previous state for rollback
      const snapshot = queryClient.getQueryData(queryKeys.posts.all);

      // Optimistically update
      updatePostInCache(queryClient, postId, (post) => ({
        ...post,
        hasSaved: true,
        savesCount: post.savesCount + 1,
      }));

      return { snapshot };
    },
    onError: (err, postId, context) => {
      // Rollback on error
      if (context?.snapshot) {
        queryClient.setQueryData(queryKeys.posts.all, context.snapshot);
      }
    },
    onSettled: () => {
      // Invalidate queries to sync with DB
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

// 6. Unsave Post Mutation (optimistic)
export function useUnsavePost(courseId: string, currentUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) =>
      apiFetch<{ hasSaved: boolean; savesCount: number }>(`/posts/${postId}/unsave`, {
        method: 'POST',
      }),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.all });

      const snapshot = queryClient.getQueryData(queryKeys.posts.all);

      // Optimistically update
      updatePostInCache(queryClient, postId, (post) => ({
        ...post,
        hasSaved: false,
        savesCount: Math.max(0, post.savesCount - 1),
      }));

      return { snapshot };
    },
    onError: (err, postId, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(queryKeys.posts.all, context.snapshot);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

// 7. Delete Post Mutation (moderator-only)
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) =>
      apiFetch<{ message: string }>(`/posts/${postId}`, {
        method: 'DELETE',
      }),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.all });

      const snapshot = queryClient.getQueryData(queryKeys.posts.all);

      // Remove from feed caches immediately
      const feedQueries = queryClient.getQueriesData({ queryKey: [...queryKeys.posts.all, 'feed'] });
      for (const [queryKey, data] of feedQueries) {
        if (!data) continue;
        const paginated = data as PaginatedResult<Post>;
        const updatedPosts = paginated.posts.filter((p) => p.id !== postId);
        queryClient.setQueryData(queryKey, {
          ...paginated,
          posts: updatedPosts,
          total: Math.max(0, paginated.total - 1),
        });
      }

      // Remove from saved caches immediately
      const savedQueries = queryClient.getQueriesData({ queryKey: [...queryKeys.posts.all, 'saved'] });
      for (const [queryKey, data] of savedQueries) {
        if (!data) continue;
        const paginated = data as PaginatedResult<Post>;
        const updatedPosts = paginated.posts.filter((p) => p.id !== postId);
        queryClient.setQueryData(queryKey, {
          ...paginated,
          posts: updatedPosts,
          total: Math.max(0, paginated.total - 1),
        });
      }

      return { snapshot };
    },
    onError: (err, postId, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(queryKeys.posts.all, context.snapshot);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}
