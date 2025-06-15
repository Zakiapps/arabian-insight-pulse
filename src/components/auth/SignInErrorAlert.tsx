
import React from "react";

interface SignInErrorAlertProps {
  message: string | null;
}

const SignInErrorAlert: React.FC<SignInErrorAlertProps> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm text-center mb-2">
      {message}
    </div>
  );
};

export default SignInErrorAlert;
