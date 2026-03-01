import {
  ChartBar,
  LayoutDashboard,
  type LucideIcon,
  Music,
  Music2,
  Users,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  roles?: Array<"admin" | "maintenancer">;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  roles?: Array<"admin" | "maintenancer">;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: ChartBar,
        roles: ["admin"],
      },
    ],
  },
  {
    id: 2,
    label: "Management",
    items: [
      {
        title: "Songs",
        url: "/dashboard/songs",
        icon: Music2,
      },
      {
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
        roles: ["admin"],
      },
    ],
  },
  {
    id: 3,
    label: "Content",
    items: [
      {
        title: "Tags",
        url: "/dashboard/tags",
        icon: Music,
        comingSoon: true,
      },
    ],
  },
];
