"use client";

import { useState } from "react";
import ModalOverlay from "@/app/cases/_components/ModalOverlay";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">(initialTab);

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      {tab === "login" ? (
        <LoginForm
          onSuccess={onClose}
          onSwitchToSignup={() => setTab("signup")}
        />
      ) : (
        <SignupForm
          onSuccess={onClose}
          onSwitchToLogin={() => setTab("login")}
        />
      )}
    </ModalOverlay>
  );
}
