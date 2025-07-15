import type { SocialProvider } from "better-auth/social-providers";
import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { env } from "next-runtime-env";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaApple,
  FaDiscord,
  FaDropbox,
  FaFacebook,
  FaGithub,
  FaGitlab,
  FaGoogle,
  FaLinkedin,
  FaMicrosoft,
  FaReddit,
  FaSpotify,
  FaTiktok,
  FaTwitch,
  FaTwitter,
  FaVk,
} from "react-icons/fa";
import { SiRoblox, SiZoom } from "react-icons/si";
import { TbBrandKick } from "react-icons/tb";
import { z } from "zod";

import { authClient } from "@kan/auth/client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { usePopup } from "~/providers/popup";

interface FormValues {
  name?: string;
  email: string;
  password?: string;
}

interface AuthProps {
  setIsMagicLinkSent: (value: boolean, recipient: string) => void;
  isSignUp?: boolean;
}

const EmailSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().optional(),
});

const availableSocialProviders = {
  google: {
    id: "google",
    name: "Google",
    icon: FaGoogle,
  },
  github: {
    id: "github",
    name: "GitHub",
    icon: FaGithub,
  },
  discord: {
    id: "discord",
    name: "Discord",
    icon: FaDiscord,
  },
  apple: {
    id: "apple",
    name: "Apple",
    icon: FaApple,
  },
  microsoft: {
    id: "microsoft",
    name: "Microsoft",
    icon: FaMicrosoft,
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    icon: FaFacebook,
  },
  spotify: {
    id: "spotify",
    name: "Spotify",
    icon: FaSpotify,
  },
  twitch: {
    id: "twitch",
    name: "Twitch",
    icon: FaTwitch,
  },
  twitter: {
    id: "twitter",
    name: "Twitter",
    icon: FaTwitter,
  },
  dropbox: {
    id: "dropbox",
    name: "Dropbox",
    icon: FaDropbox,
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    icon: FaLinkedin,
  },
  gitlab: {
    id: "gitlab",
    name: "GitLab",
    icon: FaGitlab,
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    icon: FaTiktok,
  },
  reddit: {
    id: "reddit",
    name: "Reddit",
    icon: FaReddit,
  },
  roblox: {
    id: "roblox",
    name: "Roblox",
    icon: SiRoblox,
  },
  vk: {
    id: "vk",
    name: "VK",
    icon: FaVk,
  },
  kick: {
    id: "kick",
    name: "Kick",
    icon: TbBrandKick,
  },
  zoom: {
    id: "zoom",
    name: "Zoom",
    icon: SiZoom,
  },
};

export function Auth({ setIsMagicLinkSent, isSignUp }: AuthProps) {
  const [isLoginWithProviderPending, setIsLoginWithProviderPending] =
    useState<null | SocialProvider>(null);
  const isCredentialsEnabled =
    env("NEXT_PUBLIC_ALLOW_CREDENTIALS")?.toLowerCase() === "true";
  const [isLoginWithEmailPending, setIsLoginWithEmailPending] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { showPopup } = usePopup();

  const authForm = useForm<FormValues>({
    resolver: zodResolver(EmailSchema),
  });

  const { data: socialProviders } = useQuery({
    queryKey: ["social_providers"],
    queryFn: () => authClient.getSocialProviders(),
  });

  const handleLoginWithEmail = async (
    email: string,
    password?: string,
    name?: string,
  ) => {
    setIsLoginWithEmailPending(true);
    setLoginError(null);
    if (password) {
      if (isSignUp && name) {
        await authClient.signUp.email(
          {
            name,
            email,
            password,
            callbackURL: "/boards",
          },
          {
            onSuccess: () =>
              showPopup({
                header: t`Success`,
                message: t`You have been signed up successfully.`,
                icon: "success",
              }),
            onError: ({ error }) => setLoginError(error.message),
          },
        );
      } else {
        await authClient.signIn.email(
          {
            email,
            password,
            callbackURL: "/boards",
          },
          {
            onSuccess: () =>
              showPopup({
                header: t`Success`,
                message: t`You have been logged in successfully.`,
                icon: "success",
              }),
            onError: ({ error }) => setLoginError(error.message),
          },
        );
      }
    } else {
      await authClient.signIn.magicLink(
        {
          email,
          callbackURL: "/boards",
        },
        {
          onSuccess: () => setIsMagicLinkSent(true, email),
          onError: ({ error }) => setLoginError(error.message),
        },
      );
    }

    setIsLoginWithEmailPending(false);
  };

  const handleLoginWithProvider = async (provider: SocialProvider) => {
    setIsLoginWithProviderPending(provider);
    setLoginError(null);
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: "/boards",
    });

    setIsLoginWithProviderPending(null);

    if (error) {
      setLoginError(
        t`Failed to login with ${provider.at(0)?.toUpperCase() + provider.slice(1)}. Please try again.`,
      );
    }
  };

  const onSubmit = async (values: FormValues) => {
    await handleLoginWithEmail(values.email, values.password, values.name);
  };

  const password = authForm.watch("password");

  return (
    <div className="space-y-6">
      {socialProviders?.length !== 0 && (
        <div className="space-y-2">
          {Object.entries(availableSocialProviders).map(([key, provider]) => {
            if (!socialProviders?.includes(key)) {
              return null;
            }
            return (
              <Button
                key={key}
                onClick={() => handleLoginWithProvider(key as SocialProvider)}
                isLoading={isLoginWithProviderPending === key}
                size="lg"
                className="w-full"
              >
                <provider.icon />
                <Trans>Continue with {provider.name}</Trans>
              </Button>
            );
          })}
        </div>
      )}
      <Form {...authForm}>
        <form
          onSubmit={authForm.handleSubmit(onSubmit)}
          className="space-y-4"
          id="login-form"
        >
          {isSignUp && isCredentialsEnabled && (
            <FormField
              control={authForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder={t`Enter your name`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={authForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder={t`Enter your email adress`} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isCredentialsEnabled && (
            <FormField
              control={authForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder={t`Enter your password`} type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {loginError && (
            <p className="mt-2 text-xs text-red-400">{loginError}</p>
          )}

          <Button
            className="w-full"
            type="submit"
            isLoading={isLoginWithEmailPending}
          >
            {isSignUp ? t`Sign up with ` : t`Continue with `}
            {!isCredentialsEnabled || (password && password.length !== 0)
              ? t`email`
              : t`magic link`}
          </Button>
        </form>
      </Form>

      {/* <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          {loginError && (
            <p className="mt-2 text-xs text-red-400">{loginError}</p>
          )}
        </div>
        <div className="mt-[1.5rem] flex items-center gap-4">
          <Button
            isLoading={isLoginWithEmailPending}
            size="lg"
            variant="secondary"
            className="w-full"
          >
            {isSignUp ? t`Sign up with ` : t`Continue with `}
            {!isCredentialsEnabled || (password && password.length !== 0)
              ? t`email`
              : t`magic link`}
          </Button>
        </div>
      </form> */}
    </div>
  );
}
