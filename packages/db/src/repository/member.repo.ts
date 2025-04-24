import { and, eq, isNull } from "drizzle-orm";

import type { dbClient } from "@kan/db/client";
import type { MemberRole, MemberStatus } from "@kan/db/schema";
import { workspaceMembers } from "@kan/db/schema";
import { generateUID } from "@kan/shared/utils";

export const create = async (
  db: dbClient,
  memberInput: {
    userId: string;
    workspaceId: number;
    createdBy: string;
    role: MemberRole;
    status: MemberStatus;
  },
) => {
  const [result] = await db
    .insert(workspaceMembers)
    .values({
      publicId: generateUID(),
      userId: memberInput.userId,
      workspaceId: memberInput.workspaceId,
      createdBy: memberInput.createdBy,
      role: memberInput.role,
      status: memberInput.status,
    })
    .returning({
      id: workspaceMembers.id,
      publicId: workspaceMembers.publicId,
    });

  return result;
};

export const getByPublicId = async (db: dbClient, publicId: string) => {
  return db.query.workspaceMembers.findFirst({
    where: eq(workspaceMembers.publicId, publicId),
  });
};

export const acceptInvite = async (db: dbClient, id: number) => {
  const [result] = await db
    .update(workspaceMembers)
    .set({ status: "active" })
    .where(eq(workspaceMembers.id, id))
    .returning({
      id: workspaceMembers.id,
      publicId: workspaceMembers.publicId,
    });

  return result;
};

export const softDelete = async (
  db: dbClient,
  args: {
    memberId: number;
    deletedBy: string;
  },
) => {
  const [result] = await db
    .update(workspaceMembers)
    .set({ deletedAt: new Date(), deletedBy: args.deletedBy })
    .where(
      and(
        eq(workspaceMembers.id, args.memberId),
        isNull(workspaceMembers.deletedAt),
      ),
    )
    .returning({
      id: workspaceMembers.id,
      publicId: workspaceMembers.publicId,
    });

  return result;
};
