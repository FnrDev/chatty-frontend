import { useNavigate } from "react-router";
import { signIn } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"

function SignInForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError
  } = useForm()

  const navigate = useNavigate();
  const { setUser } = useAuth();

  async function onSubmit(data) {
    try {
      const user = await signIn(data);
      setUser(user);
      navigate('/workspaces')
    } catch (err) {
      setError("server", {
        type: "server",
        message: err.response?.data?.message || "Something went wrong",
      });
    }
  }

  return (
   <main className="flex h-[100vh] items-start">
    <div className="p-8 flex-1 flex-col flex">
      <div className="w-[80%] mt-5 mx-auto">
       <h1 className="text-2xl font-medium">Sign In</h1>
      <p className="mt-2 font-light text-white/70">Sign in with your existing account</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className="mt-10">
      <Field>
        <FieldLabel htmlFor="username">Username</FieldLabel>
        <Input {...register("username", {required: true})} placeholder="Jordan Lee" />
        {errors.username && <span className="text-red-500 text-sm">This field is required</span>}
      </Field>
      <Field>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <Input
          {...register("password", {required: true})}
          type="password"
          placeholder="Your Password"
        />
                {errors.password && <span className="text-red-500 text-sm">This field is required</span>}
      </Field>
      <Field orientation="horizontal">
        <Button type="submit" className="w-full">Submit</Button>
      </Field>
      {errors.server && <span className="text-red-500 text-sm">{errors.server.message}</span>}
      </FieldGroup>
      </form>
      </div>
    </div>
    <div className="flex-1 flex-col items-center justify-center p-8 bg-sidebar-accent bg-cover bg-center h-full w-full flex">
      <img src="/logo.svg" width={700} height={700} />
    </div>
   </main>
  );
}
export default SignInForm;
