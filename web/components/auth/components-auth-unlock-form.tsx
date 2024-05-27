import { loginAction } from "@/lib/action";
import IconLock from "../icon/icon-lock";

const ComponentsAuthUnlockForm = () => {
  return (
    <form className="space-y-5" action={loginAction}>
      <button
        type="submit"
        className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
      >
        <IconLock className="h-4 w-4 shrink-0 ltr:mr-1.5 rtl:ml-1.5" />
        AUTHENTICATE
      </button>
    </form>
  );
};

export default ComponentsAuthUnlockForm;
