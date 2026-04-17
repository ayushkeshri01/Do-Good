"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Registration Form State
  const [prefix, setPrefix] = useState("");
  const [domain, setDomain] = useState("");
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  
  // OTP / Loading State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const urlError = searchParams.get("error");
  const parsedUrlError = urlError?.startsWith("Banned:")
    ? urlError.replace("Banned:", "")
    : urlError;

  useEffect(() => {
    fetch("/api/auth/domains")
      .then(r => r.json())
      .then(data => {
         if (data.domains) {
            setAllowedDomains(data.domains);
            if (data.domains.length > 0) {
               setDomain(data.domains[0]);
            }
         }
      })
      .catch(console.error);
  }, []);

  // Switches between Tabs safely
  const handleTabSwitch = (val: string) => {
     setActiveTab(val as any);
     setErrorMsg("");
     setOtpSent(false);
  };

  // ----- SIGN IN FLOW -----
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setErrorMsg("Invalid login credentials.");
        setIsLoading(false);
      } else {
        router.push("/feed");
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  // ----- SIGN UP FLOW (Step 1: Send OTP) -----
  const handleSendOtpForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefix || !domain || !password) {
       setErrorMsg("Please fill out all fields.");
       return;
    }
    
    if (password.length < 6) {
       setErrorMsg("Password must be at least 6 characters.");
       return;
    }

    const targetEmail = `${prefix}@${domain}`;
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setOtpSent(true);
        setEmail(targetEmail);
      } else {
        setErrorMsg(data.error || "Failed to send code");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // ----- SIGN UP FLOW (Step 2: Verify OTP & Register) -----
  const handleRegisterVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg("Please enter the complete 6-digit code");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    try {
       // 1. Submit the code -> registers DB User with hashed password
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           email,
           password,
           code: otpCode
        })
      });
      const data = await res.json();

      if (!res.ok) {
         setErrorMsg(data.error || "Registration failed");
         setIsLoading(false);
         return;
      }

      // 2. Immediately log the newly registered user in securely
      const result = await signIn("credentials", {
        redirect: false,
        email: email,
        password: password,
      });

      if (result?.error) {
        setErrorMsg("Successfully registered, but automatically logging in failed. Please use the Sign In tab.");
        setIsLoading(false);
      } else {
        router.push("/feed");
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("Failed to verify code and register.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4 font-sans">
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="text-center space-y-6 pb-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-primary/60 text-primary-foreground font-bold text-2xl shadow-lg ring-4 ring-primary/10">
            DG
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">Do-Good</CardTitle>
            <CardDescription className="text-base">
              Share social work and empower your community.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {(parsedUrlError || errorMsg) && (
             <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive font-medium animate-in slide-in-from-top-2">
               <AlertCircle className="h-5 w-5 flex-shrink-0" />
               <p>{errorMsg || parsedUrlError}</p>
             </div>
          )}

          {!otpSent ? (
            <Tabs value={activeTab} onValueChange={handleTabSwitch} className="w-full">
               <TabsList className="grid w-full grid-cols-2 mb-6">
                 <TabsTrigger value="signin">Sign In</TabsTrigger>
                 <TabsTrigger value="signup">Sign Up</TabsTrigger>
               </TabsList>
               
               {/* --- SIGN IN TAB --- */}
               <TabsContent value="signin" className="focus-visible:ring-0">
                 <form onSubmit={handleSignIn} className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                   <div className="space-y-2">
                     <Label>Company Email</Label>
                     <div className="relative">
                       <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                       <Input 
                         type="email" 
                         placeholder="you@company.com" 
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="pl-10"
                         required
                       />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <Label>Password</Label>
                     <div className="relative">
                       <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                       <Input 
                         type="password" 
                         placeholder="••••••••••" 
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="pl-10"
                         required
                       />
                     </div>
                   </div>
                   <Button className="w-full h-11 text-base font-semibold mt-2" disabled={isLoading}>
                     {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                     Sign In
                   </Button>
                 </form>
               </TabsContent>
               
               {/* --- SIGN UP TAB --- */}
               <TabsContent value="signup" className="focus-visible:ring-0">
                 <form onSubmit={handleSendOtpForm} className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                   <div className="space-y-2">
                     <Label>Company Email</Label>
                     <div className="flex items-center gap-2">
                       <Input 
                         type="text" 
                         placeholder="you" 
                         value={prefix}
                         onChange={(e) => setPrefix(e.target.value)}
                         className="w-1/2"
                         required
                       />
                       <span className="text-muted-foreground font-medium">@</span>
                       <select 
                         value={domain}
                         onChange={(e) => setDomain(e.target.value)}
                         className="flex h-9 w-1/2 items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                         required
                       >
                         {allowedDomains.length === 0 && <option value="" disabled>No domains</option>}
                         {allowedDomains.map(dom => (
                           <option key={dom} value={dom}>{dom}</option>
                         ))}
                       </select>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <Label>Create a Password</Label>
                     <div className="relative">
                       <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                       <Input 
                         type="password" 
                         placeholder="••••••••••" 
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="pl-10"
                         required
                         minLength={6}
                       />
                     </div>
                   </div>
                   <Button className="w-full h-11 text-base font-semibold focus:ring-2 mt-2" disabled={isLoading || allowedDomains.length === 0}>
                     {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                     Verify Email via Code
                   </Button>
                   {allowedDomains.length === 0 && (
                     <p className="text-xs text-muted-foreground text-center">No domains available. Please wait for an admin to configure them.</p>
                   )}
                 </form>
               </TabsContent>
            </Tabs>
          ) : (
             <form onSubmit={handleRegisterVerify} className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
                <div className="flex flex-col items-center justify-center space-y-3 text-center mb-6">
                  <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Check your email</h3>
                    <p className="text-sm text-muted-foreground">We've sent a 6-digit code to <span className="font-medium text-foreground">{email}</span></p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-center block">Enter Code to Register</Label>
                  <Input 
                    type="text" 
                    placeholder="123456" 
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="text-center text-2xl tracking-widest font-mono h-14"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Button className="w-full h-11 text-base font-semibold" disabled={isLoading || otpCode.length !== 6}>
                     {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                     Complete Registration
                  </Button>
                  <Button type="button" variant="ghost" className="w-full text-muted-foreground text-xs" onClick={() => {
                     setOtpSent(false);
                     setOtpCode("");
                     setErrorMsg("");
                  }} disabled={isLoading}>
                    Go back and change email
                  </Button>
                </div>
             </form>
          )}
        </CardContent>
        <CardFooter className="justify-center border-t border-border/50 bg-muted/20 py-4">
           <p className="text-xs text-muted-foreground text-center px-4">
             Do-Good Community &copy; {new Date().getFullYear()}
           </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse flex items-center gap-2"><div className="h-4 w-4 bg-primary rounded-full"></div> Loading...</div></div>}>
      <LoginContent />
    </Suspense>
  );
}
