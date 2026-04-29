import { useEffect, useMemo, useState } from 'react'
import {
  FiBarChart2,
  FiBookOpen,
  FiBriefcase,
  FiClipboard,
  FiHome,
  FiLayers,
  FiLogOut,
  FiSearch,
  FiUser,
  FiUsers,
} from 'react-icons/fi'
import { api, API_BASE_URL } from './api'
import LoginForm from './components/LoginForm'
import './App.css'

const USER_STORAGE_KEY = 'student_job_portal_user'

const studentTips = [
  'Customize your resume for every job description.',
  'Write short and clear project descriptions with outcomes.',
  'Practice top interview questions before applying.',
  'Apply consistently every week to improve results.',
]

const asArray = (value) => (Array.isArray(value) ? value : [])

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState('info')
  const [loading, setLoading] = useState(false)

  const [activeSection, setActiveSection] = useState('overview')
  const [showSidebarProfile, setShowSidebarProfile] = useState(false)
  const [allJobs, setAllJobs] = useState([])
  const [studentApplications, setStudentApplications] = useState([])
  const [recruiterJobs, setRecruiterJobs] = useState([])
  const [recruiterApplications, setRecruiterApplications] = useState([])
  const [selectedCandidateApplication, setSelectedCandidateApplication] = useState(null)
  const [usersCount, setUsersCount] = useState(0)
  const [resumeFiles, setResumeFiles] = useState({})

  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
  })

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)

    if (!storedUser) {
      return
    }

    try {
      setCurrentUser(JSON.parse(storedUser))
    } catch (_error) {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    if (!currentUser) {
      localStorage.removeItem(USER_STORAGE_KEY)
      return
    }

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser))
  }, [currentUser])

  const isRecruiter = currentUser?.role === 'recruiter'

  const appliedJobIds = useMemo(
    () => new Set(asArray(studentApplications).map((application) => application.job?._id)),
    [studentApplications],
  )

  const profileCompletion = useMemo(() => {
    if (!currentUser) {
      return 0
    }

    const fields = [currentUser.name, currentUser.email, currentUser.role]
    const filled = fields.filter(Boolean).length
    return Math.round((filled / fields.length) * 100)
  }, [currentUser])

  const studentStats = {
    totalJobs: allJobs.length,
    applicationsCount: studentApplications.length,
    activeUsers: usersCount,
  }

  const recruiterStats = {
    totalJobsPosted: recruiterJobs.length,
    totalApplicationsReceived: recruiterApplications.length,
    activeUsers: usersCount,
  }

  const loadStudentData = async (userId) => {
    const [jobsResult, applicationsResult, usersResult] = await Promise.all([
      api.getJobs(),
      api.getStudentApplications(userId),
      api.getUsersCount(),
    ])

    if (jobsResult.success) {
      setAllJobs(asArray(jobsResult))
    } else {
      setStatusMessage(jobsResult.message || 'Failed to load jobs')
      setStatusType('error')
    }

    if (applicationsResult.success) {
      setStudentApplications(asArray(applicationsResult))
    } else {
      setStatusMessage(applicationsResult.message || 'Failed to load applications')
      setStatusType('error')
    }

    if (usersResult.success) {
      setUsersCount(usersResult.totalUsers || 0)
    }
  }

  const loadRecruiterData = async (userId) => {
    const [jobsResult, recruiterJobsResult, applicationsResult, usersResult] = await Promise.all([
      api.getJobs(),
      api.getRecruiterJobs(userId),
      api.getRecruiterApplications(userId),
      api.getUsersCount(),
    ])

    if (jobsResult.success) {
      setAllJobs(asArray(jobsResult))
    } else {
      setStatusMessage(jobsResult.message || 'Failed to load jobs')
      setStatusType('error')
    }

    if (recruiterJobsResult.success) {
      setRecruiterJobs(asArray(recruiterJobsResult))
    } else {
      setStatusMessage(recruiterJobsResult.message || 'Failed to load your jobs')
      setStatusType('error')
    }

    if (applicationsResult.success) {
      setRecruiterApplications(asArray(applicationsResult))

      const updatedApplications = asArray(applicationsResult)
      if (!selectedCandidateApplication) {
        setSelectedCandidateApplication(updatedApplications[0] || null)
      } else {
        const matchingApplication = updatedApplications.find(
          (application) => application._id === selectedCandidateApplication._id,
        )
        setSelectedCandidateApplication(matchingApplication || updatedApplications[0] || null)
      }
    } else {
      setStatusMessage(applicationsResult.message || 'Failed to load applicants')
      setStatusType('error')
    }

    if (usersResult.success) {
      setUsersCount(usersResult.totalUsers || 0)
    }
  }

  const loadDashboardData = async (user = currentUser) => {
    if (!user) {
      return
    }

    setLoading(true)
    if (user.role === 'student') {
      await loadStudentData(user._id)
    } else {
      await loadRecruiterData(user._id)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!currentUser) {
      return
    }

    setActiveSection('overview')
    loadDashboardData(currentUser)
  }, [currentUser])

  const handleRegister = async (payload) => {
    const result = await api.register(payload)
    setStatusMessage(result.message || 'Registration failed')
    setStatusType(result.success ? 'success' : 'error')
  }

  const handleLogin = async (payload) => {
    const result = await api.login(payload)

    if (!result.success || !result.user) {
      setStatusMessage(result.message || 'Login failed')
      setStatusType('error')
      return false
    }

    setCurrentUser(result.user)
    setStatusMessage(`Login successful. Welcome, ${result.user.name}`)
    setStatusType('success')
    return true
  }

  const handleGoogleLogin = async (payload) => {
    const result = await api.googleLogin(payload)

    if (!result.success || !result.user) {
      setStatusMessage(result.message || 'Google login failed')
      setStatusType('error')
      return false
    }

    setCurrentUser(result.user)
    setStatusMessage(`Login successful. Welcome, ${result.user.name}`)
    setStatusType('success')
    return true
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setAllJobs([])
    setStudentApplications([])
    setRecruiterJobs([])
    setRecruiterApplications([])
    setSelectedCandidateApplication(null)
    setUsersCount(0)
    setResumeFiles({})
    setJobForm({
      title: '',
      company: '',
      location: '',
      description: '',
    })
    setStatusMessage('You have logged out')
    setStatusType('info')
    setShowSidebarProfile(false)
  }

  const handleApply = async (jobId) => {
    const result = await api.applyForJob({
      studentId: currentUser._id,
      jobId,
      resumeFile: resumeFiles[jobId],
    })

    setStatusMessage(result.message || 'Application request completed')
    setStatusType(result.success ? 'success' : 'error')

    if (result.success) {
      await loadStudentData(currentUser._id)
    }
  }

  const handlePostJob = async (event) => {
    event.preventDefault()
    const result = await api.postJob({ ...jobForm, postedBy: currentUser._id })

    setStatusMessage(result.message || 'Could not post job')
    setStatusType(result.success ? 'success' : 'error')

    if (result.success) {
      setJobForm({
        title: '',
        company: '',
        location: '',
        description: '',
      })
      await loadRecruiterData(currentUser._id)
      setActiveSection('manage-jobs')
    }
  }

  const handleRemoveJob = async (jobId) => {
    const confirmed = window.confirm('Do you want to remove this job?')
    if (!confirmed) {
      return
    }

    const result = await api.deleteJob({
      jobId,
      recruiterId: currentUser._id,
    })

    setStatusMessage(result.message || 'Could not remove job')
    setStatusType(result.success ? 'success' : 'error')

    if (result.success) {
      await loadRecruiterData(currentUser._id)
    }
  }

  const studentSections = [
    { id: 'overview', label: 'Overview', icon: FiHome },
    { id: 'browse-jobs', label: 'Browse Jobs', icon: FiSearch },
    { id: 'applied-jobs', label: 'Applied Jobs', icon: FiClipboard },
    { id: 'profile', label: 'Profile Completion', icon: FiUser },
    { id: 'career-tips', label: 'Career Tips', icon: FiBookOpen },
  ]

  const recruiterSections = [
    { id: 'overview', label: 'Overview', icon: FiHome },
    { id: 'post-job', label: 'Post Job', icon: FiBriefcase },
    { id: 'view-applicants', label: 'View Applicants', icon: FiUsers },
    { id: 'manage-jobs', label: 'Manage Jobs', icon: FiLayers },
    { id: 'stats', label: 'Dashboard Stats', icon: FiBarChart2 },
  ]

  const sections = isRecruiter ? recruiterSections : studentSections

  const renderStudentContent = () => {
    if (activeSection === 'overview') {
      return (
        <>
          <section className="stats-grid">
            <article className="card stat-card">
              <p>Total Jobs</p>
              <h3>{studentStats.totalJobs}</h3>
            </article>
            <article className="card stat-card">
              <p>Applications Count</p>
              <h3>{studentStats.applicationsCount}</h3>
            </article>
            <article className="card stat-card">
              <p>Active Users</p>
              <h3>{studentStats.activeUsers}</h3>
            </article>
          </section>

          <section className="feature-grid">
            <button className="card feature-btn" onClick={() => setActiveSection('browse-jobs')}>
              <h4>Browse Jobs</h4>
              <p>View all jobs and apply</p>
            </button>
            <button className="card feature-btn" onClick={() => setActiveSection('applied-jobs')}>
              <h4>Applied Jobs</h4>
              <p>Track your submitted applications</p>
            </button>
            <button className="card feature-btn" onClick={() => setActiveSection('profile')}>
              <h4>Profile Completion</h4>
              <p>Check profile percentage</p>
            </button>
            <button className="card feature-btn" onClick={() => setActiveSection('career-tips')}>
              <h4>Career Tips</h4>
              <p>Get practical guidance cards</p>
            </button>
          </section>
        </>
      )
    }

    if (activeSection === 'browse-jobs') {
      return (
        <section className="jobs-grid">
          {allJobs.length === 0 && <article className="card">No jobs available yet.</article>}
          {allJobs.map((job) => {
            const isApplied = appliedJobIds.has(job._id)

            return (
              <article key={job._id} className="card">
                <h4>{job.title}</h4>
                <p><strong>Company:</strong> {job.company}</p>
                <p><strong>Location:</strong> {job.location}</p>
                <p>{job.description}</p>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0] || null
                    setResumeFiles((previous) => ({ ...previous, [job._id]: selectedFile }))
                  }}
                />

                <button
                  className="primary-btn"
                  disabled={isApplied}
                  onClick={() => handleApply(job._id)}
                >
                  {isApplied ? 'Already Applied' : 'Apply'}
                </button>
              </article>
            )
          })}
        </section>
      )
    }

    if (activeSection === 'applied-jobs') {
      return (
        <section className="jobs-grid">
          {studentApplications.length === 0 && <article className="card">No applications submitted yet.</article>}
          {studentApplications.map((application) => (
            <article key={application._id} className="card">
              <h4>{application.job?.title || 'Job removed'}</h4>
              <p><strong>Company:</strong> {application.job?.company || '-'}</p>
              <p><strong>Status:</strong> {application.status}</p>
              <p><strong>Applied On:</strong> {new Date(application.createdAt).toLocaleDateString()}</p>
            </article>
          ))}
        </section>
      )
    }

    if (activeSection === 'profile') {
      return (
        <section className="card">
          <h3>Profile Completion</h3>
          <p>Your profile completion is {profileCompletion}%.</p>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${profileCompletion}%` }} />
          </div>
          <p className="muted">Tip: Keep your resume updated and projects clear to improve visibility.</p>
        </section>
      )
    }

    return (
      <section className="feature-grid">
        {studentTips.map((tip) => (
          <article className="card" key={tip}>
            <h4>Career Tip</h4>
            <p>{tip}</p>
          </article>
        ))}
      </section>
    )
  }

  const renderRecruiterContent = () => {
    if (activeSection === 'overview') {
      return (
        <>
          <section className="stats-grid">
            <article className="card stat-card">
              <p>Total Jobs Posted</p>
              <h3>{recruiterStats.totalJobsPosted}</h3>
            </article>
            <article className="card stat-card">
              <p>Total Applications Received</p>
              <h3>{recruiterStats.totalApplicationsReceived}</h3>
            </article>
            <article className="card stat-card">
              <p>Active Users</p>
              <h3>{recruiterStats.activeUsers}</h3>
            </article>
          </section>

          <section className="feature-grid">
            <button className="card feature-btn" onClick={() => setActiveSection('post-job')}>
              <h4>Post Job</h4>
              <p>Create new role and save to MongoDB</p>
            </button>
            <button className="card feature-btn" onClick={() => setActiveSection('view-applicants')}>
              <h4>View Applicants</h4>
              <p>See all students who applied</p>
            </button>
            <button className="card feature-btn" onClick={() => setActiveSection('manage-jobs')}>
              <h4>Manage Jobs</h4>
              <p>Review your posted jobs</p>
            </button>
            <button className="card feature-btn" onClick={() => setActiveSection('stats')}>
              <h4>Dashboard Stats</h4>
              <p>Track posting and applicant numbers</p>
            </button>
          </section>
        </>
      )
    }

    if (activeSection === 'post-job') {
      return (
        <section className="card">
          <h3>Post Job</h3>
          <form className="form-grid" onSubmit={handlePostJob}>
            <input
              name="title"
              placeholder="Job title"
              value={jobForm.title}
              onChange={(event) => setJobForm((previous) => ({ ...previous, title: event.target.value }))}
              required
            />
            <input
              name="company"
              placeholder="Company"
              value={jobForm.company}
              onChange={(event) => setJobForm((previous) => ({ ...previous, company: event.target.value }))}
              required
            />
            <input
              name="location"
              placeholder="Location"
              value={jobForm.location}
              onChange={(event) => setJobForm((previous) => ({ ...previous, location: event.target.value }))}
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              rows={5}
              value={jobForm.description}
              onChange={(event) => setJobForm((previous) => ({ ...previous, description: event.target.value }))}
              required
            />
            <button className="primary-btn" type="submit">Post Job</button>
          </form>
        </section>
      )
    }

    if (activeSection === 'view-applicants') {
      return (
        <>
          {selectedCandidateApplication && (
            <section className="card candidate-profile-card">
              <h3>Candidate Profile</h3>
              <p><strong>Name:</strong> {selectedCandidateApplication.student?.name || '-'}</p>
              <p><strong>Email:</strong> {selectedCandidateApplication.student?.email || '-'}</p>
              <p><strong>Role:</strong> {selectedCandidateApplication.student?.role || 'student'}</p>
              <p><strong>Applied Job:</strong> {selectedCandidateApplication.job?.title || '-'}</p>
              <p><strong>Company:</strong> {selectedCandidateApplication.job?.company || '-'}</p>
              <p><strong>Status:</strong> {selectedCandidateApplication.status}</p>
              <p>
                <strong>Applied On:</strong>{' '}
                {new Date(selectedCandidateApplication.createdAt).toLocaleDateString()}
              </p>
              {selectedCandidateApplication.resumePath && (
                <a
                  href={selectedCandidateApplication.resumeUrl || `${API_BASE_URL.replace('/api', '')}${selectedCandidateApplication.resumePath}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Candidate Resume
                </a>
              )}
            </section>
          )}

          <section className="jobs-grid">
            {recruiterApplications.length === 0 && <article className="card">No applicants yet for your jobs.</article>}
            {recruiterApplications.map((application) => (
              <article key={application._id} className="card">
                <h4>{application.job?.title}</h4>
                <p><strong>Candidate:</strong> {application.student?.name}</p>
                <p><strong>Email:</strong> {application.student?.email}</p>
                <p><strong>Status:</strong> {application.status}</p>

                <button
                  className="secondary-btn"
                  type="button"
                  onClick={() => setSelectedCandidateApplication(application)}
                >
                  {selectedCandidateApplication?._id === application._id ? 'Profile Selected' : 'View Profile'}
                </button>

                {application.resumePath && (
                  <a
                    href={application.resumeUrl || `${API_BASE_URL.replace('/api', '')}${application.resumePath}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Resume
                  </a>
                )}
              </article>
            ))}
          </section>
        </>
      )
    }

    if (activeSection === 'manage-jobs') {
      return (
        <section className="jobs-grid">
          {recruiterJobs.length === 0 && <article className="card">You have not posted any jobs yet.</article>}
          {recruiterJobs.map((job) => (
            <article key={job._id} className="card">
              <h4>{job.title}</h4>
              <p><strong>Company:</strong> {job.company}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p>{job.description}</p>
              <p className="muted">Posted on {new Date(job.createdAt).toLocaleDateString()}</p>
              <p className="muted">
                Auto remove on {job.expiresAt ? new Date(job.expiresAt).toLocaleDateString() : 'in 2 days'}
              </p>
              <button
                className="secondary-btn"
                type="button"
                onClick={() => handleRemoveJob(job._id)}
              >
                Remove Job
              </button>
            </article>
          ))}
        </section>
      )
    }

    return (
      <section className="stats-grid">
        <article className="card stat-card">
          <p>Total Jobs Posted</p>
          <h3>{recruiterStats.totalJobsPosted}</h3>
        </article>
        <article className="card stat-card">
          <p>Total Applications Received</p>
          <h3>{recruiterStats.totalApplicationsReceived}</h3>
        </article>
        <article className="card stat-card">
          <p>All Platform Jobs</p>
          <h3>{allJobs.length}</h3>
        </article>
      </section>
    )
  }

  return (
    <div className={currentUser ? 'app-shell' : 'app-shell auth-shell'}>
      {!currentUser ? (
        <LoginForm
          onLogin={handleLogin}
          onGoogleLogin={handleGoogleLogin}
          onRegister={handleRegister}
          statusMessage={statusMessage}
          statusType={statusType}
        />
      ) : (
        <div className="dashboard-layout">
          <aside className="sidebar-panel">
            <div>
              <h1 className="brand-title">Student Job Portal</h1>
              <p className="brand-subtitle">{isRecruiter ? 'Recruiter Dashboard' : 'Student Dashboard'}</p>
            </div>

            <nav className="sidebar-nav">
              {sections.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id

                return (
                  <button
                    key={item.id}
                    className={`sidebar-btn ${isActive ? 'sidebar-btn-active' : ''}`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>

            <div className="sidebar-bottom-actions">
              <button
                className="sidebar-btn sidebar-profile-toggle"
                type="button"
                onClick={() => setShowSidebarProfile((previous) => !previous)}
              >
                <FiUser size={17} />
                <span>{showSidebarProfile ? 'Hide Profile' : 'Profile'}</span>
              </button>

              {showSidebarProfile && (
                <section className="sidebar-profile card">
                  <h4>Profile Details</h4>
                  <p><strong>Name:</strong> {currentUser.name}</p>
                  <p><strong>Email:</strong> {currentUser.email}</p>
                  <p><strong>Role:</strong> {currentUser.role}</p>
                </section>
              )}

              <button className="sidebar-btn sidebar-btn-logout" onClick={handleLogout}>
                <FiLogOut size={17} />
                <span>Logout</span>
              </button>
            </div>
          </aside>

          <main className="dashboard-main">
            <header className="dashboard-header card">
              <div>
                <p className="muted">Signed in as</p>
                <h2>{currentUser.name}</h2>
              </div>
              <div className="header-actions">
                <span className="role-pill">{currentUser.role}</span>
              </div>
            </header>

            {statusMessage && <p className={`status-message ${statusType}`}>{statusMessage}</p>}
            {loading && <p className="status-message info">Loading dashboard data...</p>}

            <section className="content-block">
              {isRecruiter ? renderRecruiterContent() : renderStudentContent()}
            </section>
          </main>
        </div>
      )}
    </div>
  )
}

export default App
