
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface SignInPasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  disabled?: boolean;
}

const SignInPasswordInput: React.FC<SignInPasswordInputProps> = ({
  value,
  onChange,
  showPassword,
  setShowPassword,
  disabled,
}) => (
  <div>
    <Label htmlFor="password" className="text-base font-medium">كلمة المرور</Label>
    <div className="relative mt-2">
      <Input
        id="password"
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        required
        className="h-12 text-base pr-12"
        disabled={disabled}
        placeholder="password"
        autoComplete="current-password"
      />
      <button
        type="button"
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
      >
        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  </div>
);

export default SignInPasswordInput;
