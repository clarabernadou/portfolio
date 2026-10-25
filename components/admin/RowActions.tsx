"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Icon } from "./icons";
import { useToast } from "./Toast";

// Actions d'une ligne : modifier, dupliquer, supprimer (confirmation, puis
// annulation possible pendant 10 secondes, ADMIN-et-SYNCHRONISATION.md §5).
export function RowActions({
  name,
  editHref,
  onDuplicate,
  onDelete,
  onRestore,
  deleteBlocked,
}: {
  name: string;
  editHref: string;
  onDuplicate?: () => Promise<void>;
  onDelete: () => Promise<void>;
  onRestore: () => Promise<void>;
  deleteBlocked?: string;
}) {
  const [pending, start] = useTransition();
  const toast = useToast();

  return (
    <div className="adm-actions">
      <Link className="adm-icon-btn" href={editHref} aria-label={`Modifier « ${name} »`}>
        <Icon name="edit" size={16} />
      </Link>
      {onDuplicate && (
        <button type="button" className="adm-icon-btn" aria-label={`Dupliquer « ${name} »`} disabled={pending} onClick={() => start(onDuplicate)}>
          <Icon name="copy" size={16} />
        </button>
      )}
      <button
        type="button"
        className="adm-icon-btn adm-icon-btn--danger"
        aria-label={`Supprimer « ${name} »`}
        disabled={pending}
        onClick={() => {
          if (deleteBlocked) {
            window.alert(deleteBlocked);
            return;
          }
          if (!window.confirm(`Supprimer « ${name} » ? Tu pourras annuler pendant 10 secondes.`)) return;
          start(async () => {
            await onDelete();
            toast({ message: `« ${name} » supprimé.`, undo: onRestore });
          });
        }}
      >
        <Icon name="trash" size={16} />
      </button>
    </div>
  );
}
