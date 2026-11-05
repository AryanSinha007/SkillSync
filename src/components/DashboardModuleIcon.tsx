import type { ReactNode } from "react";

type ModuleIconKind = "profile" | "teammates" | "projects" | "invitations" | "team";

const iconPaths: Record<ModuleIconKind, ReactNode> = {
  profile: <><circle cx="24" cy="17" r="6" /><path d="M12.5 36c.8-6 5.2-9.5 11.5-9.5s10.7 3.5 11.5 9.5" /><path d="M34 13h5m-2.5-2.5v5" /></>,
  teammates: <><circle cx="19" cy="18" r="5.2" /><circle cx="31" cy="19" r="4.2" /><path d="M9.5 35c.7-5.5 4.2-8.5 9.5-8.5s8.8 3 9.5 8.5m-.3-7.5c4.8-.7 8.3 1.8 9.3 6.7" /><path d="m34 9 1.4 3.6L39 14l-3.6 1.4L34 19l-1.4-3.6L29 14l3.6-1.4L34 9Z" /></>,
  projects: <><path d="M14 32.5 30.5 16c3.2-3.2 7.6-3.9 10-3.5.4 2.4-.3 6.8-3.5 10L20.5 39l-6.5-6.5Z" /><path d="m27 19 6 6M13.5 30.5 9 32l2.5 2.5L13 39l2-5.5m14-17.5c.2-4.5 3.8-8 8.5-8" /><circle cx="33.8" cy="17.7" r="2.2" /></>,
  invitations: <><rect x="10.5" y="14" width="27" height="20" rx="4" /><path d="m12 17 12 9 12-9" /><circle cx="35" cy="34" r="7" fill="currentColor" stroke="none" /><path d="m31.8 34 2.1 2.1 4.2-4.5" stroke="#19122c" strokeWidth="1.8" /></>,
  team: <><circle cx="18" cy="17" r="5" /><circle cx="30" cy="17" r="5" /><circle cx="24" cy="14" r="5" /><path d="M8.5 35c.6-5 3.5-8 8-8 2.2 0 4 .8 5.5 2.3m17.5 5.7c-.6-5-3.5-8-8-8-2.2 0-4 .8-5.5 2.3M14 37c.7-6.2 4.3-9.5 10-9.5S33.3 30.8 34 37" /></>,
};

function DashboardModuleIcon({ kind }: { kind: ModuleIconKind }) {
  return (
    <span className={`dashboard-card-icon dashboard-card-icon--${kind}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {iconPaths[kind]}
      </svg>
    </span>
  );
}

export default DashboardModuleIcon;
