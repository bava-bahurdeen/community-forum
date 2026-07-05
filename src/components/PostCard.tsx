'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import { Post } from '../hooks/useForum';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../i18n/context';

interface PostCardProps {
  post: Post;
  onToggleSave: (post: Post) => void;
  onDelete: (postId: string) => void;
  isSavingOrUnsaving: boolean;
  isDeleting: boolean;
}

export default function PostCard({
  post,
  onToggleSave,
  onDelete,
  isSavingOrUnsaving,
  isDeleting,
}: PostCardProps) {
  const { currentUser } = useSession();
  const { locale, t, tPlural } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    if (isSavingOrUnsaving) return;
    onToggleSave(post);
  };

  const handleDelete = () => {
    if (isDeleting) return;
    if (confirm(t('post.delete_btn') + '?')) {
      onDelete(post.id);
    }
  };

  // Prevent server-client date rendering mismatches
  const formatDate = (dateStr: string) => {
    if (!mounted) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const isModerator = currentUser.role === 'MODERATOR';

  return (
    <article className={`post-card ${post.hasSaved ? 'has-saved' : ''}`}>
      <div className="post-meta">
        <span className="post-author">
          {t('post.posted_by', {
            author: post.authorName,
            date: formatDate(post.createdAt),
          })}
        </span>
      </div>

      <h3 className="post-title">{post.title}</h3>
      <p className="post-content">{post.content}</p>

      <div className="post-actions">
        {/* Bookmark Action */}
        <button
          className={`bookmark-btn ${post.hasSaved ? 'active' : ''}`}
          onClick={handleToggle}
          disabled={isSavingOrUnsaving}
          title={post.hasSaved ? 'Unsave Post' : 'Save Post'}
        >
          <Bookmark size={16} />
          <span>{tPlural(post.savesCount)}</span>
        </button>

        {/* Moderator delete action */}
        {isModerator && (
          <button
            className="delete-btn"
            onClick={handleDelete}
            disabled={isDeleting}
            title={t('post.delete_btn')}
          >
            <Trash2 size={16} />
            <span>{t('post.delete_btn')}</span>
          </button>
        )}
      </div>
    </article>
  );
}
