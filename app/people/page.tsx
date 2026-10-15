import type { Metadata } from "next";
import Link from "next/link";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { EditLink } from "@/components/edit-link";
import { PageHeader } from "@/components/page-header";
import { PersonAvatar } from "@/components/person-avatar";
import { StatusBadge } from "@/components/status-badge";
import { hasEditAccess } from "@/lib/admin/session";
import { listPeople } from "@/lib/data/people";

export const metadata: Metadata = {
  title: "People",
};

export default async function PeoplePage() {
  const [result, editing] = await Promise.all([listPeople(), hasEditAccess()]);

  return (
    <>
      <PageHeader
        title="People"
        description="Society members, the projects they lead, and the work they are responsible for."
        action={editing ? <EditLink href="/people/new">Add person</EditLink> : null}
      />
      {result.configured ? (
        result.data.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {result.data.map((person) => (
              <li key={person.id}>
                <Link
                  href={`/people/${person.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/60"
                >
                  <PersonAvatar name={person.name} url={person.avatarUrl} />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{person.name}</span>
                      {person.active ? null : (
                        <StatusBadge tone="muted">Inactive</StatusBadge>
                      )}
                    </span>
                    {person.email ? (
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {person.email}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No people yet.</p>
        )
      ) : (
        <DatabaseUnavailable />
      )}
    </>
  );
}
