import { useState } from "react";
import axios from "axios";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { BsGoogle } from "react-icons/bs";

import { Button } from "@/components/ui/button";
import InputForm from "@/components/InputForm";
import Loading from "@/components/Loading";

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
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setLoading(true);
    try {
      if (status === "PASSWORD") {
        const response = await axios.post(
          `${SERVER_URL}/auth/create_user`,
          data
        );
        if (response.data.success === true) {
          document.cookie = `${import.meta.env.VITE_REFRESH_TOKEN_NAME}=${
            response.data.refreshToken
          }`;
          localStorage.setItem(
            import.meta.env.VITE_ACCESS_TOKEN_NAME,
            response.data.accessToken
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
        const response = await axios.post(
          `${SERVER_URL}/auth/send_token`,
          formData
        );
        if (response.data.Route === "PASSWORD") {
          setStatus("PASSWORD");
          setMessage(null);
          return;
        }
        if (response.data.Route === "SENT") {
          setStatus("SENT");
          setMessage("Verification link sent to your email");
          return;
        }
        if (response.data.Route === "AUTH") {
          setMessage("Try Login through Google");
          return;
        }
      } else if (status === "SENT") {
        const response = await axios.post(
          `${SERVER_URL}/auth/check_email`,
          formData
        );
        if (response.data.Route === "PASSWORD") {
          setStatus("PASSWORD");
          setMessage(null);
        }
        if (response.data.Route === "SENT") {
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

  const handleLogin = () => {
    console.log("Logging in with Google");
    window.location.href = `${SERVER_URL}/auth/google`;
  };

  return (
    <div className="absolute top-0 h-full flex justify-center items-center w-full">
      <div className="bg-[#EBEBEF] p-8 shadow-xl rounded-2xl w-full max-w-sm flex flex-col items-center space-y-6">
        {loading && <Loading size={22} />}

        <h2 className="text-2xl font-bold text-[#1C1D2C]">Login</h2>

        {message && (
          <p className="text-red-500 font-medium text-xs text-center">
            {message}
          </p>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-4"
        >
          {(status === "AUTH" || status === "SENT") && (
            <InputForm
              id="email"
              type="email"
              placeholder="Enter email"
              register={register}
              required={true}
              errors={errors}
              disabled={status === "SENT"}
            />
          )}

          {status === "PASSWORD" && (
            <>
              <InputForm
                id="password"
                type="password"
                placeholder="Enter Password"
                required={true}
                register={register}
                errors={errors}
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

        {status === "AUTH" && (
          <Button
            className="mt-4 flex items-center justify-center w-full py-3 bg-[#1C1D2C] text-[#EBEBEF] border-2 border-[#1C1D2C] rounded-lg hover:bg-[#EBEBEF] hover:text-[#1C1D2C] transition-all duration-300 shadow-md"
            onClick={handleLogin}
          >
            <BsGoogle className="mr-2 text-2xl" />
            <span className="font-semibold">Login with Google</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Auth;
