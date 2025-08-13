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
import { motion } from "framer-motion";
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
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Button className="rounded-full text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-primary-foreground)]">
            <LogIn />
          </Button>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="bg-[var(--color-background)] border-[var(--color-border)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[var(--color-foreground)]">
            Authentication
          </DialogTitle>
          <DialogDescription className="text-[var(--color-muted-foreground)]">
            Please login to access this feature.
          </DialogDescription>
        </DialogHeader>

        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[var(--color-destructive)] font-medium text-xs text-center bg-[var(--color-background)] border border-[var(--color-destructive)]/30 rounded p-2"
          >
            {message}
          </motion.p>
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
                  className="text-sm font-medium text-[var(--color-foreground)]"
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
                  className={`bg-[var(--color-input)] border-[var(--color-border)] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:ring-0 ${
                    errors.email ? "border-[var(--color-destructive)]" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-[var(--color-destructive)] text-xs">
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
                    className="text-sm font-medium text-[var(--color-foreground)]"
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
                    className={`bg-[var(--color-input)] border-[var(--color-border)] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:ring-0 ${
                      errors.password ? "border-[var(--color-destructive)]" : ""
                    }`}
                  />
                  {errors.password && (
                    <p className="text-[var(--color-destructive)] text-xs">
                      {errors.password.message as string}
                    </p>
                  )}
                </div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    type="submit"
                    className="w-full py-3 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold rounded-lg hover:bg-[var(--color-primary)]/90 transition-all duration-300 shadow-md"
                  >
                    Login
                  </Button>
                </motion.div>
              </>
            )}

            {status !== "PASSWORD" && (
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  type="button"
                  onClick={sentVerificationLink}
                  className="w-full py-3 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold rounded-lg hover:bg-[var(--color-primary)]/90 transition-all duration-300 shadow-md"
                >
                  {status === "SENT" ? "Next" : "Send Verification Link"}
                </Button>
              </motion.div>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Auth;
