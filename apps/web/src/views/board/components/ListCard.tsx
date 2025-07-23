import LabelIcon from "~/components/LabelIcon";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getAvatarUrl, getInitialsFromName, inferInitialsFromEmail } from "~/utils/helpers";

const ListCard = ({
  title,
  labels,
  members,
}: {
  title: string;
  labels: { name: string; colourCode: string | null }[];
  members: {
    publicId: string;
    email: string;
    user: { name: string | null; email: string; image: string | null } | null;
  }[];
}) => {
  const getInitials = (name: string, email: string) => {
    return name
      ? getInitialsFromName(name)
      : inferInitialsFromEmail(email);
  }

  return (
    <Card className="px-2 py-4 gap-2 bg-background">
      <CardHeader className="px-2">
        <CardTitle className="truncate">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-2">
        {labels.length || members.length ? (
          <div className="mt-2 flex flex-col justify-end">
            <div className="space-x-0.5">
              {labels.map((label) => (
                <Badge className="flex items-center gap-1" variant="secondary">
                  <LabelIcon colourCode={label.colourCode} />
                  {label.name}
                </Badge>
              ))}
            </div>
            <div className="isolate flex justify-end -space-x-1 overflow-hidden">
              {members.map(({ user }) => {
                const avatarUrl = user?.image
                  ? getAvatarUrl(user.image)
                  : undefined;

                return (
                  <Avatar>
                    <AvatarImage src={avatarUrl} alt={user?.name ?? ""} />
                    <AvatarFallback>{getInitials(user?.name ?? "", user?.email ?? "")}</AvatarFallback>
                  </Avatar>
                );
              })}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default ListCard;
