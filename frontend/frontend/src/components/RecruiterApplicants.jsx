function RecruiterApplicants({ applications }) {
    if (!applications.length) {
        return (
            <section className="card">
                <h3>Applicants</h3>
                <p className="sub">No applicants yet for your jobs.</p>
            </section>
        )
    }

    return (
        <section className="card applicants-panel">
            <h3>Applicants</h3>
            <div className="applicants-list">
                {applications.map((application) => (
                    <div key={application._id} className="applicant-item">
                        <p><strong>Job:</strong> {application.job?.title} ({application.job?.company})</p>
                        <p><strong>Name:</strong> {application.student?.name}</p>
                        <p><strong>Email:</strong> {application.student?.email}</p>
                        <p><strong>Status:</strong> {application.status}</p>
                        {application.resumePath && (
                            <a
                                href={`http://localhost:5000${application.resumePath}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                View Resume
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}

export default RecruiterApplicants
