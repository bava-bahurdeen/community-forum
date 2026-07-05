'use client';

import React, { useState } from 'react';
import { MessageSquare, Bookmark } from 'lucide-react';
import Header from '@/components/Header';
import FeedView from '@/components/FeedView';
import SavedView from '@/components/SavedView';
import { useI18n } from '@/i18n/context';

type ActiveTab = 'feed' | 'saved';

export default function Home() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');

  return (
    <>
      <Header />
      <main className="container" style={{ paddingBottom: '60px' }}>
        <div style={{ marginTop: '32px' }}>
          {/* Navigational Tab Buttons */}
          <nav className="navigation-tabs">
            <button
              className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
              onClick={() => setActiveTab('feed')}
            >
              <MessageSquare size={18} />
              <span>{t('feed.title')}</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              <Bookmark size={18} />
              <span>{t('saved.title')}</span>
            </button>
          </nav>

          {/* Conditional View Rendering */}
          {activeTab === 'feed' ? <FeedView /> : <SavedView />}
        </div>
      </main>
    </>
  );
}
