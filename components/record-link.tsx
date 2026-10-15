import Link from "next/link";
import { cn } from "cn";

export function PersonLinks({
  people,
}: {
  people: Array<{ id: string; name: string }>;
}) {
  return people.map((person, index) => (
    <span key={person.id}>
      {index > 0 ? ", " : null}
      <PersonLink person={person} />
    </span>
  ));
}

export function PersonLink({
  person,
  className,
}: {
  person: { id: string; name: string };
  className?: string;
}) {
  return (
    <Link
      href={`/people/${person.id}`}
      className={cn("underline-offset-4 hover:underline", className)}
    >
      {person.name}
    </Link>
  );
}

export function ProjectLink({
  project,
  className,
}: {
  project: { id: string; name: string };
  className?: string;
}) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className={cn("underline-offset-4 hover:underline", className)}
    >
      {project.name}
    </Link>
  );
}

export function MeetingLink({
  meeting,
  className,
}: {
  meeting: { id: string; title: string };
  className?: string;
}) {
  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className={cn("underline-offset-4 hover:underline", className)}
    >
      {meeting.title}
    </Link>
  );
}
