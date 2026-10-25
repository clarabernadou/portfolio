import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LogoClara } from "@/components/proto/LogoClara";
import { AdminNav } from "@/components/admin/AdminNav";
import { SignOut } from "@/components/admin/SignOut";
import { Icon } from "@/components/admin/icons";
import { ToastProvider } from "@/components/admin/Toast";

// Mise en page commune aux écrans de l'administration (maquettes/admin/*).
// L'accès est vérifié par chaque page (requireAdmin) et par proxy.ts.
export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? "Clara Bernadou";
  return (
    <div className="adm">
      <aside className="adm-side" aria-label="Barre latérale de l’administration">
        <div className="adm-brand">
          <LogoClara height={56} fill="var(--lilas)" />
          <span>Administration</span>
        </div>
        <AdminNav />
        <div className="adm-side-foot">
          <a className="adm-voir" href="/" target="_blank" rel="noopener noreferrer">
            <Icon name="external" />
            Voir le site
          </a>
          <div className="adm-user">
            <span className="adm-avatar" aria-hidden="true">
              {name.slice(0, 1)}
            </span>
            <span>
              <b>{name}</b>
              <small>Connectée avec GitHub</small>
            </span>
          </div>
          <SignOut />
        </div>
      </aside>
      <main className="adm-main">
        <ToastProvider>{children}</ToastProvider>
      </main>
    </div>
  );
}
