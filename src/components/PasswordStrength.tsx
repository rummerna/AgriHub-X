import { Check, X } from "lucide-react";

const criteria = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export const isPasswordStrong = (password: string) => criteria.every((c) => c.test(password));

const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;

  const passed = criteria.filter((c) => c.test(password)).length;
  const percentage = (passed / criteria.length) * 100;

  return (
    <div className="space-y-2 mt-2">
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            percentage <= 40 ? "bg-destructive" : percentage <= 80 ? "bg-accent" : "bg-primary"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <ul className="space-y-1">
        {criteria.map((c) => {
          const met = c.test(password);
          return (
            <li key={c.label} className={`flex items-center gap-1.5 text-xs ${met ? "text-primary" : "text-destructive"}`}>
              {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              {c.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordStrength;
