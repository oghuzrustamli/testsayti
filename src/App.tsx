// src/App.tsx
import React, { useState, useEffect } from 'react';
import { User, UserRole, Test } from './types';
import { api } from './lib/api';
import { Navbar } from './components/Navbar';
import { Sidebar, TeacherTab, AdminTab, StudentTab } from './components/Sidebar';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { TestCreatorPage } from './pages/TestCreatorPage';
import { TestCreateHubPage } from './pages/TestCreateHubPage';
import { MyTestsPage } from './pages/MyTestsPage';
import { QuestionBankPage } from './pages/QuestionBankPage';
import { InteractiveTestTaking } from './pages/InteractiveTestTaking';
import { AnsweredTestPage } from './pages/AnsweredTestPage';
import { OmrTestCreatorPage } from './pages/OmrTestCreatorPage';
import { ResultsPage } from './pages/ResultsPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { ClassesPage } from './pages/ClassesPage';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { PrintableView } from './components/PrintableView';
import { ShareTestModal } from './components/ShareTestModal';
import { ProActivationModal } from './components/ProActivationModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { AuthModal } from './components/AuthModal';
import { AiTestCreatorPage } from './pages/AiTestCreatorPage';
import { RegionalStatsPage } from './pages/RegionalStatsPage';
import { AboutPage } from './pages/AboutPage';

const DEFAULT_TEACHER: User = {
  id: 'usr-teacher-1',
  email: 'muellim@edunex.az',
  full_name: 'Nərmin Məmmədova',
  phone: '+994 50 345 67 89',
  role: 'teacher',
  school: 'Bakı şəhəri 287 nömrəli Zəkalar liseyi',
  status: 'active',
  is_pro: true,
  pro_expires_at: '2027-11-15T00:00:00.000Z'
};

const DEFAULT_STUDENT: User = {
  id: 'usr-student-1',
  email: 'sagird@edunex.az',
  full_name: 'Əli Həsənov',
  phone: '+994 55 987 65 43',
  role: 'student',
  school: 'Bakı şəhəri 287 nömrəli Zəkalar liseyi',
  status: 'active',
  is_pro: false,
};

export function App() {
  // Current logged in user
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return api.getCurrentUser() || DEFAULT_TEACHER;
  });

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Sub-views & Modals
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [viewingAnsweredTestId, setViewingAnsweredTestId] = useState<string | null>(null);
  const [printingTest, setPrintingTest] = useState<Test | null>(null);
  const [sharingTest, setSharingTest] = useState<Test | null>(null);
  const [showProModal, setShowProModal] = useState<boolean>(false);
  const [showAdminAuthModal, setShowAdminAuthModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [resultsFilterTestId, setResultsFilterTestId] = useState<string | null>(null);

  // Direct Student Exam Taking Mode (via query param `?take=CODE` or direct PIN entry)
  const [examShareCode, setExamShareCode] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('take');
  });

  // Role switch handler
  const handleSwitchRole = (role: UserRole) => {
    if (role === 'teacher') {
      setCurrentUser(DEFAULT_TEACHER);
      setActiveTab('dashboard');
    } else if (role === 'student') {
      setCurrentUser(DEFAULT_STUDENT);
      setActiveTab('enter_test');
    } else if (role === 'admin') {
      setShowAdminAuthModal(true);
    }
  };

  const handleStartTest = (test: Test) => {
    if (test.share_code) {
      setExamShareCode(test.share_code);
    } else {
      setExamShareCode(test.id);
    }
  };

  // If user opened with direct link `?take=EDX-XXXX-XXXX`, show student exam taking immediately
  if (examShareCode) {
    return (
      <InteractiveTestTaking
        shareCode={examShareCode}
        testId={examShareCode}
        onExit={() => {
          setExamShareCode(null);
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
      />
    );
  }

  // Printable View for A4 Paper Export
  if (printingTest) {
    return (
      <PrintableView
        test={printingTest}
        onBack={() => setPrintingTest(null)}
      />
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-slate-50 font-sans">
      {/* Top Navigation - Immovably Fixed at the top across all pages */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onSwitchRole={handleSwitchRole}
        onOpenProModal={() => setShowProModal(true)}
        onOpenAdminAuth={() => setShowAdminAuthModal(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onSelectCategory={(_catId, _itemId) => {
          if (viewingAnsweredTestId) setViewingAnsweredTestId(null);
          setActiveTab('exams_hub');
        }}
        onNavigateTab={(tab) => {
          if (viewingAnsweredTestId) setViewingAnsweredTestId(null);
          setActiveTab(tab);
        }}
        onLogout={() => {
          api.logout();
          setShowAuthModal(true);
        }}
      />

      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Sidebar - Fixed on the left */}
        <Sidebar
          role={currentUser.role}
          activeTab={activeTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onSelectTab={(tab) => {
            if (viewingAnsweredTestId) setViewingAnsweredTestId(null);
            setActiveTab(tab);
            setSidebarOpen(false);
            if (tab === 'create_test') {
              setEditingTestId(null);
            }
          }}
          className={`${sidebarOpen ? 'fixed inset-y-0 left-0 z-40 shadow-2xl' : 'hidden lg:flex'} shrink-0 h-full overflow-y-auto`}
        />

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* Main Content Area - Split-view for OMR & AI test creators, scrollable for dashboard, exams hub & other pages */}
        <main className={`flex-1 min-w-0 min-h-0 ${activeTab === 'omr_test' || activeTab === 'ai_test' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto overflow-x-hidden'}`}>
          {viewingAnsweredTestId ? (
            <AnsweredTestPage
              testId={viewingAnsweredTestId}
              onBack={() => setViewingAnsweredTestId(null)}
              onPrint={(t) => setPrintingTest(t)}
              onShare={(t) => setSharingTest(t)}
            />
          ) : (
            <>
              {/* HAQQINDA SƏHİFƏSİ VƏ AI TANITIM VİDEOSU (Bütün rollar üçün açıq) */}
              {activeTab === 'about' ? (
                <AboutPage
                  user={currentUser}
                  onNavigateTab={(tab) => {
                    if (viewingAnsweredTestId) setViewingAnsweredTestId(null);
                    setActiveTab(tab);
                  }}
                />
              ) : activeTab === 'regional_stats' ? (
                <RegionalStatsPage user={currentUser} />
              ) : (
                <>
                  {/* TEACHER VIEWS */}
                  {currentUser.role === 'teacher' && (
                <>
              {activeTab === 'dashboard' && (
                <TeacherDashboard
                  user={currentUser}
                  onNavigate={(tab) => {
                    setActiveTab(tab);
                    if (tab === 'create_test') setEditingTestId(null);
                  }}
                  onShareTest={(test) => setSharingTest(test)}
                  onOpenTest={(testId) => {
                    setEditingTestId(testId);
                    setActiveTab('create_test');
                  }}
                />
              )}

              {activeTab === 'create_test' && (
                <TestCreatorPage
                  user={currentUser}
                  editTestId={editingTestId}
                  onBack={() => setActiveTab('my_tests')}
                  onSaved={(test, shouldShare) => {
                    if (shouldShare) {
                      setSharingTest(test);
                    }
                    setActiveTab('my_tests');
                  }}
                />
              )}

              {activeTab === 'ai_test' && (
                <AiTestCreatorPage
                  user={currentUser}
                  onBack={() => setActiveTab('my_tests')}
                  onOpenInteractiveEditor={(testId) => {
                    setEditingTestId(testId);
                    setActiveTab('create_test');
                  }}
                  onOpenOmrEditor={(testId) => {
                    setViewingAnsweredTestId(testId);
                  }}
                  onTestSaved={(test, shouldShare) => {
                    if (shouldShare) {
                      setSharingTest(test);
                    }
                    setActiveTab('my_tests');
                  }}
                />
              )}

              {(activeTab === 'my_tests' || activeTab === 'exams_hub' || activeTab === 'exams_subjects' || activeTab === 'exams_grades' || activeTab === 'shared_tests' || activeTab === 'archive') && (
                <MyTestsPage
                  user={currentUser}
                  initialTab={
                    activeTab === 'exams_subjects' ? 'subjects' :
                    activeTab === 'exams_grades' ? 'grades' :
                    activeTab === 'exams_hub' ? 'subjects' :
                    'all'
                  }
                  onNavigateCreate={() => {
                    setEditingTestId(null);
                    setActiveTab('create_test');
                  }}
                  onEditTest={(testId) => {
                    setEditingTestId(testId);
                    setActiveTab('create_test');
                  }}
                  onOpenAnsweredTest={(testId) => {
                    setViewingAnsweredTestId(testId);
                  }}
                  onShareTest={(test) => setSharingTest(test)}
                  onPrintTest={(test) => setPrintingTest(test)}
                  onViewResults={(testId) => {
                    setResultsFilterTestId(testId);
                    setActiveTab('results');
                  }}
                  onStartTest={(test) => {
                    handleStartTest(test);
                  }}
                />
              )}

              {activeTab === 'omr_test' && (
                <OmrTestCreatorPage
                  user={currentUser}
                  onBack={() => setActiveTab('my_tests')}
                  onSaved={() => setActiveTab('my_tests')}
                />
              )}

              {activeTab === 'question_bank' && (
                <QuestionBankPage
                  user={currentUser}
                  onSendToTest={async (targetMode, qIds) => {
                    try {
                      const res = await api.sendBankQuestionsToTest(qIds, targetMode);
                      if (targetMode === 'answered') {
                        setViewingAnsweredTestId(res.test_id);
                      } else {
                        // Open Share link modal for interactive test
                        setSharingTest({
                          id: res.test_id,
                          title: `Bankdan yaradılmış test (${qIds.length} sual)`,
                          exam_model: 'Buraxılış imtahanı',
                          subject: 'Riyaziyyat',
                          duration_minutes: qIds.length * 2,
                          total_questions: qIds.length,
                          total_points: qIds.length * 4,
                          grading_rule: 'standard',
                          result_display_mode: 'immediate',
                          test_mode: 'interactive',
                          status: 'published',
                          share_code: res.share_code,
                          is_link_active: true,
                          grade_group: '9-cu sinif',
                          topic: 'Sual bankı seçimi'
                        });
                        setActiveTab('my_tests');
                      }
                    } catch (err: any) {
                      alert(err.message || 'Xəta baş verdi');
                    }
                  }}
                />
              )}

              {activeTab === 'classes' || activeTab === 'students' ? (
                <ClassesPage user={currentUser} />
              ) : null}

              {activeTab === 'results' && (
                <ResultsPage
                  user={currentUser}
                  initialTestId={resultsFilterTestId}
                />
              )}

              {activeTab === 'statistics' && (
                <StatisticsPage user={currentUser} />
              )}

              {activeTab === 'settings' && (
                <SettingsPage
                  user={currentUser}
                  onOpenProModal={() => setShowProModal(true)}
                  onUserUpdate={(u) => setCurrentUser(u)}
                />
              )}
            </>
          )}

          {/* STUDENT VIEWS */}
          {currentUser.role === 'student' && (
            <StudentDashboard
              user={currentUser}
              onEnterTestCode={(code) => setExamShareCode(code)}
              onTakeTest={(testId) => {
                api.getTestById(testId).then(t => {
                  if (t.share_code) {
                    setExamShareCode(t.share_code);
                  }
                });
              }}
            />
          )}

          {/* ADMIN VIEWS */}
          {currentUser.role === 'admin' && (
            <AdminPage currentUser={currentUser} />
          )}
                </>
              )}
            </>
          )}
    </main>
      </div>

      {/* Share Test Modal */}
      {sharingTest && (
        <ShareTestModal
          test={sharingTest}
          onClose={() => setSharingTest(null)}
          onEditTest={(tId) => {
            setSharingTest(null);
            setEditingTestId(tId);
            setActiveTab('create_test');
          }}
        />
      )}

      {/* PRO Activation Modal */}
      {showProModal && (
        <ProActivationModal
          user={currentUser}
          onClose={() => setShowProModal(false)}
          onSuccess={(u) => {
            setCurrentUser(u);
            api.login('muellim@edunex.az', 'muellim123').catch(() => {});
          }}
        />
      )}

      {/* Admin Authentication Modal */}
      {showAdminAuthModal && (
        <AdminAuthModal
          onClose={() => setShowAdminAuthModal(false)}
          onSuccess={(adminUser) => {
            setCurrentUser(adminUser);
            setActiveTab('users');
          }}
        />
      )}

      {/* Futuristic Cyber Quantum Auth Modal (Daxil Ol / Qeydiyyat) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(loggedUser) => {
          setCurrentUser(loggedUser);
          if (loggedUser.role === 'admin') {
            setActiveTab('users');
          } else if (loggedUser.role === 'student') {
            setActiveTab('enter_test');
          } else {
            setActiveTab('dashboard');
          }
        }}
      />
    </div>
  );
}

export default App;
