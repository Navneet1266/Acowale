import { BarChart3, LayoutGrid, MessageSquare, Settings, Users } from "lucide-react";

export const NAV_ITEMS = [
  { label: "Overview", icon: LayoutGrid, to: "/admin" },
  { label: "Feedback", icon: MessageSquare, to: "/admin/feedback" },
  { label: "Analytics", icon: BarChart3, to: "/admin/analytics" },
  { label: "Users", icon: Users, to: "/admin/users" },
  { label: "Settings", icon: Settings, to: "/admin/settings" },
];
