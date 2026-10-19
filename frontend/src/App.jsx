import { useEffect, useMemo, useState } from "react";
import {
  getLeads,
  createLead,
  updateLead as updateLeadAPI,
  deleteLead as deleteLeadAPI,
  loginAdmin,
} from "./services/api";
import "./index.css";

const emptyLead = {
  name: "",
  email: "",
  source: "Website",
  status: "New",
  notes: "",
  followUp: "",
};

function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [activePage, setActivePage] = useState("Dashboard");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyLead);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("novacrm_token"))
  );
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLeads([]);
      setLoading(false);
      return;
    }

    async function loadLeads() {
      try {
        setLoading(true);
        setError("");

        const data = await getLeads();
        const formattedLeads = data.map((lead) => ({
          ...lead,
          id: lead._id,
          date: lead.createdAt ? lead.createdAt.slice(0, 10) : "",
          followUp: lead.followUpDate
            ? lead.followUpDate.slice(0, 10)
            : "",
        }));

        setLeads(formattedLeads);
      } catch (err) {
        console.error("Failed to load leads:", err);
        setError("Could not load leads. Check that your backend is running.");
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, [isAuthenticated]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const data = await loginAdmin({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      localStorage.setItem("novacrm_token", data.token);
      setLoginPassword("");
      setIsAuthenticated(true);
    } catch (err) {
      setLoginError(
        err.response?.data?.message ||
          "Unable to log in. Check that the backend is running."
      );
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("novacrm_token");
    setIsAuthenticated(false);
    setActivePage("Dashboard");
    setSelectedLead(null);
    setShowForm(false);
    setError("");
  }

  const stats = [
    {
      label: "Total Leads",
      value: leads.length,
      icon: "◈",
      color: "purple",
    },
    {
      label: "New Leads",
      value: leads.filter((lead) => lead.status === "New").length,
      icon: "✦",
      color: "blue",
    },
    {
      label: "Contacted",
      value: leads.filter((lead) => lead.status === "Contacted").length,
      icon: "↗",
      color: "orange",
    },
    {
      label: "Converted",
      value: leads.filter((lead) => lead.status === "Converted").length,
      icon: "✓",
      color: "green",
    },
  ];

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        `${lead.name} ${lead.email}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || lead.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [leads, search, filter]);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyLead);
    setShowForm(true);
  }

  function openEditForm(lead) {
    setEditingId(lead.id);
    setForm({
      name: lead.name,
      email: lead.email,
      source: lead.source,
      status: lead.status,
      notes: lead.notes,
      followUp: lead.followUp,
    });
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");

      const leadData = {
        ...form,
        followUpDate: form.followUp || null,
      };
      delete leadData.followUp;

      let savedLead;

      if (editingId !== null) {
        savedLead = await updateLeadAPI(editingId, leadData);
      } else {
        savedLead = await createLead(leadData);
      }

      const formattedLead = {
        ...savedLead,
        id: savedLead._id,
        date: savedLead.createdAt ? savedLead.createdAt.slice(0, 10) : "",
        followUp: savedLead.followUpDate
          ? savedLead.followUpDate.slice(0, 10)
          : "",
      };

      setLeads((current) =>
        editingId !== null
          ? current.map((lead) =>
              lead.id === editingId ? formattedLead : lead
            )
          : [formattedLead, ...current]
      );

      setShowForm(false);
      setEditingId(null);
      setForm(emptyLead);
    } catch (err) {
      console.error("Failed to save lead:", err);
      setError(
        err.response?.data?.message || "Could not save lead. Please try again."
      );
    }
  }

  async function deleteLead(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lead?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await deleteLeadAPI(id);
      setLeads((current) => current.filter((lead) => lead.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
    } catch (err) {
      console.error("Failed to delete lead:", err);
      setError("Could not delete lead. Please try again.");
    }
  }

  async function updateStatus(id, status) {
    try {
      setError("");
      const result = await updateLeadAPI(id, { status });

      setLeads((current) =>
        current.map((lead) =>
          lead.id === id ? { ...lead, status: result.status } : lead
        )
      );

      setSelectedLead((current) =>
        current?.id === id
          ? { ...current, status: result.status }
          : current
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("Could not update status. Please try again.");
    }
  }

  const pageTitle =
    activePage === "Dashboard" ? "Dashboard" : activePage;

  if (!isAuthenticated) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#f5f6fb",
          fontFamily: "inherit",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            width: "100%",
            maxWidth: "420px",
            boxSizing: "border-box",
            padding: "36px",
            borderRadius: "20px",
            background: "#ffffff",
            boxShadow: "0 18px 55px rgba(26, 32, 64, 0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                display: "grid",
                placeItems: "center",
                borderRadius: "14px",
                background: "#6257e8",
                color: "white",
                fontSize: "25px",
                fontWeight: 800,
              }}
            >
              N
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "25px", color: "#171a2b" }}>NovaCRM</h1>
              <p style={{ margin: "4px 0 0", fontSize: "11px", letterSpacing: "1.5px", color: "#777b91" }}>
                ADMIN ACCESS
              </p>
            </div>
          </div>

          <h2 style={{ margin: "0 0 8px", color: "#171a2b" }}>Welcome back</h2>
          <p style={{ margin: "0 0 24px", color: "#777b91", lineHeight: 1.5 }}>
            Sign in to manage your leads and follow-ups.
          </p>

          {loginError && (
            <div role="alert" style={{ marginBottom: "16px", padding: "12px", borderRadius: "8px", background: "#fff0f0", color: "#b42318", fontSize: "14px" }}>
              {loginError}
            </div>
          )}

          <label style={{ display: "block", marginBottom: "16px", color: "#383b50", fontSize: "14px", fontWeight: 600 }}>
            Admin email
            <input
              type="email"
              autoComplete="username"
              required
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder="admin@example.com"
              style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: "8px", padding: "13px 14px", border: "1px solid #dfe1eb", borderRadius: "9px", font: "inherit" }}
            />
          </label>

          <label style={{ display: "block", marginBottom: "22px", color: "#383b50", fontSize: "14px", fontWeight: 600 }}>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              placeholder="Enter your admin password"
              style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: "8px", padding: "13px 14px", border: "1px solid #dfe1eb", borderRadius: "9px", font: "inherit" }}
            />
          </label>

          <button
            type="submit"
            disabled={loginLoading}
            style={{ width: "100%", padding: "14px", border: 0, borderRadius: "9px", background: "#6257e8", color: "white", fontSize: "15px", fontWeight: 700, cursor: loginLoading ? "wait" : "pointer", opacity: loginLoading ? 0.75 : 1 }}
          >
            {loginLoading ? "Signing in…" : "Sign in to NovaCRM"}
          </button>
          <p style={{ margin: "20px 0 0", textAlign: "center", color: "#9295a7", fontSize: "12px" }}>
            Secure administrator sign-in
          </p>
        </form>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">N</div>
          <div>
            <h2>NovaCRM</h2>
            <span>LEAD MANAGEMENT</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav className="navigation">
          {[
            { name: "Dashboard", icon: "▦" },
            { name: "Leads", icon: "♙" },
            { name: "Follow-ups", icon: "◷" },
          ].map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
              {item.name === "Leads" && (
                <span className="nav-count">{leads.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">✧</div>
            <strong>Need some help?</strong>
            <p>Manage your leads and grow your business.</p>
          </div>

          <div className="profile">
            <div className="avatar">A</div>
            <div className="profile-info">
              <strong>Admin User</strong>
              <span>Administrator</span>
            </div>
            <span className="profile-menu">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{pageTitle}</strong>
          </div>

          <div className="topbar-right">
            <span className="today-label">Lead overview</span>
            <div className="avatar top-avatar">A</div>
            <button
              type="button"
              onClick={handleLogout}
              style={{ marginLeft: "12px", padding: "9px 13px", border: "1px solid #dedfec", borderRadius: "8px", background: "#fff", color: "#45465b", fontWeight: 600, cursor: "pointer" }}
            >
              Log out
            </button>
          </div>
        </header>

        <section className="page-content">
          {error && (
            <div
              role="alert"
              style={{ color: "#b91c1c", marginBottom: "16px" }}
            >
              {error}
            </div>
          )}

          {loading && (
            <p role="status" style={{ marginBottom: "16px" }}>
              Loading leads...
            </p>
          )}
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR BUSINESS AT A GLANCE</div>
              <h1>{pageTitle}</h1>
              <p className="subtitle">
                Track your leads, nurture relationships, and grow your business.
              </p>
            </div>

            <button className="primary-button" onClick={openAddForm}>
              <span>＋</span> Add New Lead
            </button>
          </div>

          <div className="stats-grid">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <div className="stat-top">
                  <span className="stat-label">{stat.label}</span>
                  <div className={`stat-icon ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-footer">
                  <span className="stat-dot"></span>
                  Updated from your lead records
                </div>
              </div>
            ))}
          </div>

          {activePage === "Dashboard" && (
            <section className="welcome-banner">
              <div>
                <span className="banner-tag">YOUR SALES PIPELINE</span>
                <h2>Every great customer starts with a conversation.</h2>
                <p>
                  Keep track of every opportunity and never miss a follow-up.
                </p>
              </div>
              <div className="banner-art" aria-hidden="true">
                <div className="art-circle circle-one"></div>
                <div className="art-circle circle-two"></div>
                <div className="art-card">
                  <span>Conversion overview</span>
                  <strong>
                    {leads.length
                      ? Math.round(
                          (leads.filter(
                            (lead) => lead.status === "Converted"
                          ).length /
                            leads.length) *
                            100
                        )
                      : 0}
                    %
                  </strong>
                  <div className="art-progress">
                    <span
                      style={{
                        width: `${
                          leads.length
                            ? (leads.filter(
                                (lead) => lead.status === "Converted"
                              ).length /
                                leads.length) *
                              100
                            : 0
                        }%`,
                      }}
                    ></span>
                  </div>
                  <small>Lead conversion rate</small>
                </div>
              </div>
            </section>
          )}

          {activePage === "Follow-ups" ? (
            <section className="table-card">
              <div className="table-heading">
                <div>
                  <h2>Upcoming Follow-ups</h2>
                  <p>Review scheduled customer follow-ups.</p>
                </div>
              </div>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>CLIENT</th>
                      <th>EMAIL</th>
                      <th>FOLLOW-UP DATE</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads
                      .filter((lead) => lead.followUp)
                      .sort((a, b) =>
                        a.followUp.localeCompare(b.followUp)
                      )
                      .map((lead) => (
                        <tr key={lead.id}>
                          <td>
                            <strong>{lead.name}</strong>
                          </td>
                          <td>{lead.email}</td>
                          <td>{lead.followUp}</td>
                          <td>
                            <span
                              className={`status-badge ${lead.status.toLowerCase()}`}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="action-button"
                              onClick={() => setSelectedLead(lead)}
                            >
                              View
                            </button>
                            <button
                              className="action-button"
                              onClick={() => openEditForm(lead)}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <section className="table-card">
              <div className="table-heading">
                <div>
                  <h2>{activePage === "Leads" ? "All Leads" : "Lead Overview"}</h2>
                  <p>Manage your contacts and track every opportunity.</p>
                </div>
                <span className="record-count">
                  {filteredLeads.length} records
                </span>
              </div>

              <div className="table-toolbar">
                <div className="search-box">
                  <span>⌕</span>
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <select
                  aria-label="Filter leads by status"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="filter-select"
                >
                  <option value="All">All statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>

              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>CLIENT</th>
                      <th>SOURCE</th>
                      <th>STATUS</th>
                      <th>FOLLOW-UP</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <div className="client-cell">
                            <div
                              className={`client-avatar avatar-${Number.parseInt(String(lead.id).slice(-1), 16) % 4}`}
                            >
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong>{lead.name}</strong>
                              <span>{lead.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="source-label">
                            {lead.source}
                          </span>
                        </td>
                        <td>
                          <select
                            aria-label={`Status for ${lead.name}`}
                            className={`status-select ${lead.status.toLowerCase()}`}
                            value={lead.status}
                            onChange={(event) =>
                              updateStatus(lead.id, event.target.value)
                            }
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Converted">Converted</option>
                          </select>
                        </td>
                        <td>
                          {lead.followUp || "Not scheduled"}
                        </td>
                        <td>
                          <button
                            className="action-button"
                            onClick={() => setSelectedLead(lead)}
                          >
                            View
                          </button>
                          <button
                            className="action-button"
                            onClick={() => openEditForm(lead)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => deleteLead(lead.id)}
                            aria-label={`Delete ${lead.name}`}
                            title="Delete lead"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredLeads.length === 0 && (
                      <tr>
                        <td colSpan="5" className="empty-state">
                          No leads found. Try another search or add a lead.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                <span>
                  Showing {filteredLeads.length} of {leads.length} leads
                </span>
                <span className="footer-note">
                  <span className="online-dot"></span> CRM workspace
                </span>
              </div>
            </section>
          )}

          <footer className="page-footer">
            <span>NovaCRM · Client Lead Management System</span>
            <span>Built for Future Interns · Task 2</span>
          </footer>
        </section>
      </main>

      {showForm && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <form className="lead-form" onSubmit={handleSubmit}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">LEAD MANAGEMENT</span>
                <h2>{editingId !== null ? "Edit Lead" : "Add New Lead"}</h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <label>
              Client name *
              <input
                required
                maxLength="100"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Enter client name"
              />
            </label>

            <label>
              Email address *
              <input
                type="email"
                required
                maxLength="254"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                placeholder="client@example.com"
              />
            </label>

            <div className="form-row">
              <label>
                Lead source
                <select
                  value={form.source}
                  onChange={(event) =>
                    setForm({ ...form, source: event.target.value })
                  }
                >
                  <option>Website</option>
                  <option>LinkedIn</option>
                  <option>Referral</option>
                  <option>Advertisement</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                >
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Converted</option>
                </select>
              </label>
            </div>

            <label>
              Follow-up date
              <input
                type="date"
                value={form.followUp}
                onChange={(event) =>
                  setForm({ ...form, followUp: event.target.value })
                }
              />
            </label>

            <label>
              Notes
              <textarea
                rows="3"
                maxLength="2000"
                value={form.notes}
                onChange={(event) =>
                  setForm({ ...form, notes: event.target.value })
                }
                placeholder="Add notes about this lead..."
              />
            </label>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="primary-button">
                {editingId !== null ? "Save Changes" : "Create Lead"}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedLead && (
        <div className="modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedLead(null);
        }}>
          <div className="lead-form detail-modal">
            <div className="modal-heading">
              <div>
                <span className="eyebrow">CLIENT DETAILS</span>
                <h2>{selectedLead.name}</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setSelectedLead(null)}
              >
                ×
              </button>
            </div>

            <div className="detail-item">
              <span>Email</span>
              <strong>{selectedLead.email}</strong>
            </div>
            <div className="detail-item">
              <span>Source</span>
              <strong>{selectedLead.source}</strong>
            </div>
            <div className="detail-item">
              <span>Status</span>
              <strong>{selectedLead.status}</strong>
            </div>
            <div className="detail-item">
              <span>Created</span>
              <strong>{selectedLead.date}</strong>
            </div>
            <div className="detail-item">
              <span>Follow-up</span>
              <strong>{selectedLead.followUp || "Not scheduled"}</strong>
            </div>
            <div className="detail-notes">
              <span>Notes</span>
              <p>{selectedLead.notes || "No notes added yet."}</p>
            </div>

            <button
              className="primary-button full-button"
              onClick={() => {
                const lead = selectedLead;
                setSelectedLead(null);
                openEditForm(lead);
              }}
            >
              Edit Lead
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
