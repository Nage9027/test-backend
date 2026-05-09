import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../state/AuthContext";
import { ThemeContext } from "../state/ThemeContext";
import { useToast } from "../hooks/useToast";
import "./DashboardPage.css";

/* ------------------------------------------------------------------ */
/*  Inline SVG icon set                                                 */
/* ------------------------------------------------------------------ */
const Icons = {
  Logo: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="dash-logo" x1="0" y1="0" x2="28" y2="28">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect width="28" height="28" rx="8" fill="url(#dash-logo)" />
      <path d="M8 14L12 18L20 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  Projects: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Tasks: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  Team: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Analytics: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Sun: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  Moon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7l4 4 6-6" />
    </svg>
  ),
  Alert: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Calendar: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Folder: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Clock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */
const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const STATUS_CONFIG = {
  TODO: { label: "To Do", color: "#64748B" },
  IN_PROGRESS: { label: "In Progress", color: "#3B82F6" },
  DONE: { label: "Done", color: "#10B981" },
};

const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "#10B981", bg: "rgba(16, 185, 129, 0.12)" },
  MEDIUM: { label: "Medium", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.12)" },
  HIGH: { label: "High", color: "#EF4444", bg: "rgba(239, 68, 68, 0.12)" },
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Icons.Dashboard },
  { id: "projects", label: "Projects", icon: Icons.Projects },
  { id: "tasks", label: "Tasks", icon: Icons.Tasks },
  { id: "team", label: "Team", icon: Icons.Team },
  { id: "analytics", label: "Analytics", icon: Icons.Analytics },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isOverdue = (task) => {
  if (!task.dueDate) return false;
  if (task.status === "DONE") return false;
  return new Date(task.dueDate) < new Date();
};

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  /* ------- state ------- */
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState({ projects: true, tasks: false, dashboard: true });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    assignedToId: "",
  });
  const [memberEmail, setMemberEmail] = useState("");

  const [submitting, setSubmitting] = useState({ project: false, task: false, member: false });

  /* ------- refs for sidebar smooth scroll ------- */
  const dashboardSectionRef = useRef(null);
  const projectsSectionRef = useRef(null);
  const tasksSectionRef = useRef(null);
  const teamSectionRef = useRef(null);
  const analyticsSectionRef = useRef(null);

  /* ------- derived data ------- */
  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId],
  );

  const myMembership = useMemo(
    () => selectedProject?.members?.find((m) => m.userId === user?.id) || null,
    [selectedProject, user?.id],
  );

  const isProjectAdmin = myMembership?.role === "ADMIN";

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        !q ||
        task.title?.toLowerCase().includes(q) ||
        task.description?.toLowerCase().includes(q);
      const matchesStatus = filterStatus === "ALL" || task.status === filterStatus;
      const matchesPriority = filterPriority === "ALL" || task.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  const tasksByStatus = useMemo(
    () =>
      STATUSES.reduce((acc, status) => {
        acc[status] = filteredTasks.filter((t) => t.status === status);
        return acc;
      }, {}),
    [filteredTasks],
  );

  /* ------- helpers ------- */
  const handleApiError = (err, fallback = "Request failed. Please try again.") => {
    const msg = err?.response?.data?.message || fallback;
    showToast(msg, "error");
    return msg;
  };

  /* ------- data loaders ------- */
  const loadProjects = useCallback(async () => {
    setLoading((l) => ({ ...l, projects: true }));
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
      setSelectedProjectId((curr) => {
        if (curr && data.some((p) => p.id === curr)) return curr;
        return data[0]?.id || "";
      });
    } catch (err) {
      handleApiError(err, "Could not load projects");
    } finally {
      setLoading((l) => ({ ...l, projects: false }));
    }
  }, []);

  const loadTasks = useCallback(async (projectId) => {
    if (!projectId) {
      setTasks([]);
      return;
    }
    setLoading((l) => ({ ...l, tasks: true }));
    try {
      const { data } = await api.get(`/projects/${projectId}/tasks`);
      setTasks(data);
    } catch (err) {
      handleApiError(err, "Could not load tasks");
    } finally {
      setLoading((l) => ({ ...l, tasks: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading((l) => ({ ...l, dashboard: true }));
    try {
      const { data } = await api.get("/dashboard");
      setDashboard(data);
    } catch (err) {
      handleApiError(err, "Could not load dashboard metrics");
    } finally {
      setLoading((l) => ({ ...l, dashboard: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------- effects ------- */
  useEffect(() => {
    loadProjects();
    loadDashboard();
  }, [loadProjects, loadDashboard]);

  useEffect(() => {
    if (selectedProjectId) loadTasks(selectedProjectId);
  }, [selectedProjectId, loadTasks]);

  /* ------- handlers ------- */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavChange = (id) => {
    setActiveNav(id);
    setSidebarOpen(false);
    const map = {
      dashboard: dashboardSectionRef,
      projects: projectsSectionRef,
      tasks: tasksSectionRef,
      team: teamSectionRef,
      analytics: analyticsSectionRef,
    };
    const target = map[id]?.current;
    if (target) {
      requestAnimationFrame(() =>
        target.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectForm.name.trim()) {
      showToast("Project name is required", "error");
      return;
    }
    setSubmitting((s) => ({ ...s, project: true }));
    try {
      const { data } = await api.post("/projects", {
        name: projectForm.name.trim(),
        description: projectForm.description.trim() || undefined,
      });
      setProjectForm({ name: "", description: "" });
      setShowProjectModal(false);
      showToast("Project created successfully", "success");
      await loadProjects();
      await loadDashboard();
      setSelectedProjectId(data.id);
    } catch (err) {
      handleApiError(err, "Could not create project");
    } finally {
      setSubmitting((s) => ({ ...s, project: false }));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      showToast("Please select a project first", "error");
      return;
    }
    if (!taskForm.title.trim()) {
      showToast("Task title is required", "error");
      return;
    }
    setSubmitting((s) => ({ ...s, task: true }));
    try {
      await api.post(`/projects/${selectedProjectId}/tasks`, {
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || undefined,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined,
        assignedToId: taskForm.assignedToId || undefined,
      });
      setTaskForm({ title: "", description: "", priority: "MEDIUM", dueDate: "", assignedToId: "" });
      setShowTaskModal(false);
      showToast("Task created successfully", "success");
      await loadTasks(selectedProjectId);
      await loadDashboard();
    } catch (err) {
      handleApiError(err, "Could not create task");
    } finally {
      setSubmitting((s) => ({ ...s, task: false }));
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      showToast("Please select a project first", "error");
      return;
    }
    if (!memberEmail.trim()) {
      showToast("Member email is required", "error");
      return;
    }
    setSubmitting((s) => ({ ...s, member: true }));
    try {
      await api.post(`/projects/${selectedProjectId}/members`, {
        email: memberEmail.trim().toLowerCase(),
        role: "MEMBER",
      });
      setMemberEmail("");
      setShowMemberModal(false);
      showToast("Member added successfully", "success");
      await loadProjects();
    } catch (err) {
      handleApiError(err, "Could not add member");
    } finally {
      setSubmitting((s) => ({ ...s, member: false }));
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!window.confirm("Remove this member from the project?")) return;
    try {
      await api.delete(`/projects/${selectedProjectId}/members/${memberUserId}`);
      showToast("Member removed", "success");
      await loadProjects();
    } catch (err) {
      handleApiError(err, "Could not remove member");
    }
  };

  const handleTaskStatusChange = async (taskId, status) => {
    try {
      await api.patch(`/projects/${selectedProjectId}/tasks/${taskId}`, { status });
      await loadTasks(selectedProjectId);
      await loadDashboard();
    } catch (err) {
      handleApiError(err, "Could not update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    try {
      await api.delete(`/projects/${selectedProjectId}/tasks/${taskId}`);
      showToast("Task deleted", "success");
      await loadTasks(selectedProjectId);
      await loadDashboard();
    } catch (err) {
      handleApiError(err, "Could not delete task");
    }
  };

  /* ------- DnD ------- */
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("dragging");
  };
  const handleDragEnd = (e) => e.currentTarget.classList.remove("dragging");
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add("drag-over");
  };
  const handleDragLeave = (e) => e.currentTarget.classList.remove("drag-over");
  const handleDrop = async (e, status) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;
    await handleTaskStatusChange(taskId, status);
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <div className="dashboard-layout" data-theme={theme}>
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* ---------- Sidebar ---------- */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Icons.Logo />
            <span>TaskFlow</span>
          </div>
          <button
            type="button"
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <Icons.Close />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => handleNavChange(item.id)}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini">
            <div className="user-avatar">{getInitials(user?.name)}</div>
            <div className="user-info">
              <span className="user-name">{user?.name || "Member"}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button type="button" className="nav-item logout-btn" onClick={handleLogout}>
            <Icons.Logout />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ---------- Main ---------- */}
      <div className="main-content">
        {/* Top header */}
        <header className="top-header">
          <div className="header-left">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Icons.Menu />
            </button>
            <div className="breadcrumb">
              <span className="crumb">Workspace</span>
              <span className="crumb-sep">/</span>
              <select
                className="project-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                aria-label="Select project"
              >
                {projects.length === 0 && <option value="">No projects yet</option>}
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="header-right">
            <div className="search-box">
              <Icons.Search />
              <input
                type="search"
                placeholder="Search tasks…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search tasks"
              />
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title="Toggle theme"
            >
              {theme === "dark" ? <Icons.Sun /> : <Icons.Moon />}
            </button>
            <div className="user-avatar user-avatar-lg" title={user?.name}>
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

        {/* Welcome */}
        <section className="welcome-section" ref={dashboardSectionRef}>
          <div>
            <h1 className="welcome-title">Welcome back, {user?.name?.split(" ")[0] || "there"}.</h1>
            <p className="welcome-subtitle">
              Here's a snapshot of your team's progress
              {selectedProject ? ` on ${selectedProject.name}` : ""}.
            </p>
          </div>
          <div className="welcome-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowProjectModal(true)}
            >
              <Icons.Plus /> New project
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowTaskModal(true)}
              disabled={!selectedProjectId || !isProjectAdmin}
              title={
                !selectedProjectId
                  ? "Select a project first"
                  : !isProjectAdmin
                    ? "Only project admins can create tasks"
                    : "Create a task"
              }
            >
              <Icons.Plus /> New task
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="stats-grid" ref={analyticsSectionRef}>
          {[
            { label: "Total tasks", value: dashboard?.totalTasks ?? 0, color: "#6366F1", Icon: Icons.Tasks },
            { label: "To do", value: dashboard?.byStatus?.TODO ?? 0, color: "#64748B", Icon: Icons.Clock },
            { label: "In progress", value: dashboard?.byStatus?.IN_PROGRESS ?? 0, color: "#3B82F6", Icon: Icons.Analytics },
            { label: "Done", value: dashboard?.byStatus?.DONE ?? 0, color: "#10B981", Icon: Icons.Check },
            { label: "Overdue", value: dashboard?.overdueTasks ?? 0, color: "#EF4444", Icon: Icons.Alert },
          ].map((stat) => (
            <div className="stat-card" key={stat.label}>
              <div className="stat-icon" style={{ background: `${stat.color}1f`, color: stat.color }}>
                <stat.Icon />
              </div>
              <div className="stat-content">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">{loading.dashboard ? "…" : stat.value}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Main grid */}
        <section className="dashboard-grid">
          <div className="column-left">
            {/* Projects card */}
            <div
              className={`card ${activeNav === "projects" ? "section-focused" : ""}`}
              ref={projectsSectionRef}
            >
              <div className="card-header">
                <div>
                  <h3>Projects</h3>
                  <p className="card-subtitle">{projects.length} total</p>
                </div>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => setShowProjectModal(true)}
                  aria-label="Create project"
                  title="New project"
                >
                  <Icons.Plus />
                </button>
              </div>

              {loading.projects ? (
                <Skeleton lines={3} />
              ) : projects.length === 0 ? (
                <EmptyState
                  icon={<Icons.Folder />}
                  title="No projects yet"
                  description="Create your first project to start collaborating."
                  action={
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setShowProjectModal(true)}
                    >
                      <Icons.Plus /> Create project
                    </button>
                  }
                />
              ) : (
                <ul className="project-list">
                  {projects.map((p) => (
                    <li
                      key={p.id}
                      className={`project-item ${p.id === selectedProjectId ? "active" : ""}`}
                      onClick={() => setSelectedProjectId(p.id)}
                    >
                      <div className="project-bullet" aria-hidden="true" />
                      <div className="project-text">
                        <span className="project-name">{p.name}</span>
                        <span className="project-meta">
                          {p.members?.length || 0} member
                          {(p.members?.length || 0) === 1 ? "" : "s"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Team card */}
            <div
              className={`card ${activeNav === "team" ? "section-focused" : ""}`}
              ref={teamSectionRef}
            >
              <div className="card-header">
                <div>
                  <h3>Team</h3>
                  <p className="card-subtitle">
                    {selectedProject?.members?.length || 0} member
                    {(selectedProject?.members?.length || 0) === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => setShowMemberModal(true)}
                  disabled={!selectedProjectId || !isProjectAdmin}
                  aria-label="Add member"
                  title={
                    !selectedProjectId
                      ? "Select a project first"
                      : !isProjectAdmin
                        ? "Only admins can add members"
                        : "Add member"
                  }
                >
                  <Icons.Plus />
                </button>
              </div>

              {!selectedProject ? (
                <EmptyState title="No project selected" description="Pick a project to manage its team." />
              ) : selectedProject.members?.length ? (
                <ul className="member-list">
                  {selectedProject.members.map((m) => (
                    <li key={m.id} className="member-item">
                      <div className="member-avatar">{getInitials(m.user?.name)}</div>
                      <div className="member-info">
                        <div>
                          <span className="member-name">{m.user?.name}</span>
                          <span className="member-email">{m.user?.email}</span>
                        </div>
                        <div className="member-actions">
                          <span className={`role-badge role-${m.role.toLowerCase()}`}>{m.role}</span>
                          {isProjectAdmin && m.userId !== user?.id && (
                            <button
                              type="button"
                              className="icon-btn icon-btn-danger"
                              onClick={() => handleRemoveMember(m.userId)}
                              aria-label={`Remove ${m.user?.name}`}
                              title="Remove member"
                            >
                              <Icons.Trash />
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No members yet" description="Add teammates by their email address." />
              )}
            </div>
          </div>

          {/* Right - kanban */}
          <div className="column-right">
            <div
              className={`card kanban-card ${activeNav === "tasks" ? "section-focused" : ""}`}
              ref={tasksSectionRef}
            >
              <div className="kanban-header">
                <div>
                  <h3>Task board</h3>
                  <p className="card-subtitle">
                    {filteredTasks.length} of {tasks.length} task{tasks.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="filters">
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="ALL">All statuses</option>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_CONFIG[s].label}
                      </option>
                    ))}
                  </select>
                  <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                    <option value="ALL">All priority</option>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_CONFIG[p].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!selectedProject ? (
                <EmptyState
                  icon={<Icons.Folder />}
                  title="No project selected"
                  description="Choose or create a project to see its tasks."
                />
              ) : (
                <div className="kanban-board">
                  {STATUSES.map((status) => (
                    <div
                      key={status}
                      className="kanban-column"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, status)}
                    >
                      <div
                        className="column-header"
                        style={{ borderTopColor: STATUS_CONFIG[status].color }}
                      >
                        <div className="column-title">
                          <span
                            className="column-dot"
                            style={{ background: STATUS_CONFIG[status].color }}
                            aria-hidden="true"
                          />
                          {STATUS_CONFIG[status].label}
                        </div>
                        <span className="column-count">{tasksByStatus[status]?.length || 0}</span>
                      </div>

                      <div className="column-tasks">
                        {loading.tasks ? (
                          <Skeleton lines={2} />
                        ) : (tasksByStatus[status] || []).length === 0 ? (
                          <div className="empty-column">Drop tasks here</div>
                        ) : (
                          tasksByStatus[status].map((task) => {
                            const overdue = isOverdue(task);
                            return (
                              <div
                                key={task.id}
                                className={`task-card ${overdue ? "overdue" : ""}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, task.id)}
                                onDragEnd={handleDragEnd}
                              >
                                <div className="task-header">
                                  <span
                                    className="priority-badge"
                                    style={{
                                      background: PRIORITY_CONFIG[task.priority].bg,
                                      color: PRIORITY_CONFIG[task.priority].color,
                                    }}
                                  >
                                    {PRIORITY_CONFIG[task.priority].label}
                                  </span>
                                  {task.dueDate && (
                                    <span className={`task-due ${overdue ? "overdue" : ""}`}>
                                      <Icons.Calendar /> {formatDate(task.dueDate)}
                                    </span>
                                  )}
                                </div>
                                <h4 className="task-title">{task.title}</h4>
                                {task.description && (
                                  <p className="task-desc">{task.description}</p>
                                )}
                                <div className="task-footer">
                                  {task.assignedTo ? (
                                    <div className="task-assignee" title={task.assignedTo.email}>
                                      <div className="avatar-small">
                                        {getInitials(task.assignedTo.name)}
                                      </div>
                                      <span>{task.assignedTo.name}</span>
                                    </div>
                                  ) : (
                                    <span className="task-assignee unassigned">Unassigned</span>
                                  )}

                                  <div className="task-controls">
                                    <select
                                      className="task-status-select"
                                      value={task.status}
                                      onChange={(e) =>
                                        handleTaskStatusChange(task.id, e.target.value)
                                      }
                                      aria-label="Update status"
                                    >
                                      {STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                          {STATUS_CONFIG[s].label}
                                        </option>
                                      ))}
                                    </select>
                                    {isProjectAdmin && (
                                      <button
                                        type="button"
                                        className="icon-btn icon-btn-danger"
                                        onClick={() => handleDeleteTask(task.id)}
                                        aria-label="Delete task"
                                        title="Delete task"
                                      >
                                        <Icons.Trash />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ---------- Modals ---------- */}
      {showProjectModal && (
        <Modal title="Create new project" onClose={() => setShowProjectModal(false)}>
          <form onSubmit={handleCreateProject} className="modal-form">
            <div className="form-group">
              <label htmlFor="project-name">Project name *</label>
              <input
                id="project-name"
                required
                placeholder="e.g. Website redesign"
                value={projectForm.name}
                onChange={(e) => setProjectForm((f) => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="project-desc">Description</label>
              <textarea
                id="project-desc"
                placeholder="What is this project about?"
                rows={3}
                value={projectForm.description}
                onChange={(e) => setProjectForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowProjectModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting.project}>
                {submitting.project ? "Creating…" : "Create project"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showTaskModal && (
        <Modal title="Create new task" onClose={() => setShowTaskModal(false)}>
          <form onSubmit={handleCreateTask} className="modal-form">
            <div className="form-group">
              <label htmlFor="task-title">Title *</label>
              <input
                id="task-title"
                required
                placeholder="What needs doing?"
                value={taskForm.title}
                onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="task-desc">Description</label>
              <textarea
                id="task-desc"
                placeholder="Add helpful context…"
                rows={3}
                value={taskForm.description}
                onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_CONFIG[p].label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="task-due">Due date</label>
                <input
                  id="task-due"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="task-assignee">Assign to</label>
              <select
                id="task-assignee"
                value={taskForm.assignedToId}
                onChange={(e) => setTaskForm((f) => ({ ...f, assignedToId: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {selectedProject?.members?.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowTaskModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!selectedProjectId || submitting.task}
              >
                {submitting.task ? "Creating…" : "Create task"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showMemberModal && (
        <Modal title="Add team member" onClose={() => setShowMemberModal(false)}>
          <form onSubmit={handleAddMember} className="modal-form">
            <p className="modal-hint">
              The teammate must already have a TaskFlow account before they can be added.
            </p>
            <div className="form-group">
              <label htmlFor="member-email">Member email *</label>
              <input
                id="member-email"
                type="email"
                required
                placeholder="member@company.com"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="member-role">Role</label>
              <select id="member-role" value="MEMBER" disabled>
                <option value="MEMBER">Member</option>
              </select>
              <small className="form-hint">
                New teammates join as members. Promote to admin from your team settings.
              </small>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowMemberModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!selectedProjectId || submitting.member}
              >
                {submitting.member ? "Adding…" : "Add member"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */
function Modal({ title, children, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icons.Close />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function Skeleton({ lines = 1 }) {
  return (
    <div className="skeleton-stack">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 14 + i * 6 }} />
      ))}
    </div>
  );
}

function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-icon">{icon}</div>}
      <h4>{title}</h4>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
