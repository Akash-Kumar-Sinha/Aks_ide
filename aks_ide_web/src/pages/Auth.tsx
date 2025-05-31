import { useState } from "react";
import axios from "axios";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button/Button";
import { Loading } from "../components/ui/Loading/Loading";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../components/ui/Dialog/Dialog";
import { Input } from "../components/ui/Input/Input";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

type LOGIN_STATUS = "AUTH" | "SENT" | "PASSWORD";

const Auth = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<LOGIN_STATUS>("AUTH");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

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

  // Handle input change for custom Input component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEmailChange = (value: string, isValid: boolean) => {
    setValue("email", value, { shouldValidate: true });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePasswordChange = (value: string, isValid: boolean) => {
    setValue("password", value, { shouldValidate: true });
  };

  return (
    <Dialog
      open={authOpen}
      onOpenChange={setAuthOpen}
      scale="xl"
      scrollable={true}
      scrollDirection="vertical"
      scrollVariant="gradient"
      resizable={true}
    >
      <DialogTrigger asChild>
        <Button className="rounded-full text-xs">Login</Button>
      </DialogTrigger>
      <DialogHeader>
        <DialogTitle>Authentication</DialogTitle>
        <DialogDescription>
          Please login to access this feature.
        </DialogDescription>
      </DialogHeader>

      <DialogBody>
        {message && (
          <p className="text-red-500 font-medium text-xs text-center">
            {message}
          </p>
        )}

        {loading ? (
          <Loading scale="sm" pattern="dots" />
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-4"
          >
            {(status === "AUTH" || status === "SENT") && (
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email"
                label="Email"
                required={true}
                disabled={status === "SENT"}
                onInputChange={handleEmailChange}
                validationResult={
                  errors.email
                    ? {
                        isValid: false,
                        message: errors.email.message as string,
                      }
                    : null
                }
                enableValidation={true}
              />
            )}

            {status === "PASSWORD" && (
              <>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter Password"
                  label="Password"
                  required={true}
                  onInputChange={handlePasswordChange}
                  validationResult={
                    errors.password
                      ? {
                          isValid: false,
                          message: errors.password.message as string,
                        }
                      : null
                  }
                  enableValidation={true}
                />
                <Button
                  type="submit"
                  className="w-full py-3 bg-indigo-500 text-[#EBEBEF] font-semibold rounded-lg hover:bg-indigo-600 transition-all duration-300 shadow-md"
                >
                  Login
                </Button>
              </>
            )}

            {status !== "PASSWORD" && (
              <Button
                type="button"
                onClick={sentVerificationLink}
                className="w-full py-3 bg-[#7554ad] text-[#EBEBEF] font-semibold rounded-lg hover:bg-[#5b3f8b] transition-all duration-300 shadow-md"
              >
                {status === "SENT" ? "Next" : "Send Verification Link"}
              </Button>
            )}
          </form>
        )}
      </DialogBody>
    </Dialog>
  );
};

export default Auth;
