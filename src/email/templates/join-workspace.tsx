import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Hr,
  Link,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";

import * as React from "react";

export const JoinWorkspaceTemplate = ({
  magicLoginUrl,
}: {
  magicLoginUrl?: string;
}) => (
  <Tailwind
    config={{
      theme: {
        extend: {
          fontFamily: {
            body: [
              "-apple-system",
              "BlinkMacSystemFont",
              "Segoe UI",
              "Roboto",
              "Oxygen",
              "Ubuntu",
              "Cantarell",
              "Fira Sans",
              "Droid Sans",
              "Helvetica Neue",
              "sans-serif",
            ],
          },
          colors: {
            "dark-50": "#161616",
            "dark-100": "#1c1c1c",
            "dark-200": "#232323",
            "dark-300": "#282828",
            "dark-400": "#2e2e2e",
            "dark-500": "#343434",
            "dark-600": "#3e3e3e",
            "dark-700": "#505050",
            "dark-800": "#707070",
            "dark-900": "#7e7e7e",
            "dark-950": "#bbb",
            "dark-1000": "#ededed",
          },
        },
      },
    }}
  >
    <Html>
      <Head />
      <Preview>Log in with this magic link</Preview>
      <Body className="bg-white">
        <Container className="font-body m-auto px-3">
          <Heading className="my-10 text-[24px] font-bold text-dark-200">
            kan.bn
          </Heading>
          <Heading className="text-[24px] font-bold text-dark-200">
            Login to your Kan account
          </Heading>
          <Text className="font-sm mb-8 text-dark-200">
            Click the button below to instantly login to your account.
          </Text>
          <Button
            target="_blank"
            href={magicLoginUrl}
            className="mb-8 rounded-md bg-dark-300 px-6 py-4 text-sm font-medium leading-4 text-white"
          >
            Login to your account
          </Button>
          <Text className="mb-4 text-sm text-dark-900">
            If you didn&apos;t try to login, you can safely ignore this email.
          </Text>
          <Hr className="mb-8 mt-10 border" />
          <Text className="text-dark-900">
            <Link
              href={process.env.WEBSITE_URL}
              target="_blank"
              className="text-dark-900 underline"
            >
              Kan
            </Link>
            , the open source Trello alternative.
          </Text>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

export default JoinWorkspaceTemplate;
