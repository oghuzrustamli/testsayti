// src/pages/TestCreateHubPage.tsx
// ATROQ Education - Birbaşa İnteraktiv Test Yaratma Səhifəsi
import React from 'react';
import { User, Test } from '../types';
import { TestCreatorPage } from './TestCreatorPage';

interface TestCreateHubPageProps {
  user: User;
  editTestId?: string | null;
  onBack?: () => void;
  onSaved?: (test: Test, shouldShare?: boolean) => void;
}

export const TestCreateHubPage: React.FC<TestCreateHubPageProps> = ({
  user,
  editTestId,
  onBack,
  onSaved,
}) => {
  // Aralıq panel və digər iki seçim ləğv edildi: birbaşa İnteraktiv Test Yaratma səhifəsi yüklənir
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TestCreatorPage
        user={user}
        editTestId={editTestId}
        onBack={onBack || (() => {})}
        onSaved={onSaved || (() => {})}
      />
    </div>
  );
};
