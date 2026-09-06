// Mock data layer. Each export here is shaped like what the Django REST
// endpoints will eventually return, so swapping to real API calls later
// is a matter of replacing these constants with fetch() calls.

export const users = [
  { id: 1, name: "Ritika Sharma", role: "resident", flat: "B-204", phone: "98xxxxxx12" },
  { id: 2, name: "Naveen Kumar", role: "security", shift: "Day (8am–8pm)", gate: "Main Gate" },
  { id: 3, name: "Society Admin", role: "admin", designation: "Facility Manager" },
];

export const vehicles = [
  { id: "V-101", owner: "Ritika Sharma", flat: "B-204", plate: "UP32 AB 4521", type: "Car", slot: "B-12", status: "active" },
  { id: "V-102", owner: "Ritika Sharma", flat: "B-204", plate: "UP32 XY 0099", type: "Two-wheeler", slot: "B-12A", status: "active" },
  { id: "V-103", owner: "Arjun Mehta", flat: "A-101", plate: "UP32 CD 7788", type: "Car", slot: "A-04", status: "active" },
  { id: "V-104", owner: "Priya Nair", flat: "C-305", plate: "UP32 EF 1122", type: "Car", slot: null, status: "pending" },
];

// Parking grid: block, slot code, status (available | occupied | reserved), assignedTo
export const parkingSlots = [
  { code: "A-01", block: "A", status: "occupied", assignedTo: "Arjun Mehta · A-101" },
  { code: "A-02", block: "A", status: "available", assignedTo: null },
  { code: "A-03", block: "A", status: "occupied", assignedTo: "Kavita Rao · A-102" },
  { code: "A-04", block: "A", status: "occupied", assignedTo: "Arjun Mehta · A-101" },
  { code: "A-05", block: "A", status: "reserved", assignedTo: "Visitor bay" },
  { code: "A-06", block: "A", status: "available", assignedTo: null },
  { code: "B-10", block: "B", status: "occupied", assignedTo: "Sunil Batra · B-201" },
  { code: "B-11", block: "B", status: "available", assignedTo: null },
  { code: "B-12", block: "B", status: "occupied", assignedTo: "Ritika Sharma · B-204" },
  { code: "B-12A", block: "B", status: "occupied", assignedTo: "Ritika Sharma · B-204" },
  { code: "B-13", block: "B", status: "available", assignedTo: null },
  { code: "B-14", block: "B", status: "reserved", assignedTo: "Visitor bay" },
  { code: "C-20", block: "C", status: "available", assignedTo: null },
  { code: "C-21", block: "C", status: "occupied", assignedTo: "Meena Iyer · C-302" },
  { code: "C-22", block: "C", status: "available", assignedTo: null },
  { code: "C-23", block: "C", status: "occupied", assignedTo: "Rohit Verma · C-310" },
];

export const visitors = [
  { id: "VIS-2201", name: "Deepak Singh", purpose: "Delivery — Zomato", host: "B-204", status: "checked-in", qrCode: "QR-8891", time: "10:42 AM" },
  { id: "VIS-2202", name: "Anjali Gupta", purpose: "Guest", host: "A-101", status: "awaiting-approval", qrCode: "QR-8892", time: "11:05 AM" },
  { id: "VIS-2203", name: "Fix-It Plumbing Co.", purpose: "Maintenance visit", host: "C-305", status: "checked-out", qrCode: "QR-8887", time: "9:15 AM" },
  { id: "VIS-2204", name: "Rahul Jain", purpose: "Guest", host: "B-204", status: "approved", qrCode: "QR-8893", time: "—" },
];

export const guestApprovals = [
  { id: "GA-01", visitorName: "Anjali Gupta", requestedBy: "Arjun Mehta", flat: "A-101", purpose: "Family visit", requestedAt: "11:02 AM", status: "pending" },
  { id: "GA-02", visitorName: "Rahul Jain", requestedBy: "Ritika Sharma", flat: "B-204", purpose: "Friend visiting", requestedAt: "9:40 AM", status: "approved" },
];

export const maintenanceFees = [
  { flat: "B-204", period: "August 2026", amount: 3200, status: "paid", paidOn: "3 Aug 2026" },
  { flat: "B-204", period: "July 2026", amount: 3200, status: "paid", paidOn: "2 Jul 2026" },
  { flat: "B-204", period: "September 2026", amount: 3200, status: "due", paidOn: null },
];

export const complaints = [
  { id: "CMP-441", title: "Leaking pipe in basement parking", category: "Plumbing", flat: "B-204", status: "in-progress", raisedOn: "12 Aug 2026" },
  { id: "CMP-442", title: "Street light near Block C not working", category: "Electrical", flat: "C-305", status: "open", raisedOn: "15 Aug 2026" },
  { id: "CMP-443", title: "Lift making noise", category: "Maintenance", flat: "A-101", status: "resolved", raisedOn: "2 Aug 2026" },
];

export const announcements = [
  { id: 1, title: "Water supply interruption — Aug 20", body: "Water supply will be suspended 10am–2pm for tank cleaning.", priority: "normal", postedOn: "17 Aug 2026" },
  { id: 2, title: "Fire drill — mandatory", body: "All residents must participate in the fire safety drill on Aug 22, 5pm, at the main lawn.", priority: "urgent", postedOn: "16 Aug 2026" },
];

export const auditLogs = [
  { id: 1, actor: "Society Admin", action: "Approved guest entry", target: "Anjali Gupta → A-101", timestamp: "18 Aug, 11:04 AM" },
  { id: 2, actor: "Naveen Kumar (Security)", action: "Checked in visitor", target: "Deepak Singh (QR-8891)", timestamp: "18 Aug, 10:42 AM" },
  { id: 3, actor: "Society Admin", action: "Reassigned parking slot", target: "V-104 → pending", timestamp: "17 Aug, 4:20 PM" },
  { id: 4, actor: "Ritika Sharma", action: "Paid maintenance fee", target: "August 2026 — ₹3,200", timestamp: "3 Aug, 9:10 AM" },
];

export const reportsSummary = {
  totalResidents: 148,
  totalVehicles: 176,
  occupancyRate: 0.78,
  feesCollectedThisMonth: 412800,
  feesDueThisMonth: 38400,
  openComplaints: 6,
  visitorsToday: 23,
};
// ---------- Package management ----------
export const packages = [
  { id: "PKG-501", courier: "Amazon", flat: "B-204", loggedAt: "10:15 AM", status: "waiting", photo: true },
  { id: "PKG-502", courier: "Zomato", flat: "A-101", loggedAt: "11:40 AM", status: "waiting", photo: false },
  { id: "PKG-503", courier: "Flipkart", flat: "B-204", loggedAt: "Yesterday", status: "collected", photo: true },
  { id: "PKG-504", courier: "Blinkit", flat: "C-305", loggedAt: "9:05 AM", status: "waiting", photo: true },
];

// ---------- Staff / domestic help registry ----------
export const staffPasses = [
  { id: "STF-01", name: "Kamla Devi", role: "Maid", flat: "B-204", validTill: "31 Dec 2026", qrCode: "SQR-1101", status: "active" },
  { id: "STF-02", name: "Ramesh Yadav", role: "Driver", flat: "A-101", validTill: "31 Dec 2026", qrCode: "SQR-1102", status: "active" },
  { id: "STF-03", name: "Sunita Kumari", role: "Cook", flat: "B-204", validTill: "15 Sep 2026", qrCode: "SQR-1103", status: "expiring" },
];

// ---------- Amenity booking ----------
export const amenities = [
  { id: "clubhouse", name: "Clubhouse Hall", capacity: "60 people", slotLength: "2 hrs" },
  { id: "gym", name: "Gymnasium", capacity: "12 people", slotLength: "1 hr" },
  { id: "pool", name: "Swimming Pool", capacity: "20 people", slotLength: "1 hr" },
];

export const amenityBookings = [
  { id: "BK-01", amenityId: "clubhouse", flat: "B-204", date: "22 Aug 2026", slot: "6:00 PM – 8:00 PM", status: "confirmed" },
  { id: "BK-02", amenityId: "gym", flat: "A-101", date: "20 Aug 2026", slot: "7:00 AM – 8:00 AM", status: "confirmed" },
  { id: "BK-03", amenityId: "clubhouse", flat: "C-305", date: "22 Aug 2026", slot: "4:00 PM – 6:00 PM", status: "confirmed" },
];

// ---------- Defaulter tracking (admin, society-wide) ----------
export const allResidentsFees = [
  { flat: "B-204", resident: "Ritika Sharma", period: "September 2026", amount: 3200, status: "due", daysOverdue: 5 },
  { flat: "A-101", resident: "Arjun Mehta", period: "September 2026", amount: 3200, status: "due", daysOverdue: 5 },
  { flat: "A-101", resident: "Arjun Mehta", period: "August 2026", amount: 3200, status: "overdue", daysOverdue: 35 },
  { flat: "C-305", resident: "Priya Nair", period: "July 2026", amount: 3200, status: "overdue", daysOverdue: 66 },
  { flat: "C-305", resident: "Priya Nair", period: "August 2026", amount: 3200, status: "overdue", daysOverdue: 35 },
  { flat: "C-305", resident: "Priya Nair", period: "September 2026", amount: 3200, status: "due", daysOverdue: 5 },
];

// ---------- Move-in / move-out ----------
export const moveRequests = [
  {
    id: "MV-01",
    flat: "D-102",
    type: "move-out",
    residentName: "Sanjay Kapoor",
    requestedDate: "28 Aug 2026",
    checklist: [
      { label: "Clear pending dues", done: true },
      { label: "Deregister vehicles", done: false },
      { label: "Revoke gate QR / staff passes", done: false },
      { label: "Handover keys & inspection", done: false },
    ],
  },
];

// ---------- SOS alerts ----------
export const sosAlerts = [
  // populated live from the resident dashboard SOS button — starts empty
];