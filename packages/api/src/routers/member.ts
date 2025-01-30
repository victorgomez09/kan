import { TRPCError } from "@trpc/server";
import { Stripe } from "stripe";
import { z } from "zod";

import * as memberRepo from "@kan/db/repository/member.repo";
import * as userRepo from "@kan/db/repository/user.repo";
import * as workspaceRepo from "@kan/db/repository/workspace.repo";
import { sendEmail } from "@kan/email";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-12-18.acacia",
});

export const memberRouter = createTRPCRouter({
  invite: protectedProcedure
    .meta({
      openapi: {
        summary: "Invite a member to a workspace",
        method: "POST",
        path: "/workspaces/{workspacePublicId}/members/invite",
        description: "Invites a member to a workspace",
        tags: ["Workspaces"],
        protect: true,
      },
    })
    .input(
      z.object({
        email: z.string().email(),
        workspacePublicId: z.string().min(12),
      }),
    )
    .output(z.custom<Awaited<ReturnType<typeof memberRepo.create>>>())
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

      const isInvitedEmailAlreadyMember = workspace.members.some(
        (member) => member.user?.email === input.email,
      );

      if (isInvitedEmailAlreadyMember) {
        throw new TRPCError({
          message: `User with email ${input.email} is already a member of this workspace`,
          code: "BAD_REQUEST",
        });
      }

      let invitedUserId: string | undefined;
      let hashedToken: string | undefined;
      let verificationType: string | undefined;

      const existingUser = await userRepo.getByEmail(ctx.adminDb, input.email);

      if (existingUser) {
        invitedUserId = existingUser.id;

        const magicLink = await ctx.adminDb.auth.admin.generateLink({
          type: "magiclink",
          email: input.email,
          options: {
            redirectTo: process.env.WEBSITE_URL,
          },
        });

        hashedToken = magicLink.data.properties?.hashed_token;
        verificationType = magicLink.data.properties?.verification_type;
      } else {
        const invite = await ctx.adminDb.auth.admin.generateLink({
          type: "invite",
          email: input.email,
          options: {
            redirectTo: process.env.WEBSITE_URL,
          },
        });

        hashedToken = invite.data.properties?.hashed_token;
        verificationType = invite.data.properties?.verification_type;

        const invitedUserAuthId = invite.data.user?.id;
        const invitedUserEmail = invite.data.user?.email;

        if (invitedUserAuthId && invitedUserEmail) {
          const stripeCustomer = await stripe.customers.create({
            email: invitedUserEmail,
            metadata: {
              userId: invitedUserAuthId,
            },
          });

          const newUser = await userRepo.create(ctx.adminDb, {
            email: invitedUserEmail,
            id: invitedUserAuthId,
            stripeCustomerId: stripeCustomer.id,
          });

          invitedUserId = newUser?.id;
        }
      }

      if (!invitedUserId)
        throw new TRPCError({
          message: `Unable to invite user with email ${input.email}`,
          code: "INTERNAL_SERVER_ERROR",
        });

      if (!hashedToken || !verificationType)
        throw new TRPCError({
          message: `Unable to generate magic link for user with email ${input.email}`,
          code: "INTERNAL_SERVER_ERROR",
        });

      const invite = await memberRepo.create(ctx.db, {
        workspaceId: workspace.id,
        userId: invitedUserId,
        createdBy: userId,
        role: "member",
        status: "invited",
      });

      if (!invite)
        throw new TRPCError({
          message: `Unable to invite user with email ${input.email}`,
          code: "INTERNAL_SERVER_ERROR",
        });

      const magicLoginUrl = `${process.env.WEBSITE_URL}/api/auth/confirm?token_hash=${hashedToken}&type=${verificationType}&memberPublicId=${invite.publicId}`;

      await sendEmail(
        input.email,
        "Invitation to join workspace",
        "JOIN_WORKSPACE",
        {
          magicLoginUrl,
        },
      );

      return invite;
    }),
  delete: protectedProcedure
    .meta({
      openapi: {
        summary: "Delete a member from a workspace",
        method: "DELETE",
        path: "/workspaces/{workspacePublicId}/members/{memberPublicId}",
        description: "Deletes a member from a workspace",
        tags: ["Workspaces"],
        protect: true,
      },
    })
    .input(
      z.object({
        workspacePublicId: z.string().min(12),
        memberPublicId: z.string().min(12),
      }),
    )
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId)
        throw new TRPCError({
          message: `User not authenticated`,
          code: "UNAUTHORIZED",
        });

      const workspace = await workspaceRepo.getByPublicId(
        ctx.db,
        input.workspacePublicId,
      );

      if (!workspace)
        throw new TRPCError({
          message: `Workspace with public ID ${input.workspacePublicId} not found`,
          code: "NOT_FOUND",
        });

      const member = await memberRepo.getByPublicId(
        ctx.db,
        input.memberPublicId,
      );

      if (!member)
        throw new TRPCError({
          message: `Member with public ID ${input.memberPublicId} not found`,
          code: "NOT_FOUND",
        });

      const deletedMember = await memberRepo.softDelete(ctx.db, {
        memberId: member.id,
        deletedAt: new Date().toISOString(),
        deletedBy: userId,
      });

      if (!deletedMember)
        throw new TRPCError({
          message: `Failed to delete member with public ID ${input.memberPublicId}`,
          code: "INTERNAL_SERVER_ERROR",
        });

      return { success: true };
    }),
});
