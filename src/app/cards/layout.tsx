import Dashboard from "~/app/components/dashboard";

export default function Layout(props: { children: React.ReactNode }) {
  return <Dashboard>{props.children}</Dashboard>;
}
