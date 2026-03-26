import { useState } from 'react'
import './RecruiterPanel.css'

function RecruiterPanel({ recruiterId, onPostJob }) {
    const [jobData, setJobData] = useState({
        title: '',
        company: '',
        location: '',
        description: '',
    })

    const handleChange = (event) => {
        setJobData((previous) => ({
            ...previous,
            [event.target.name]: event.target.value,
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        await onPostJob({ ...jobData, postedBy: recruiterId })

        setJobData({
            title: '',
            company: '',
            location: '',
            description: '',
        })
    }

    return (
        <div className="card recruiter-panel">
            <h3>Post a Job</h3>
            <form onSubmit={handleSubmit} className="form-grid">
                <input
                    name="title"
                    placeholder="Job Title"
                    value={jobData.title}
                    onChange={handleChange}
                    required
                />
                <input
                    name="company"
                    placeholder="Company"
                    value={jobData.company}
                    onChange={handleChange}
                    required
                />
                <input
                    name="location"
                    placeholder="Location"
                    value={jobData.location}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="description"
                    placeholder="Job Description"
                    value={jobData.description}
                    onChange={handleChange}
                    rows={4}
                    required
                />
                <button type="submit" className="primary-btn">Post Job</button>
            </form>
        </div>
    )
}

export default RecruiterPanel
