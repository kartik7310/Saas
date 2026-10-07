"use client"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User, Phone, ShoppingBag, Store, Hammer, Briefcase, ChevronLeft, ShieldCheck, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/AuthContext"

interface AuthFormProps {
  onSuccess?: () => void;
  onSwitchMode: () => void;
  isAddPropertyIntent?: boolean;
}

export function OTPStep({ email, type, onSuccess, onBack, isAddPropertyIntent }: {
  email: string;
  type: 'VERIFICATION' | 'LOGIN';
  onSuccess: () => void;
  onBack: () => void;
  isAddPropertyIntent?: boolean;
}) {
  const { verifyOTP, verifyOTPLogin, initiateOTPLogin } = useAuth()
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendTimer, setResendTimer] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return setError("Enter 6-digit code")

    setIsLoading(true)
    setError("")

    try {
      const res = type === 'VERIFICATION' ? await verifyOTP(email, otp) : await verifyOTPLogin(email, otp);

      if (res.success) {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || "Invalid verification code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await initiateOTPLogin(email);
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError("Failed to resend code");
    }
  }

  if (error === "verified_pending") {
    return (
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Email Verified!</h2>
          <p className="text-sm text-muted-foreground">
            Your account is now pending admin approval. You will receive an email once your profile is reviewed.
          </p>
        </div>
        <Button onClick={onSuccess} className="w-full h-11">Got it</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
        <ChevronLeft size={14} />
        Back
      </button>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">We sent a 6-digit code to <span className="font-bold text-foreground">{email}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-2">
          <Input
            type="text"
            maxLength={6}
            placeholder="000000"
            className="h-14 text-center text-3xl font-black tracking-[0.5em] bg-background/50 border-border focus:border-primary transition-all duration-300"
            required
            autoFocus
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          />
        </div>

        <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={isLoading || otp.length < 6}>
          {isLoading ? "Verifying..." : "Verify & Continue"}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendTimer > 0}
            className="text-sm font-bold text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
          >
            {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive code? Resend"}
          </button>
        </div>
      </form>
    </div>
  )
}

export function LoginForm({ onSuccess, onSwitchMode, isAddPropertyIntent }: AuthFormProps) {
  const { initiateOTPLogin } = useAuth()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await initiateOTPLogin(email)
      setStep('OTP')
    } catch (err: any) {
      setError(err.message || "Invalid email")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'OTP') {
    return <OTPStep email={email} type="LOGIN" onSuccess={() => onSuccess?.()} onBack={() => setStep('FORM')} isAddPropertyIntent={isAddPropertyIntent} />
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Log in to manage your premium real estate</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl animate-shake">
            {error}
          </div>
        )}

        <Field>
          <FieldLabel>Email address</FieldLabel>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <Mail size={16} />
            </div>
            <Input
              type="email"
              placeholder="name@example.com"
              className="pl-10 h-11 bg-background/50 border-border focus:border-primary transition-all duration-300"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </Field>

        <Button
          type="submit"
          className="w-full h-11 text-sm font-semibold transition-all duration-300"
          disabled={isLoading}
        >
          {isLoading ? "Sending code..." : "Send Login Code"}
        </Button>

        <div className="text-center text-sm pt-2">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <button
            type="button"
            onClick={onSwitchMode}
            className="font-semibold text-primary hover:underline underline-offset-4"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  )
}

interface SignupFormProps extends AuthFormProps {
  hideBuyer?: boolean;
}

export function SignupForm({ onSuccess, onSwitchMode, hideBuyer = false, isAddPropertyIntent }: SignupFormProps) {
  const { registerUser } = useAuth()
  const [role, setRole] = useState<"BUYER" | "SELLER" | "BUILDER" | "BROKER">(hideBuyer ? "SELLER" : "BUYER")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!/^[5-9]\d{9}$/.test(phone)) {
      setIsLoading(false)
      return setError("Mobile number must be 10 digits starting with 5  ,6,7,8 or 9")
    }

    try {
      const normalizedUser = { name, email, role, phone };
      const res = await registerUser(normalizedUser)

      if (res.requiresVerification) {
        setStep('OTP')
      } else {
        onSuccess?.()
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'OTP') {
    return <OTPStep email={email} type="VERIFICATION" onSuccess={() => onSuccess?.()} onBack={() => setStep('FORM')} isAddPropertyIntent={isAddPropertyIntent} />
  }

  const roleIcons = {
    BUYER: ShoppingBag,
    SELLER: Store,
    BUILDER: Hammer,
    BROKER: Briefcase,
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold tracking-tight">Create an account</h1>
        <p className="text-xs text-muted-foreground">Join our premium real estate community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl animate-shake">
            {error}
          </div>
        )}

        {/* Role Selection */}
        <div className={cn(
          "grid gap-2",
          hideBuyer ? "grid-cols-3" : "grid-cols-4"
        )}>
          {(["BUYER", "SELLER", "BUILDER", "BROKER"] as const)
            .filter(r => !(hideBuyer && r === "BUYER"))
            .map((r) => {
              const Icon = roleIcons[r];
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-xl border transition-all gap-1",
                    role === r
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background border-border hover:border-primary/50"
                  )}
                >
                  <Icon size={16} />
                  <span className="text-[10px] font-medium capitalize">{r === "SELLER" ? "Sell/Rent" : r === "BROKER" ? "partner" : r.toLowerCase()}</span>
                </button>
              )
            })}
        </div>

        <Field>
          <FieldLabel>Full Name</FieldLabel>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <User size={16} />
            </div>
            <Input
              placeholder="John Doe"
              className="pl-10 h-11 bg-background/50 border-border focus:border-primary transition-all duration-300"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </Field>

        <Field>
          <FieldLabel>Email address</FieldLabel>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <Mail size={16} />
            </div>
            <Input
              type="email"
              placeholder="name@example.com"
              className="pl-10 h-11 bg-background/50 border-border focus:border-primary transition-all duration-300"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </Field>

        <Field>
          <FieldLabel>Mobile Number</FieldLabel>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <Phone size={16} />
            </div>
            <Input
              type="tel"
              placeholder="10-digit mobile number"
              className={`pl-10 h-11 bg-background/50 border-border focus:border-primary transition-all duration-300 ${phone && !/^[5-9]\d{9}$/.test(phone) ? 'border-destructive focus:border-destructive' : ''}`}
              required
              maxLength={10}
              minLength={10}
              pattern="[5-9][0-9]{9}"
              title="Mobile number must be 10 digits starting with 5, 6, 7, 8, or 9"
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 10) setPhone(val);
              }}
            />
          </div>
          {phone && !/^[5-9]\d{9}$/.test(phone) && (
            <p className="text-destructive text-[10px] font-semibold mt-1 px-1">
              Must be 10 digits starting with 5,6,7,8 or 9
            </p>
          )}
        </Field>

        <Button
          type="submit"
          className="w-full h-11 text-sm font-semibold transition-all duration-300"
          disabled={isLoading || phone.length < 10 || !/^[5-9]\d{9}$/.test(phone)}
        >
          {isLoading ? "Sending code..." : "Sign up"}
        </Button>

        <div className="text-center text-sm pt-2">
          <span className="text-muted-foreground">Already have an account? </span>
          <button
            type="button"
            onClick={onSwitchMode}
            className="font-semibold text-primary hover:underline underline-offset-4"
          >
            Log in
          </button>
        </div>
      </form>
    </div>
  )
}
