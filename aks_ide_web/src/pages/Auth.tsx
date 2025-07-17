import { useState } from "react";
import axios from "axios";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { Loading } from "../components/ui/Loading/Loading";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

type LOGIN_STATUS = "AUTH" | "SENT" | "PASSWORD";

const Auth = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<LOGIN_STATUS>("AUTH");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const schema = z.object({
    email: z.string().email({ message: "Invalid email" }),
    password: z
      .string()
      .min(6, { message: "Password should be more than 5 digits" }),
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setLoading(true);
    try {
      console.log(data);
      if (status === "PASSWORD") {
        const response = await axios.post(`${SERVER_URL}/auth/create_user`, {
          email: data.email,
          password: data.password,
        });
        console.log(response.data);
        if (response.data.success === true) {
          document.cookie = `${import.meta.env.VITE_REFRESH_TOKEN_NAME}=${
            response.data.refresh_token
          }`;
          localStorage.setItem(
            import.meta.env.VITE_ACCESS_TOKEN_NAME,
            response.data.access_token
          );
          navigate("/");
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Error during user creation:", error);
    } finally {
      setLoading(false);
    }
  };

  const sentVerificationLink = async () => {
    const formData = watch();
    if (formData.email === "") {
      setMessage("Please Enter you Email!");
      return;
    }
    setLoading(true);
    try {
      if (status === "AUTH") {
        const response = await axios.post(`${SERVER_URL}/auth/send_token`, {
          email: formData.email,
        });
        console.log(response.data);
        if (response.data.route === "PASSWORD") {
          setStatus("PASSWORD");
          setMessage(null);
          return;
        }
        if (response.data.route === "SENT") {
          setStatus("SENT");
          setMessage("Verification link sent to your email");
          return;
        }
        if (response.data.route === "AUTH") {
          setMessage("Try Login through Google");
          return;
        }
      } else if (status === "SENT") {
        const response = await axios.post(`${SERVER_URL}/auth/check_email`, {
          email: formData.email,
        });
        if (response.data.route === "PASSWORD") {
          setStatus("PASSWORD");
          setMessage(null);
        }
        if (response.data.route === "SENT") {
          setStatus("SENT");
          setMessage("You need to verify your Email");
        }
      }
    } catch (error) {
      console.error("Error sending verification link:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("email", e.target.value, { shouldValidate: true });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("password", e.target.value, { shouldValidate: true });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-full text-xs bg-blue-500 hover:bg-blue-600 text-white">
          <LogIn />
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#000000] border-[#333333] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#cccccc]">Authentication</DialogTitle>
          <DialogDescription className="text-[#808080]">
            Please login to access this feature.
          </DialogDescription>
        </DialogHeader>

        {message && (
          <p className="text-[#f85149] font-medium text-xs text-center bg-[#1a1a1a] border border-[#f85149]/30 rounded p-2">
            {message}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loading scale="sm" pattern="dots" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-4"
          >
            {(status === "AUTH" || status === "SENT") && (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[#cccccc]"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  required={true}
                  disabled={status === "SENT"}
                  onChange={handleEmailChange}
                  className={`bg-[#333333] border-[#333333] text-[#cccccc] placeholder-[#808080] focus:border-[#569cd6] focus:ring-0 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs">
                    {errors.email.message as string}
                  </p>
                )}
              </div>
            )}

            {status === "PASSWORD" && (
              <>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[#cccccc]"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter Password"
                    required={true}
                    onChange={handlePasswordChange}
                    className={`bg-[#333333] border-[#333333] text-[#cccccc] placeholder-[#808080] focus:border-[#569cd6] focus:ring-0 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                  />
                  {errors.password && (
                    <p className="text-red-400 text-xs">
                      {errors.password.message as string}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full py-3 bg-[#569cd6] text-white font-semibold rounded-lg hover:bg-[#4a8bc2] transition-all duration-300 shadow-md"
                >
                  Login
                </Button>
              </>
            )}

            {status !== "PASSWORD" && (
              <Button
                type="button"
                onClick={sentVerificationLink}
                className="w-full py-3 bg-[#569cd6] text-white font-semibold rounded-lg hover:bg-[#4a8bc2] transition-all duration-300 shadow-md"
              >
                {status === "SENT" ? "Next" : "Send Verification Link"}
              </Button>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Auth;
