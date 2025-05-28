import Avatar from "~/components/Avatar";
import Badge from "~/components/Badge";
import LabelIcon from "~/components/LabelIcon";
import { getAvatarUrl } from "~/utils/helpers";

const Card = ({
  title,
  labels,
  members,
}: {
  title: string;
  labels: { name: string; colourCode: string | null }[];
  members: {
    publicId: string;
    user: { name: string | null; email: string; image: string | null } | null;
  }[];
}) => {
  return (
    <div className="flex flex-col rounded-md border border-light-200 bg-light-50 px-3 py-2 text-sm text-neutral-900 dark:border-dark-200 dark:bg-dark-200 dark:text-dark-1000 dark:hover:bg-dark-300">
      <span>{title}</span>
      {labels.length || members.length ? (
        <div className="mt-2 flex flex-col justify-end">
          <div className="space-x-0.5">
            {labels.map((label) => (
              <Badge
                value={label.name}
                iconLeft={<LabelIcon colourCode={label.colourCode} />}
              />
            ))}
          </div>
          <div className="isolate flex justify-end -space-x-1 overflow-hidden">
            {members.map(({ user }) => {
              if (!user) return null;

              const avatarUrl = user.image
                ? getAvatarUrl(user.image)
                : undefined;

              return (
                <Avatar
                  name={user.name ?? ""}
                  email={user.email}
                  imageUrl={avatarUrl}
                  size="sm"
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Card;
