import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Leaf, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { countries, roles, currencies } from "@/data/mock";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const steps = ["Account", "Verify", "Location", "Role", "Currency"];

const Signup = () => {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [country, setCountry] = useState("");
  const [county, setCounty] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [currency, setCurrency] = useState("");
  const navigate = useNavigate();

  const selectedCountry = countries.find((c) => c.name === country);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
  };

  const handleFinish = () => navigate("/");

  const canNext = () => {
    if (step === 0) return email && password;
    if (step === 1) return otp.length === 6;
    if (step === 2) return country && county;
    if (step === 3) return selectedRoles.length > 0;
    if (step === 4) return currency;
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-2">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Create Account</CardTitle>
          {/* Progress */}
          <div className="flex gap-1 justify-center mt-3">
            {steps.map((s, i) => (
              <div key={s} className={`h-1.5 w-8 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{steps[step]}</p>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <div className="space-y-4">
              <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
              <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password" /></div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to {email}</p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-muted-foreground">(Demo: enter any 6 digits)</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Country</Label>
                <Select value={country} onValueChange={(v) => { setCountry(v); setCounty(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>{countries.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {selectedCountry && (
                <div>
                  <Label>County / Region</Label>
                  <Select value={county} onValueChange={setCounty}>
                    <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                    <SelectContent>{selectedCountry.counties.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Select your role(s)</p>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <Badge
                    key={role}
                    variant={selectedRoles.includes(role) ? "default" : "outline"}
                    className="cursor-pointer py-2 px-3 text-sm transition-colors"
                    onClick={() => toggleRole(role)}
                  >
                    {selectedRoles.includes(role) && <Check className="w-3 h-3 mr-1" />}
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Label>Preferred Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                <SelectContent>{currencies.map((c) => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.name} ({c.code})</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 mt-6">
            {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-1"><ArrowLeft className="w-4 h-4" /> Back</Button>}
            <Button className="flex-1 gap-1" disabled={!canNext()} onClick={step < 4 ? () => setStep(step + 1) : handleFinish}>
              {step < 4 ? <>Next <ArrowRight className="w-4 h-4" /></> : <>Get Started <Check className="w-4 h-4" /></>}
            </Button>
          </div>

          {step === 0 && (
            <p className="text-center text-sm mt-4 text-muted-foreground">
              Already have an account? <Link to="/auth/login" className="text-primary font-semibold hover:underline">Sign In</Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
