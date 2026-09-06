import { createContext, useState } from "react";

export const AlertsContext = createContext(null);

export function AlertsProvider({ children }) {
  const [sosAlerts, setSosAlerts] = useState([]);

  function raiseSOS({ flat, residentName }) {
    setSosAlerts((prev) => [
      {
        id: `SOS-${Date.now()}`,
        flat,
        residentName,
        raisedAt: "Just now",
        status: "active",
      },
      ...prev,
    ]);
  }

  function resolveSOS(id) {
    setSosAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "resolved" } : a))
    );
  }

  return (
    <AlertsContext.Provider value={{ sosAlerts, raiseSOS, resolveSOS }}>
      {children}
    </AlertsContext.Provider>
  );
}