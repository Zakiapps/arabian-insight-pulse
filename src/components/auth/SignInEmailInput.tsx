
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignInEmailInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const SignInEmailInput: React.FC<SignInEmailInputProps> = ({ value, onChange, disabled }) => (
  <div>
    <Label htmlFor="email" className="text-base font-medium">البريد الإلكتروني</Label>
    <Input
      id="email"
      type="email"
      value={value}
      onChange={onChange}
      required
      className="mt-2 h-12 text-base"
      disabled={disabled}
      placeholder="admin@arabinsights.com"
      autoComplete="email"
    />
  </div>
);

export default SignInEmailInput;
