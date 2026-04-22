import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './id-generator.css'

const defaultForm = {
  idNumber: '',
  fullName: localStorage.getItem('employeeName') || '',
  position: '',
  division: '',
  contactNumber: '',
  address: '',
  bloodType: '',
  emergencyName: '',
  emergencyPhone: '',
}

function EmployeeIdGenerator() {
  const navigate = useNavigate()
  const [form, setForm] = useState(defaultForm)
  const [activeSide, setActiveSide] = useState('front')

  useEffect(() => {
    const token = localStorage.getItem('employeeToken')
    if (!token) {
      navigate('/', { replace: true })
    }
  }, [navigate])

  const initials = useMemo(() => {
    if (!form.fullName) return ''
    return form.fullName
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .slice(0, 3)
      .toUpperCase()
  }, [form.fullName])

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="id-page">
      <div className="id-bg" />
      <header className="id-header">
        <div>
          <h1>Employee ID Encoding</h1>
          <p>Preview your front and back ID layout while filling out the official details.</p>
        </div>
        <div className="session-chip">
          <span className="label">Signed in as</span>
          <span className="value">{form.fullName || 'Employee'}</span>
        </div>
      </header>

      <main className="id-workspace">
        <section className="form-panel">
          <div className="panel-title">
            <h2>ID Data Capture</h2>
            <p>Please match the official masterlist spelling to avoid reprints.</p>
          </div>

          <div className="form-grid">
            <label>
              <span>ID Number</span>
              <input
                type="text"
                placeholder="BFAR-XII-0000"
                value={form.idNumber}
                onChange={handleChange('idNumber')}
              />
            </label>
            <label className="full">
              <span>Full name</span>
              <input
                type="text"
                placeholder="Surname, First name Middle initial"
                value={form.fullName}
                onChange={handleChange('fullName')}
              />
            </label>
            <label>
              <span>Position / Title</span>
              <input type="text" placeholder="Aquaculture Technician" value={form.position} onChange={handleChange('position')} />
            </label>
            <label>
              <span>Division / Unit</span>
              <input type="text" placeholder="Fisheries Post-Harvest" value={form.division} onChange={handleChange('division')} />
            </label>
            <label>
              <span>Contact number</span>
              <input type="text" placeholder="09XX XXX XXXX" value={form.contactNumber} onChange={handleChange('contactNumber')} />
            </label>
            <label>
              <span>Blood type</span>
              <input type="text" placeholder="O+" value={form.bloodType} onChange={handleChange('bloodType')} />
            </label>
            <label className="full">
              <span>Home address</span>
              <textarea placeholder="House no, Street, Barangay, Municipality" value={form.address} onChange={handleChange('address')} />
            </label>
            <label>
              <span>Emergency contact name</span>
              <input type="text" placeholder="Juan Dela Cruz" value={form.emergencyName} onChange={handleChange('emergencyName')} />
            </label>
            <label>
              <span>Emergency contact number</span>
              <input type="text" placeholder="09XX XXX XXXX" value={form.emergencyPhone} onChange={handleChange('emergencyPhone')} />
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="ghost" onClick={() => navigate('/', { replace: true })}>
              Return to landing
            </button>
            <div className="action-group">
              <button type="button" className="ghost">
                Save draft
              </button>
              <button type="button" className="primary">
                Submit for approval
              </button>
            </div>
          </div>
        </section>

        <section className="preview-panel">
          <div className="preview-header">
            <h2>ID Preview</h2>
            <div className="toggle-group">
              <button
                type="button"
                className={activeSide === 'front' ? 'toggle active' : 'toggle'}
                onClick={() => setActiveSide('front')}
              >
                Front
              </button>
              <button
                type="button"
                className={activeSide === 'back' ? 'toggle active' : 'toggle'}
                onClick={() => setActiveSide('back')}
              >
                Back
              </button>
            </div>
          </div>

          <div className={`id-canvas ${activeSide}`}>
            {activeSide === 'front' ? (
              <div className="card card-front">
                <div className="card-header">
                  <img src="/bfar-logo.png" alt="BFAR XII" className="card-logo" />
                  <div className="card-titles">
                    <p>Republic of the Philippines</p>
                    <p>Department of Agriculture</p>
                    <h3>Bureau of Fisheries and Aquatic Resources XII</h3>
                  </div>
                </div>
                <div className="card-body">
                  <div className="photo-frame">
                    <span>{initials || 'ID'}</span>
                    <p>Photo here</p>
                  </div>
                  <div className="identity-block">
                    <span className="label">ID No.</span>
                    <span className="value id-number">{form.idNumber || 'BFAR-XII-0000'}</span>
                    <span className="label">Name</span>
                    <span className="value name">{form.fullName || 'FULL NAME'}</span>
                    <span className="label">Position</span>
                    <span className="value">{form.position || 'Position Title'}</span>
                    <span className="label">Division</span>
                    <span className="value">{form.division || 'Division / Unit'}</span>
                  </div>
                </div>
                <div className="card-footer">
                  <span>Signature</span>
                </div>
              </div>
            ) : (
              <div className="card card-back">
                <div className="card-back-header">
                  <h3>Emergency Details</h3>
                  <p>Keep this information up to date for medical emergencies.</p>
                </div>
                <dl>
                  <div>
                    <dt>Home address</dt>
                    <dd>{form.address || 'Complete residential address'}</dd>
                  </div>
                  <div>
                    <dt>Contact number</dt>
                    <dd>{form.contactNumber || '09XX XXX XXXX'}</dd>
                  </div>
                  <div>
                    <dt>Blood type</dt>
                    <dd>{form.bloodType || 'Type'}</dd>
                  </div>
                  <div>
                    <dt>In case of emergency</dt>
                    <dd>{form.emergencyName || 'Contact name'}</dd>
                    <dd>{form.emergencyPhone || 'Contact number'}</dd>
                  </div>
                </dl>
                <footer>
                  <p>
                    This certifies that the person whose picture and signature appear hereof is a bona fide employee of the Bureau of
                    Fisheries and Aquatic Resources XII.
                  </p>
                  <div className="director">
                    <span className="name">Eugene M. Casas</span>
                    <span className="title">Officer-in-Charge, Regional Director</span>
                  </div>
                </footer>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default EmployeeIdGenerator