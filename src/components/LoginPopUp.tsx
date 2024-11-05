import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import Auth from "@/pages/Auth";

const LoginPopUp = () => {
  return (
    <Dialog>
      <DialogTrigger>
        Login
      </DialogTrigger>
      <DialogContent className="bg-[#111116] h-96 border-2 border-zinc-950 shadow-xl shadow-[#1A1A1F]">
        <DialogHeader>
        </DialogHeader>
          <Auth />
      </DialogContent>
    </Dialog>
  );
};

export default LoginPopUp;
