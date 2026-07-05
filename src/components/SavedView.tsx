'use client';

import React, { useState } from 'react';
import { AlertCircle, BookmarkX, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSavedPosts, useSavePost, useUnsavePost, useDeletePost } from '../hooks/useForum';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../i18n/context';
import PostCard from './PostCard';

export default function SavedView() {
  const { currentUser } = useSession();
  const { t } = useI18n();
  const [page, setPage] = useState(1);

  const {
    data: savedData,
    isLoading,
    error,
    isPlaceholderData,
  } = useSavedPosts(currentUser.id, page);

  const saveMutation = useSavePost('', currentUser.id);
  const unsaveMutation = useUnsavePost('', currentUser.id);
  const deleteMutation = useDeletePost();

  const handleToggleSave = (post: any) => {
    if (post.hasSaved) {
      unsaveMutation.mutate(post.id);
    } else {
      saveMutation.mutate(post.id);
    }
  };

  if (isLoading) {
    return (
      <div className="posts-list" style={{ marginTop: '24px' }}>
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-banner" style={{ marginTop: '24px' }}>
        <AlertCircle size={20} />
        <span>{t('error.generic', { message: error.message })}</span>
      </div>
    );
  }

  const posts = savedData?.posts || [];
  const total = savedData?.total || 0;
  const limit = 5;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div style={{ marginTop: '24px' }}>
      <div className="feed-header">
        <h2 className="feed-title-text">{t('saved.title')}</h2>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <BookmarkX className="empty-icon" size={48} style={{ color: 'var(--color-secondary)' }} />
          <h3 className="empty-title">{t('saved.title')}</h3>
          <p className="empty-desc">{t('saved.empty')}</p>
        </div>
      ) : (
        <>
          <div className="posts-list">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onToggleSave={handleToggleSave}
                onDelete={(id) => deleteMutation.mutate(id)}
                isSavingOrUnsaving={saveMutation.isPending || unsaveMutation.isPending}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button
                className="page-btn"
                onClick={() => setPage((old) => Math.max(old - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
                <span>{t('common.prev')}</span>
              </button>
              <span className="page-indicator">
                {t('common.page', { page, totalPages })}
              </span>
              <button
                className="page-btn"
                onClick={() => {
                  if (!isPlaceholderData && page < totalPages) {
                    setPage((old) => old + 1);
                  }
                }}
                disabled={page >= totalPages || isPlaceholderData}
              >
                <span>{t('common.next')}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
