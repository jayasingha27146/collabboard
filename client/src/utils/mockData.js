export const demoUser = {
  id: "u1",
  fullName: "Nadeesha Fernando",
  email: "nadeesha@student.edu",
  role: "Group Admin",
  avatar: "NF",
};

export const members = [
  demoUser,
  {
    id: "u2",
    fullName: "Ishan Perera",
    email: "ishan@student.edu",
    role: "Member",
    avatar: "IP",
  },
  {
    id: "u3",
    fullName: "Kavindi Silva",
    email: "kavindi@student.edu",
    role: "Member",
    avatar: "KS",
  },
];

export const groups = [
  {
    id: "g1",
    name: "Database Systems Group",
    description: "Weekly prep for ER modeling and SQL assignments.",
    memberCount: 5,
    activeTasks: 4,
    owner: "Nadeesha Fernando",
  },
  {
    id: "g2",
    name: "Software Engineering Team",
    description: "Sprint planning and architecture discussions.",
    memberCount: 7,
    activeTasks: 6,
    owner: "Ishan Perera",
  },
  {
    id: "g3",
    name: "AI Project Circle",
    description: "Research, presentations, and paper reviews.",
    memberCount: 4,
    activeTasks: 2,
    owner: "Kavindi Silva",
  },
];

export const tasks = [
  {
    id: "t1",
    title: "Prepare normalization notes",
    description: "Summarize 1NF to BCNF with practical examples.",
    groupId: "g1",
    groupName: "Database Systems Group",
    assigneeId: "u2",
    assigneeName: "Ishan Perera",
    assigneeAvatar: "IP",
    priority: "High",
    status: "To Do",
    deadline: "2026-08-21T18:00:00.000Z",
    createdAt: "2026-08-16T10:00:00.000Z",
    updatedAt: "2026-08-17T08:10:00.000Z",
  },
  {
    id: "t2",
    title: "Design API endpoint list",
    description: "List REST endpoints needed for planner backend.",
    groupId: "g2",
    groupName: "Software Engineering Team",
    assigneeId: "u1",
    assigneeName: "Nadeesha Fernando",
    assigneeAvatar: "NF",
    priority: "Medium",
    status: "Doing",
    deadline: "2026-08-20T12:00:00.000Z",
    createdAt: "2026-08-15T15:00:00.000Z",
    updatedAt: "2026-08-18T08:45:00.000Z",
  },
  {
    id: "t3",
    title: "Submit testing report draft",
    description: "Provide functional test cases and expected outputs.",
    groupId: "g2",
    groupName: "Software Engineering Team",
    assigneeId: "u3",
    assigneeName: "Kavindi Silva",
    assigneeAvatar: "KS",
    priority: "Low",
    status: "Done",
    deadline: "2026-08-17T10:00:00.000Z",
    createdAt: "2026-08-12T11:00:00.000Z",
    updatedAt: "2026-08-17T09:10:00.000Z",
  },
  {
    id: "t4",
    title: "Review literature summary",
    description: "Compile citation list for AI project proposal.",
    groupId: "g3",
    groupName: "AI Project Circle",
    assigneeId: "u1",
    assigneeName: "Nadeesha Fernando",
    assigneeAvatar: "NF",
    priority: "High",
    status: "To Do",
    deadline: "2026-08-19T08:30:00.000Z",
    createdAt: "2026-08-17T06:30:00.000Z",
    updatedAt: "2026-08-17T07:00:00.000Z",
  },
];

export const activities = [
  {
    id: "a1",
    message: "Ishan created a new task in Database Systems Group.",
    time: "20 minutes ago",
  },
  {
    id: "a2",
    message: "Nadeesha assigned Design API endpoint list to self.",
    time: "1 hour ago",
  },
  {
    id: "a3",
    message: "Kavindi moved Submit testing report draft to Done.",
    time: "4 hours ago",
  },
  {
    id: "a4",
    message: "Malith joined Software Engineering Team.",
    time: "Yesterday",
  },
];

export const notifications = [
  {
    id: "n1",
    text: "You have been assigned a new task.",
    type: "assignment",
    isRead: false,
    time: "5m ago",
  },
  {
    id: "n2",
    text: "Your task status was changed.",
    type: "status",
    isRead: false,
    time: "1h ago",
  },
  {
    id: "n3",
    text: "A new member joined your group.",
    type: "member",
    isRead: true,
    time: "3h ago",
  },
  {
    id: "n4",
    text: "Your task deadline is approaching.",
    type: "deadline",
    isRead: true,
    time: "Yesterday",
  },
];

export const taskComments = {
  t1: [
    {
      id: "c1",
      author: "Nadeesha Fernando",
      text: "Please add one worked example for BCNF decomposition.",
      createdAt: "2026-08-18T07:30:00.000Z",
    },
  ],
  t2: [
    {
      id: "c2",
      author: "Ishan Perera",
      text: "Include auth, groups, tasks, notifications routes.",
      createdAt: "2026-08-18T06:00:00.000Z",
    },
  ],
};
