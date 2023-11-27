import Dashboard from "~/app/_components/dashboard";

export default function Layout(props: { children: React.ReactNode }) {
  return <Dashboard>{props.children}</Dashboard>;
}
