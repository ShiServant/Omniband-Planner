export type ProjectStatus =
  | "planning"
  | "in_progress"
  | "completed"
  | "archived";

export type ProjectHealth = "on_track" | "at_risk" | "blocked";

export type TaskStatus = "to_do" | "in_progress" | "blocked" | "done";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type NamedRef = {
  id: string;
  name: string;
};

export type ProjectSummary = {
  id: string;
  name: string;
  status: ProjectStatus;
  health: ProjectHealth | null;
  progress: number | null;
  lead: NamedRef;
  nextStep: string | null;
  nextMilestone: string | null;
  dueDate: string | null;
  startDate: string | null;
  blocker: string | null;
  currentUpdate: string | null;
  updatedAt: string;
};

export type TaskFilters = {
  personId?: string;
  projectId?: string;
  status?: TaskStatus | "outstanding" | "all";
  priority?: TaskPriority;
};

export type TaskSummary = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  project: NamedRef;
  responsible: NamedRef;
  sourceMeeting: { id: string; title: string } | null;
};

export type ProjectDetail = ProjectSummary & {
  description: string | null;
  objective: string | null;
  members: Array<NamedRef & { role: string; active: boolean }>;
  tasks: TaskSummary[];
  meetings: Array<{
    id: string;
    title: string;
    meetingDate: string;
    summary: string | null;
  }>;
  decisions: Array<{
    id: string;
    content: string;
    meeting: { id: string; title: string; meetingDate: string };
  }>;
};

export type MeetingSummary = {
  id: string;
  title: string;
  meetingDate: string;
  summary: string | null;
  projects: NamedRef[];
};

export type MeetingDetail = {
  id: string;
  title: string;
  meetingDate: string;
  summary: string | null;
  projects: NamedRef[];
  files: MeetingFile[];
  decisions: Array<{ id: string; content: string; project: NamedRef | null }>;
  tasks: TaskSummary[];
};

export type MeetingFile = {
  id: string;
  fileName: string;
};

export type PersonSummary = {
  id: string;
  name: string;
  societyRole: string | null;
  email: string | null;
  contactInfo: string | null;
  avatarUrl: string | null;
  active: boolean;
};

export type PersonProject = {
  id: string;
  name: string;
  status: ProjectStatus;
  health: ProjectHealth | null;
  role: string;
};

export type PersonDetail = PersonSummary & {
  projects: PersonProject[];
  tasks: TaskSummary[];
};

export type DecisionSummary = {
  id: string;
  content: string;
  createdAt: string;
  meeting: { id: string; title: string; meetingDate: string };
  project: NamedRef | null;
};

export type UpcomingItem = {
  id: string;
  projectId: string;
  taskId?: string;
  title: string;
  detail: string;
  dueDate: string;
  overdue: boolean;
};

export type DashboardData = {
  counts: {
    active: number;
    onTrack: number;
    needsAttention: number;
    blocked: number;
  };
  activeProjects: ProjectSummary[];
  attentionProjects: ProjectSummary[];
  upcoming: UpcomingItem[];
  importantTasks: TaskSummary[];
  recentDecisions: DecisionSummary[];
  recentProjects: ProjectSummary[];
};
