'use client';

import  { useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { useCourses, useCourseFeed, useSavePost, useUnsavePost, useDeletePost } from '../hooks/useForum';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../i18n/context';
import PostCard from './PostCard';

export default function FeedView() {
  const { currentUser } = useSession();
  const { t } = useI18n();
  const [activeCourseId, setActiveCourseId] = useState('cs101');
  const [page, setPage] = useState(1);

  const { data: courses, isLoading: coursesLoading, error: coursesError } = useCourses();



  const {
    data: feedData,
    isLoading: feedLoading,
    error: feedError,
    isPlaceholderData,
  } = useCourseFeed(activeCourseId, page);

  const saveMutation = useSavePost(activeCourseId, currentUser.id);
  const unsaveMutation = useUnsavePost(activeCourseId, currentUser.id);
  const deleteMutation = useDeletePost();

  const handleToggleSave = (post: any) => {
    if (post.hasSaved) {
      unsaveMutation.mutate(post.id);
    } else {
      saveMutation.mutate(post.id);
    }
  };

  if (coursesLoading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="alert-banner">
        <AlertCircle size={20} />
        <span>{t('error.generic', { message: coursesError.message })}</span>
      </div>
    );
  }

  const posts = feedData?.posts || [];
  const total = feedData?.total || 0;
  const limit = 5;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="main-grid">
      {/* Sidebar Course Selection */}
      <aside className="sidebar-panel">
        <h3 className="sidebar-title">{t('switcher.lang_select') === 'Locale' ? 'Courses' : 'Cursos'}</h3>
        <ul className="course-list">
          {courses?.map((course) => {
            const isActive = course.id === activeCourseId;
            // Visual indicator if student is enrolled in this course
            const isEnrolled = currentUser.role === 'MODERATOR' || currentUser.enrolledCourses.includes(course.id);

            return (
              <li key={course.id}>
                <button
                  className={`course-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveCourseId(course.id)}
                >
                  <span>{course.id.toUpperCase()}: {course.name}</span>
                  {!isEnrolled && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-danger)', fontWeight: 'bold' }}>
                      🔒
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Feed Section */}
      <section className="feed-content">
        <div className="feed-header">
          <h2 className="feed-title-text">{t('feed.title')}</h2>
        </div>

        {/* 403 Course Access Error */}
        {feedError ? (
          <div className="alert-banner-warning">
            <AlertCircle size={24} />
            <div>
              <strong style={{ display: 'block', marginBottom: '4px' }}>
                {t('error.not_enrolled')}
              </strong>
              <span style={{ fontSize: '0.85rem' }}>
                {feedError.message}
              </span>
            </div>
          </div>
        ) : feedLoading ? (
          <div className="posts-list">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <Inbox className="empty-icon" size={48} />
            <h3 className="empty-title">{t('feed.empty')}</h3>
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

            {/* Pagination Controls */}
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
      </section>
    </div>
  );
}
