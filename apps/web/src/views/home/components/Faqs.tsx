import Link from "next/link";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { HiMiniMinusSmall, HiMiniPlusSmall } from "react-icons/hi2";

const LORUM_IPSUM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";

const faqs = [
  {
    question: "Why make an open source Trello?",
    answer: LORUM_IPSUM,
  },
  {
    question: "What's the difference between Kan and Trello?",
    answer: LORUM_IPSUM,
  },
  {
    question: "How is the project funded?",
    answer: LORUM_IPSUM,
  },
  {
    question: "How do I import my Trello boards?",
    answer: LORUM_IPSUM,
  },
  {
    question: "How do I get a custom URL?",
    answer: LORUM_IPSUM,
  },
  {
    question: "Do you offer a free plan?",
    answer: LORUM_IPSUM,
  },
  {
    question: "What license are you using?",
    answer: LORUM_IPSUM,
  },
  {
    question: "How do I invite team members?",
    answer: LORUM_IPSUM,
  },
  {
    question: "How do I self-host?",
    answer: LORUM_IPSUM,
  },
];

const Faqs = () => {
  return (
    <div className="mx-auto max-w-[900px] px-4 pb-12">
      <div className="flex flex-col items-center justify-center pb-12">
        <div className="flex items-center gap-2 rounded-full border bg-light-50 px-4 py-1 text-center text-xs text-light-1000 dark:border-dark-300 dark:bg-dark-50 dark:text-dark-900 lg:text-sm">
          <p>FAQs</p>
        </div>

        <p className="mt-2 text-center text-3xl font-bold text-light-1000 dark:text-dark-1000 lg:text-4xl">
          Questions?
        </p>
        <p className="text:md mt-3 max-w-[600px] text-center text-dark-900 lg:text-lg">
          Find answers to common questions about the project. Can't find what
          you're looking for? Feel free to{" "}
          <Link href="mailto:support@kan.bn" className="underline">
            contact us
          </Link>
          .
        </p>
      </div>
      <div className="rounded-2xl bg-light-50 ring-1 ring-light-300 dark:bg-dark-50 dark:ring-dark-400">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-16">
          <div className="mx-auto max-w-4xl">
            <dl className="divide-y divide-light-300 dark:divide-dark-600">
              {faqs.map((faq) => (
                <Disclosure
                  key={faq.question}
                  as="div"
                  className="py-6 first:pt-0 last:pb-0"
                >
                  <dt>
                    <DisclosureButton className="group flex w-full items-start justify-between text-left text-light-1000 dark:text-dark-1000">
                      <span className="text-base/7 font-semibold">
                        {faq.question}
                      </span>
                      <span className="ml-6 flex h-7 items-center">
                        <HiMiniPlusSmall
                          aria-hidden="true"
                          className="size-6 group-data-[open]:hidden"
                        />
                        <HiMiniMinusSmall
                          aria-hidden="true"
                          className="size-6 group-[&:not([data-open])]:hidden"
                        />
                      </span>
                    </DisclosureButton>
                  </dt>
                  <DisclosurePanel as="dd" className="mt-2 pr-12">
                    <p className="text-[15px] leading-[1.7rem] text-light-800 dark:text-dark-600">
                      {faq.answer}
                    </p>
                  </DisclosurePanel>
                </Disclosure>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faqs;
