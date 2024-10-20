import { useState } from "react";
import axios from "axios";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { BsGoogle } from "react-icons/bs";

import { Button } from "@/components/ui/button";
import InputForm from "@/components/InputForm";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

type LOGIN_STATUS = "AUTH" | "SENT" | "PASSWORD";

const Auth = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<LOGIN_STATUS>("AUTH");
  const [message, setMessage] = useState<string | null>(null);

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
    try {
      if (status === "PASSWORD") {
        const response = await axios.post(
          `${SERVER_URL}/auth/create_user`,
          data
        );
        if (response.data.success === true) {
          document.cookie = `accessToken=${response.data.accessToken}`;
          navigate("/home");
        }
      }
    } catch (error) {
      console.error("Error during user creation:", error);
    }
  };

  const sentVerificationLink = async () => {
    const formData = watch();
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
        if(response.data.Route === "AUTH") {
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
    }
  };

  const handleLogin = () => {
    console.log("Logging in with Google");
    window.location.href = `${SERVER_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="bg-white p-8 shadow-lg rounded-2xl w-full max-w-sm flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>
        {message && <p className="text-red-500 mb-4 font-medium text-xs">{message}</p>}
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
              disabled={status === ("SENT" as LOGIN_STATUS)}
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
                className="w-full py-3 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition-all duration-300"
              >
                Login
              </Button>
            </>
          )}

          {status !== "PASSWORD" && (
            <Button
              type="button"
              onClick={sentVerificationLink}
              className="w-full py-3 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition-all duration-300"
            >
              {status === "SENT" ? "Next" : "Send Verification Link"}
            </Button>
          )}
        </form>

        {status === "AUTH" && (
          <Button
            className="mt-4 flex items-center justify-center w-full py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-300"
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
