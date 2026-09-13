import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { AlertsProvider } from "./context/AlertsContext";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";

import {
  Home, Car, Users, Wallet, MessageSquareWarning, Megaphone,
  ShieldCheck, ScanLine, Grid3x3, BarChart3, FileClock,
  Package, UserCheck, CalendarClock, AlertOctagon, LogOut as MoveOutIcon,
  Landmark,
} from "lucide-react";

import ResidentDashboard from "./pages/resident/Dashboard";
import VehicleRegistration from "./pages/resident/VehicleRegistration";
import GuestApproval from "./pages/resident/GuestApproval";
import MaintenanceFees from "./pages/resident/MaintenanceFees";
import Complaints from "./pages/resident/Complaints";
import ResidentPackages from "./pages/resident/Packages";
import StaffPasses from "./pages/resident/StaffPasses";
import ResidentAmenities from "./pages/resident/Amenities";

import SecurityDashboard from "./pages/security/Dashboard";
import VisitorCheckIn from "./pages/security/VisitorCheckIn";
import SecurityPackages from "./pages/security/Packages";

import AdminDashboard from "./pages/admin/Dashboard";
import ParkingSlots from "./pages/admin/ParkingSlots";
import Announcements from "./pages/admin/Announcements";
import Reports from "./pages/admin/Reports";
import AuditLogs from "./pages/admin/AuditLogs";
import Defaulters from "./pages/admin/Defaulters";
import MoveInOut from "./pages/admin/MoveInOut";
import SocietyAccounting from "./pages/admin/SocietyAccounting";

const residentNav = [
  { to: "/resident", label: "Dashboard", icon: Home, end: true },
  { to: "/resident/vehicles", label: "Vehicles", icon: Car },
  { to: "/resident/guests", label: "Guest approval", icon: Users },
  { to: "/resident/packages", label: "Packages", icon: Package },
  { to: "/resident/staff", label: "Staff passes", icon: UserCheck },
  { to: "/resident/amenities", label: "Amenities", icon: CalendarClock },
  { to: "/resident/fees", label: "Maintenance fees", icon: Wallet },
  { to: "/resident/complaints", label: "Complaints", icon: MessageSquareWarning },
];

const securityNav = [
  { to: "/security", label: "Dashboard", icon: ShieldCheck, end: true },
  { to: "/security/checkin", label: "Visitor check-in", icon: ScanLine },
  { to: "/security/packages", label: "Package log", icon: Package },
];

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: Home, end: true },
  { to: "/admin/slots", label: "Parking slots", icon: Grid3x3 },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/defaulters", label: "Defaulters", icon: AlertOctagon },
  { to: "/admin/accounting", label: "Accounting & Ledger", icon: Landmark },
  { to: "/admin/move", label: "Move in/out", icon: MoveOutIcon },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/audit", label: "Audit logs", icon: FileClock },
];

function Protected({ role, children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mist text-slate text-sm font-mono">
        Checking session…
      </div>
    );
  }

  if (!currentUser || currentUser.role !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/resident" element={<Protected role="resident"><DashboardLayout title="Resident" navItems={residentNav}><ResidentDashboard /></DashboardLayout></Protected>} />
      <Route path="/resident/vehicles" element={<Protected role="resident"><DashboardLayout title="Resident" navItems={residentNav}><VehicleRegistration /></DashboardLayout></Protected>} />
      <Route path="/resident/guests" element={<Protected role="resident"><DashboardLayout title="Resident" navItems={residentNav}><GuestApproval /></DashboardLayout></Protected>} />
      <Route path="/resident/packages" element={<Protected role="resident"><DashboardLayout title="Resident" navItems={residentNav}><ResidentPackages /></DashboardLayout></Protected>} />
      <Route path="/resident/staff" element={<Protected role="resident"><DashboardLayout title="Resident" navItems={residentNav}><StaffPasses /></DashboardLayout></Protected>} />
      <Route path="/resident/amenities" element={<Protected role="resident"><DashboardLayout title="Resident" navItems={residentNav}><ResidentAmenities /></DashboardLayout></Protected>} />
      <Route path="/resident/fees" element={<Protected role="resident"><DashboardLayout title="Resident" navItems={residentNav}><MaintenanceFees /></DashboardLayout></Protected>} />
      <Route path="/resident/complaints" element={<Protected role="resident"><DashboardLayout title="Resident" navItems={residentNav}><Complaints /></DashboardLayout></Protected>} />

      <Route path="/security" element={<Protected role="security"><DashboardLayout title="Security" navItems={securityNav}><SecurityDashboard /></DashboardLayout></Protected>} />
      <Route path="/security/checkin" element={<Protected role="security"><DashboardLayout title="Security" navItems={securityNav}><VisitorCheckIn /></DashboardLayout></Protected>} />
      <Route path="/security/packages" element={<Protected role="security"><DashboardLayout title="Security" navItems={securityNav}><SecurityPackages /></DashboardLayout></Protected>} />

      <Route path="/admin" element={<Protected role="admin"><DashboardLayout title="Admin" navItems={adminNav}><AdminDashboard /></DashboardLayout></Protected>} />
      <Route path="/admin/slots" element={<Protected role="admin"><DashboardLayout title="Admin" navItems={adminNav}><ParkingSlots /></DashboardLayout></Protected>} />
      <Route path="/admin/announcements" element={<Protected role="admin"><DashboardLayout title="Admin" navItems={adminNav}><Announcements /></DashboardLayout></Protected>} />
      <Route path="/admin/defaulters" element={<Protected role="admin"><DashboardLayout title="Admin" navItems={adminNav}><Defaulters /></DashboardLayout></Protected>} />
      <Route path="/admin/accounting" element={<Protected role="admin"><DashboardLayout title="Admin" navItems={adminNav}><SocietyAccounting /></DashboardLayout></Protected>} />
      <Route path="/admin/move" element={<Protected role="admin"><DashboardLayout title="Admin" navItems={adminNav}><MoveInOut /></DashboardLayout></Protected>} />
      <Route path="/admin/reports" element={<Protected role="admin"><DashboardLayout title="Admin" navItems={adminNav}><Reports /></DashboardLayout></Protected>} />
      <Route path="/admin/audit" element={<Protected role="admin"><DashboardLayout title="Admin" navItems={adminNav}><AuditLogs /></DashboardLayout></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AlertsProvider>
          <AppRoutes />
        </AlertsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}