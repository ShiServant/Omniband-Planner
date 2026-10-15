export type ProjectStatus =
  | "planning"
  | "in_progress"
  | "completed"
  | "archived";

export type ProjectHealth = "on_track" | "at_risk" | "blocked";

export type TaskStatus = "in_progress" | "done";

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
  nextStep: string | null;
  nextMilestone: string | null;
  dueDate: string | null;
  startDate: string | null;
  blocker: string | null;
  currentUpdate: string | null;
  createdAt: string;
  updatedAt: string;
  includeEveryone: boolean;
  members: Array<NamedRef & { active: boolean }>;
};

export type TaskFilters = {
  personId?: string;
  projectId?: string;
  status?: TaskStatus | "all";
  priority?: TaskPriority;
};

export type TaskSummary = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  important: boolean;
  dueDate: string | null;
  project: NamedRef;
  responsibles: NamedRef[];
  sourceMeeting: { id: string; title: string } | null;
  files: Attachment[];
};

export type ProjectDetail = Omit<ProjectSummary, "members"> & {
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
  files: Attachment[];
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
};

export type Attachment = {
  id: string;
  fileName: string;
};

export type MeetingFile = Attachment;

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

export type UpcomingItem = {
  id: string;
  projectId: string;
  taskId?: string;
  title: string;
  detail: string;
  dueDate: string;
  overdue: boolean;
};

export type CalendarEntry = {
  date: string;
  kind: "deadline" | "project";
  title: string;
  detail: string;
};

export type DashboardData = {
  today: string;
  activeProjects: ProjectSummary[];
  upcoming: UpcomingItem[];
  tasks: TaskSummary[];
  calendar: CalendarEntry[];
};
