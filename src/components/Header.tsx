'use client';

import React from 'react';
import { BookOpen, User, Languages } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../i18n/context';
import { MOCK_USERS } from '../api/mockUsers';

export default function Header() {
  const { currentUser, setCurrentUser } = useSession();
  const { locale, setLocale, t } = useI18n();

  return (
    <header className="app-header">
      <div className="container header-container">
        <div className="logo">
          <BookOpen className="logo-icon" size={24} />
          <span>ForumSaves</span>
        </div>

        <div className="controls-group">
          {/* Active Profile Switcher */}
          <div className="select-wrapper">
            <span className="select-label">{t('switcher.user_select')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} className="text-secondary" style={{ color: 'var(--color-secondary)' }} />
              <select
                className="custom-select"
                value={currentUser.id}
                onChange={(e) => {
                  const target = MOCK_USERS.find((u) => u.id === e.target.value);
                  if (target) setCurrentUser(target);
                }}
              >
                {MOCK_USERS.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role === 'MODERATOR' ? t('switcher.moderator') : t('switcher.student')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Locale switcher */}
          <div className="select-wrapper">
            <span className="select-label">{t('switcher.lang_select')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Languages size={16} className="text-secondary" style={{ color: 'var(--color-secondary)' }} />
              <select
                className="custom-select"
                value={locale}
                onChange={(e) => setLocale(e.target.value as 'en' | 'es')}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
