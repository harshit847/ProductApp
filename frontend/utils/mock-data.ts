// Mock data helps the UI look real on day one and keeps the pages useful during interviews.
import { Activity, Lead, StatCard, Task } from "./types";

export const stats: StatCard[] = [
  { label: "Total Revenue", value: "$128.4k", change: "+18.2%", trend: "up" },
  { label: "Active Leads", value: "248", change: "+12 today", trend: "up" },
  { label: "Closed Won", value: "74", change: "+6 this week", trend: "up" },
  { label: "Tasks Due", value: "19", change: "3 overdue", trend: "down" }
];

export const recentLeads: Lead[] = [
  {
    id: "lead_1",
    name: "Aarav Mehta",
    company: "Northstar Labs",
    email: "aarav@northstarlabs.com",
    phone: "+91 98765 43210",
    source: "Website",
    status: "QUALIFIED",
    priority: "HIGH",
    owner: "Priya Sharma",
    value: 12000,
    updatedAt: "2 hours ago",
    notes: "Requested pricing for annual plan."
  },
  {
    id: "lead_2",
    name: "Sofia Patel",
    company: "Bluebird Retail",
    email: "sofia@bluebirdretail.com",
    source: "LinkedIn",
    status: "CONTACTED",
    priority: "MEDIUM",
    owner: "Rahul Verma",
    value: 8400,
    updatedAt: "5 hours ago",
    notes: "Follow up after demo recording."
  },
  {
    id: "lead_3",
    name: "Daniel Kim",
    company: "Harbor Finance",
    email: "daniel@harborfinance.com",
    phone: "+1 415 555 0198",
    source: "Referral",
    status: "PROPOSAL",
    priority: "URGENT",
    owner: "Meera Joshi",
    value: 24000,
    updatedAt: "Yesterday",
    notes: "Legal review in progress."
  }
];

/** Extended lead set for the pipeline kanban — one or more per stage. */
export const pipelineLeads: Lead[] = [
  ...recentLeads,
  {
    id: "lead_p1",
    name: "Emma Wilson",
    company: "Brightside Health",
    email: "emma@brightsidehealth.com",
    source: "Website",
    status: "NEW",
    priority: "MEDIUM",
    owner: "Priya Sharma",
    value: 6200,
    updatedAt: "30 min ago"
  },
  {
    id: "lead_p2",
    name: "Liam Chen",
    company: "Atlas Logistics",
    email: "liam@atlaslogistics.com",
    source: "Referral",
    status: "NEW",
    priority: "LOW",
    owner: "Rahul Verma",
    value: 3800,
    updatedAt: "1 hour ago"
  },
  {
    id: "lead_p3",
    name: "Noah Gupta",
    company: "Pinnacle SaaS",
    email: "noah@pinnaclesaas.com",
    phone: "+1 212 555 0147",
    source: "LinkedIn",
    status: "WON",
    priority: "HIGH",
    owner: "Meera Joshi",
    value: 42000,
    updatedAt: "3 days ago"
  },
  {
    id: "lead_p4",
    name: "Olivia Brown",
    company: "Verde Energy",
    email: "olivia@verdeenergy.com",
    source: "Website",
    status: "WON",
    priority: "MEDIUM",
    owner: "Priya Sharma",
    value: 18500,
    updatedAt: "1 week ago"
  },
  {
    id: "lead_p5",
    name: "Ava Rodriguez",
    company: "NexGen Media",
    email: "ava@nexgenmedia.com",
    source: "Cold Outreach",
    status: "LOST",
    priority: "LOW",
    owner: "Rahul Verma",
    value: 5400,
    updatedAt: "2 weeks ago"
  },
  {
    id: "lead_p6",
    name: "James Park",
    company: "Summit Finance",
    email: "james@summitfinance.com",
    phone: "+44 20 7946 0958",
    source: "Referral",
    status: "LOST",
    priority: "MEDIUM",
    owner: "Meera Joshi",
    value: 15000,
    updatedAt: "10 days ago"
  },
  {
    id: "lead_p7",
    name: "Mia Tanaka",
    company: "CloudNine Tech",
    email: "mia@cloudninetech.com",
    source: "LinkedIn",
    status: "CONTACTED",
    priority: "HIGH",
    owner: "Priya Sharma",
    value: 21000,
    updatedAt: "4 hours ago"
  }
];

export const tasks: Task[] = [
  {
    id: "task_1",
    title: "Send proposal to Northstar Labs",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: "2026-07-12T11:00:00.000Z",
    assignee: "Priya Sharma"
  },
  {
    id: "task_2",
    title: "Call Bluebird Retail for discovery",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "2026-07-13T05:30:00.000Z",
    assignee: "Rahul Verma"
  },
  {
    id: "task_3",
    title: "Mark Harbor Finance as closed won",
    status: "DONE",
    priority: "LOW",
    dueDate: "2026-07-11T09:30:00.000Z",
    assignee: "Meera Joshi",
    completed: true
  }
];

/** Mock activities use the API-compatible ActivityType enum values. */
export const activities: Activity[] = [
  { id: "act_1", type: "LEAD_CREATED", message: "New lead captured from website form", createdAt: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: "act_2", type: "TASK_DONE", message: "Task completed by Priya Sharma", createdAt: new Date(Date.now() - 42 * 60000).toISOString() },
  { id: "act_3", type: "PROFILE_UPDATED", message: "Profile password updated successfully", createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: "act_4", type: "LEAD_UPDATED", message: "Weekly revenue snapshot refreshed", createdAt: new Date(new Date().setHours(9, 0, 0, 0)).toISOString() }
];

export const revenueSeries = [
  { month: "Jan", value: 24000 },
  { month: "Feb", value: 31000 },
  { month: "Mar", value: 28000 },
  { month: "Apr", value: 46000 },
  { month: "May", value: 52000 },
  { month: "Jun", value: 64000 }
];
