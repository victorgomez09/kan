import MagicLinkTemplate from "~/email/templates/magic-link";
import JoinWorkspaceTemplate from "~/email/templates/join-workspace";

import { render } from "@react-email/render";

type Templates = "MAGIC_LINK" | "JOIN_WORKSPACE";

const emailTemplates: Record<Templates, React.FC> = {
  MAGIC_LINK: MagicLinkTemplate,
  JOIN_WORKSPACE: JoinWorkspaceTemplate,
};

export const sendEmail = async (
  to: string,
  subject: string,
  template: Templates,
  data: Record<string, string>,
) => {
  const EmailTemplate = emailTemplates[template];

  const html = await render(<EmailTemplate {...data} />, { pretty: true });

  const response = await fetch(process.env.EMAIL_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.EMAIL_TOKEN}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.statusText}`);
  }

  return response;
};
