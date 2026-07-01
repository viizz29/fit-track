import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HistoryIcon from "@mui/icons-material/History";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

import { SidebarHeader } from "./sidebar-header-component";
import { SidebarMenuItem } from "./sidebar-menu-item";
import { Header } from "./header-component";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/use-auth";

const drawerWidth = 240;

const PageLayout = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();
  const { logout } = useAuth();

  const toggleSidebar = () => setMobileOpen((prev) => !prev);
  const { pathname } = useLocation();

  const pageConfig: Record<string, { title: string; subtitle: string }> = {
    "/dashboard": { title: "Dashboard", subtitle: "Overview of your activity" },
    "/exercises": { title: "Exercises", subtitle: "Manage your exercise library" },
    "/exercises/create": { title: "New Exercise", subtitle: "Add an exercise to your library" },
    "/schedules": { title: "Schedules", subtitle: "Manage your workout schedules" },
    "/schedules/create": { title: "New Schedule", subtitle: "Create a workout schedule" },
    "/scheduled-tasks": { title: "Today's Tasks", subtitle: "View and complete your tasks" },
    "/completions": { title: "Completions", subtitle: "History of completed exercises" },
    "/reports": { title: "Reports", subtitle: "Analytics and insights" },
    "/profile": { title: "Profile", subtitle: "Your account and preferences" },
  };

  const currentPage = useMemo(() => {
    const exact = pageConfig[pathname];
    if (exact) return exact;
    if (pathname.startsWith("/exercises/edit/")) return pageConfig["/exercises"];
    if (pathname.startsWith("/schedules/edit/")) return pageConfig["/schedules"];
    return { title: "FitTrack", subtitle: "" };
  }, [pathname]);

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    { label: "Exercises", path: "/exercises", icon: <FitnessCenterIcon /> },
    { label: "Schedules", path: "/schedules", icon: <CalendarMonthIcon /> },
    { label: "Today's Tasks", path: "/scheduled-tasks", icon: <TaskAltIcon /> },
    { label: "Completions", path: "/completions", icon: <HistoryIcon /> },
    { label: "Reports", path: "/reports", icon: <AssessmentIcon /> },
    { label: "Profile", path: "/profile", icon: <PersonIcon /> },
  ];

  const sidebarContent = (
    <Box display="flex" flexDirection="column" height="100%">
      <SidebarHeader isSidebarOpen={isDesktop || mobileOpen} toggleSidebar={toggleSidebar} showClose={!isDesktop} />

      <List sx={{ flex: 1, px: 1 }}>
        {menuItems.map((item) => (
          <SidebarMenuItem
            key={item.path}
            icon={item.icon}
            path={item.path}
            onClick={isDesktop ? undefined : toggleSidebar}
          >
            {t(item.label)}
          </SidebarMenuItem>
        ))}
      </List>

      <Divider />
      <List sx={{ px: 1 }}>
        <ListItemButton onClick={() => { logout(); if (!isDesktop) toggleSidebar(); }}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary={t("logout")} />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
      {/* Mobile drawer (temporary overlay) */}
      <Drawer
        variant="temporary"
        open={!isDesktop && mobileOpen}
        onClose={toggleSidebar}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop drawer (persistent) */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {sidebarContent}
      </Drawer>

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          ml: { md: `${drawerWidth}px` },
        }}
      >

        <Box
          sx={{

            m: 1,

          }}
        >
          <Header isSidebarOpen={isDesktop || mobileOpen} toggleSidebar={toggleSidebar} title={currentPage.title} subtitle={currentPage.subtitle} />
        </Box>


        <Box
          component="main"
          sx={{
            flexGrow: 1,
            m: 2,
            bgcolor: "background.paper",
            boxShadow: 1,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default PageLayout;
