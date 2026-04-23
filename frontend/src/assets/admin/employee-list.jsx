import { useMemo, useState } from 'react'
import { Search, Plus, Edit2, Trash2, Users } from './icons'

/**
 * Employee listing table. Data is currently provided by the parent
 * Dashboard (frontend-only mock). Backend integration pending.
 */
function EmployeeList({ employees = [], loading = false, onEdit, onDelete, onNew }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return employees
    return employees.filter((emp) => {
      const haystack = [
        emp.first_name,
        emp.middle_name,
        emp.last_name,
        emp.id_number,
        emp.position,
        emp.department,
        emp.contact_number,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [employees, search])

  const handleDelete = (emp) => {
    const name = `${emp.first_name} ${emp.last_name}`.trim() || 'this employee'
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return
    onDelete?.(emp.id)
  }

  return (
    <div className="emp-list">
      <div className="list-toolbar">
        <div className="list-title">
          <Users size={20} />
          <span>All Employees</span>
          <span className="total-badge">{employees.length}</span>
        </div>
        <div className="list-actions">
          <div className="search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search employees…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-new" onClick={onNew}>
            <Plus size={15} />
            New Employee
          </button>
        </div>
      </div>

      <div className="list-table-wrapper">
        {loading ? (
          <div className="list-loading">
            <div className="loading-spinner" />
            <span>Loading employees…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="list-empty">
            <Users size={40} />
            <p>{employees.length === 0 ? 'No employees yet' : 'No matches found'}</p>
            {employees.length === 0 && (
              <button className="btn-new" onClick={onNew}>
                <Plus size={14} /> Add First Employee
              </button>
            )}
          </div>
        ) : (
          <table className="emp-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>ID Number</th>
                <th>Full Name</th>
                <th>Position</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                const initials = `${emp.first_name?.[0] || ''}${emp.last_name?.[0] || ''}`.toUpperCase()
                const photoSrc = emp.photoPreview || emp.photo_url
                return (
                  <tr key={emp.id}>
                    <td>
                      <div className="table-photo">
                        {photoSrc ? (
                          <img src={photoSrc} alt={emp.first_name || 'Employee'} />
                        ) : (
                          <div className="table-photo-placeholder">{initials || '—'}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="id-chip">{emp.id_number || '—'}</span>
                    </td>
                    <td className="name-cell">
                      {[emp.first_name, emp.middle_name ? `${emp.middle_name[0]}.` : '', emp.last_name]
                        .filter(Boolean)
                        .join(' ')}
                    </td>
                    <td>{emp.position || '—'}</td>
                    <td>{emp.department || '—'}</td>
                    <td>{emp.contact_number || '—'}</td>
                    <td>
                      <span className={`status-pill ${emp.status || 'active'}`}>
                        {emp.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="tbl-btn edit"
                          onClick={() => onEdit?.(emp)}
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="tbl-btn delete"
                          onClick={() => handleDelete(emp)}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default EmployeeList
