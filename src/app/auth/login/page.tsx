import { Login } from "~/app/_components/auth";

export default function LoginPage() {
  return (
    <main className="bg-dark-50 flex h-screen flex-col items-center justify-center">
      <h1 className="text-dark-1000 mb-6 text-lg font-normal tracking-tight">
        貫 kan
      </h1>
      <p className="text-dark-1000 mb-10 text-3xl">Get started</p>
      <div className="bg-dark-400 border-dark-600 w-full rounded-md border px-10 py-10 sm:max-w-md">
        <div className=" sm:mx-auto sm:w-full sm:max-w-sm">
          <Login />
        </div>
      </div>
      <p className="text-dark-1000 mt-10 text-center text-sm">
        {"Already have an account?"}
      </p>
    </main>
  );
}
