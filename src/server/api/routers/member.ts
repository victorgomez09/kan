import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import * as workspaceRepo from "~/server/db/repository/workspace.repo";
import * as memberRepo from "~/server/db/repository/member.repo";
import * as userRepo from "~/server/db/repository/user.repo";

import { sendEmail } from "~/email/sendEmail";

export const memberRouter = createTRPCRouter({
  invite: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        workspacePublicId: z.string().min(12),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId)
        throw new TRPCError({
          message: `User not authenticated`,
          code: "UNAUTHORIZED",
        });

      const workspace = await workspaceRepo.getByPublicIdWithMembers(
        ctx.db,
        input.workspacePublicId,
      );

      if (!workspace)
        throw new TRPCError({
          message: `Workspace with public ID ${input.workspacePublicId} not found`,
          code: "NOT_FOUND",
        });

      const isInvitedEmailAlreadyMember = workspace?.members.some(
        (member) => member.user?.email === input.email,
      );

      if (isInvitedEmailAlreadyMember) {
        throw new TRPCError({
          message: `User with email ${input.email} is already a member of this workspace`,
          code: "BAD_REQUEST",
        });
      }

      let invitedUserId: string | null = null;

      const existingUser = await userRepo.getByEmail(ctx.adminDb, input.email);

      if (existingUser) {
        invitedUserId = existingUser.id;

        const magicLink = await ctx.adminDb.auth.admin.generateLink({
          type: "magiclink",
          email: input.email,
        });

        const magicLinkUrl = magicLink.data.properties?.action_link;

        if (!magicLinkUrl)
          throw new TRPCError({
            message: `Unable to generate magic link for user with email ${input.email}`,
            code: "INTERNAL_SERVER_ERROR",
          });

        await sendEmail(
          input.email,
          "Invitation to join workspace",
          "JOIN_WORKSPACE",
          {
            magicLinkUrl,
          },
        );
      } else {
        const invite = await ctx.adminDb.auth.admin.generateLink({
          type: "invite",
          email: input.email,
        });

        const magicLinkUrl = invite.data.properties?.action_link;

        if (!magicLinkUrl)
          throw new TRPCError({
            message: `Unable to generate invite link for user with email ${input.email}`,
            code: "INTERNAL_SERVER_ERROR",
          });

        await sendEmail(
          input.email,
          "Invitation to join workspace",
          "JOIN_WORKSPACE",
          {
            magicLinkUrl,
          },
        );

        invitedUserId = invite.data.user?.id ?? null;
        const invitedUserEmail = invite.data.user?.email;

        if (invitedUserId && invitedUserEmail)
          userRepo.create(ctx.adminDb, {
            email: invitedUserEmail,
            id: invitedUserId,
          });
      }

      if (!invitedUserId)
        throw new TRPCError({
          message: `Unable to invite user with email ${input.email}`,
          code: "INTERNAL_SERVER_ERROR",
        });

      const invite = await memberRepo.create(ctx.db, {
        workspaceId: workspace.id,
        userId: invitedUserId,
        createdBy: userId,
        role: "member",
        status: "invited",
      });

      return invite;
    }),
});
