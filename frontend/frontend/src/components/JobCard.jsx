import './JobCard.css'

function JobCard({
    job,
    currentUser,
    selectedFile,
    onSelectResume,
    onApply,
    applicationStatus,
}) {
    const isStudent = currentUser.role === 'student'

    return (
        <div className="card job-card">
            <h3>{job.title}</h3>
            <p><strong>Company:</strong> {job.company}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <p className="job-description">{job.description}</p>

            {isStudent && (
                <div className="apply-box">
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(event) => onSelectResume(job._id, event.target.files?.[0] || null)}
                    />
                    <button className="primary-btn" onClick={() => onApply(job._id)}>
                        Apply
                    </button>
                    {selectedFile && <p className="sub">Selected: {selectedFile.name}</p>}
                    {applicationStatus && <p className="sub">{applicationStatus}</p>}
                </div>
            )}
        </div>
    )
}

export default JobCard
