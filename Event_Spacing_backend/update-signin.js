const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "../Event_Spacing_customer_ui/src/app/signin/page.tsx");
let content = fs.readFileSync(filePath, "utf8");

// 1. Add api import if missing
if (!content.includes('import { api } from "@/lib/api";')) {
  content = content.replace(
    'import { Logo } from "@/components/common/Logo";',
    'import { Logo } from "@/components/common/Logo";\nimport { api } from "@/lib/api";'
  );
}

// 2. Add devOtpHint state if missing
if (!content.includes("devOtpHint")) {
  content = content.replace(
    'const [errorMessage, setErrorMessage] = useState("");',
    'const [errorMessage, setErrorMessage] = useState("");\n  const [devOtpHint, setDevOtpHint] = useState("");'
  );
}

// 3. Replace handleSendOtp, handleVerifyOtp, handleEmailAuth, fillDemoCredentials
const oldHandlersRegex = /\/\*\*[\r\n\s]+?\* Sends or resends mock OTP[\s\S]*?fillDemoCredentials = \(role: UserRole\) => \{[\s\S]*?\};/;

const newHandlers = `/**
   * Sends real OTP code via the backend API.
   *
   * @param e - Form or button click event
   */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setDevOtpHint("");

    const cleanPhone = phoneNumber.replace(/\\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.sendOtp(cleanPhone);
      setIsLoading(false);
      setOtpSent(true);
      setCountdown(30);
      setOtpDigits(["", "", "", "", "", ""]);
      if (res.data?.devOtp) {
        setDevOtpHint(res.data.devOtp);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || "Failed to connect to authentication server. Please check backend.");
    }
  };

  /**
   * Verifies OTP code with MongoDB backend and persists auth token.
   *
   * @param e - Form submission event
   */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join("");
    if (enteredCode.length < 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    const cleanPhone = phoneNumber.replace(/\\D/g, "");
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await api.auth.verifyOtp(cleanPhone, enteredCode, fullName || undefined);
      setIsLoading(false);
      setAuthSuccess(true);

      if (res.data?.token) {
        localStorage.setItem("es_auth_token", res.data.token);
        localStorage.setItem("es_user", JSON.stringify(res.data.user));
      }

      setTimeout(() => {
        router.push(userRole === "partner" ? "/list-your-venue" : "/venues");
      }, 1200);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || "Invalid or expired OTP code.");
    }
  };

  /**
   * Handles Email & Password submission via backend API.
   *
   * @param e - Form event
   */
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please provide both email address and password.");
      return;
    }

    setIsLoading(true);

    try {
      let res;
      if (authMode === "signin") {
        res = await api.auth.login({ email, password });
      } else {
        res = await api.auth.register({
          name: fullName || "Event Host",
          email,
          password,
          role: userRole === "partner" ? "vendor" : "organizer",
          companyName: companyName || undefined,
        });
      }

      setIsLoading(false);
      setAuthSuccess(true);

      if (res.data?.token) {
        localStorage.setItem("es_auth_token", res.data.token);
        localStorage.setItem("es_user", JSON.stringify(res.data.user));
      }

      setTimeout(() => {
        router.push(userRole === "partner" ? "/list-your-venue" : "/venues");
      }, 1200);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || "Authentication failed. Please verify your credentials.");
    }
  };

  /**
   * Fills demo credentials for quick preview.
   *
   * @param role - Target demo role
   */
  const fillDemoCredentials = (role: UserRole) => {
    setUserRole(role);
    setLoginMethod("email");
    setAuthMode("signin");
    setErrorMessage("");
    if (role === "organizer") {
      setEmail("raghav.rao@gmail.com");
      setPassword("Password@123");
    } else {
      setEmail("admin@eventspacing.com");
      setPassword("Admin@123");
    }
  };`;

content = content.replace(oldHandlersRegex, newHandlers);

// 4. Add dev OTP hint banner in OTP form if missing
if (!content.includes("Generated Dev OTP")) {
  content = content.replace(
    '<div className="flex items-center justify-between text-xs text-gray-600 bg-purple-50/60 p-3 rounded-xl border border-purple-100">',
    `{devOtpHint && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs py-2 px-3 rounded-xl text-center space-y-1">
                      <div>🔑 Generated Dev OTP: <strong className="font-mono text-sm tracking-widest text-amber-950">{devOtpHint}</strong></div>
                      <div className="text-[11px] text-amber-700">Master test code: <strong>123456</strong></div>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-600 bg-purple-50/60 p-3 rounded-xl border border-purple-100">`
  );
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Successfully updated signin/page.tsx!");

