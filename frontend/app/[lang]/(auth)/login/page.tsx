import { Button } from "@/ui/Button";
import { TextField } from "@/ui/Fields";

export default function Login() {
  return (
    <form>
      <div className="space-y-6">
        <TextField
          label="Email address"
          id="email"
          className={""}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <TextField
          label="Password"
          id="password"
          name="password"
          className={""}
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {/**@ts-ignore */}
      <Button type="submit" color="cyan" className="mt-8 w-full">
        Sign in to account
      </Button>
    </form>
  );
}
