import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope, FaSmile } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser, resetRegistrationStatus } from "./authSlice";
import toast from "react-hot-toast";

const LoginRegister = () => {
  const [action, setAction] = useState(""); // form mode
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    isLoading,
    error: authError,
    isAuthenticated,
    registrationStatus,
  } = useSelector((state) => state.auth);

  const [loginUsername, setLoginUsername] = useState(""); // login field
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState(""); // register fields
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formErrors, setFormErrors] = useState({}); // form errors

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true }); // redirect if logged in
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (registrationStatus === "succeeded") {
      toast.success("Registration successful!"); // notify success
      setAction("");
      dispatch(resetRegistrationStatus());
      setRegisterName("");
      setRegisterUsername("");
      setRegisterEmail("");
      setRegisterPassword("");
      setAgreeTerms(false);
    }
  }, [registrationStatus, dispatch]);

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(
      loginUser({ usernameOrEmail: loginUsername, password: loginPassword })
    ); // dispatch login
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const newErrors = {}; // validation errors

    if (!registerName.trim()) newErrors.name = "Full Name is required.";
    if (!registerUsername.trim()) newErrors.username = "Username is required.";
    if (
      !registerEmail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail)
    )
      newErrors.email = "A valid email is required.";
    if (registerPassword.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (!agreeTerms) newErrors.terms = "You must agree to the terms.";

    setFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    dispatch(
      registerUser({
        name: registerName,
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
        role: "user",
      })
    ); // dispatch registration
  };

  const registerLink = (e) => {
    e.preventDefault();
    setAction("active");
    dispatch(resetRegistrationStatus()); // switch to register
  };

  const loginLink = (e) => {
    e.preventDefault();
    setAction("");
    dispatch(resetRegistrationStatus()); // switch to login
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/src/assets/images/bkg26.jpg')` }}
      />

      <div
        className={`relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-3xl overflow-hidden z-10 transition-all duration-700`}
      >
        <div
          className={`flex w-[200%] transition-transform duration-700 ${
            action === "active" ? "-translate-x-1/2" : "translate-x-0"
          }`}
        >
          {/* LOGIN */}
          <div
            className={`p-10 flex flex-col justify-center w-1/2 transition-opacity duration-700 ${
              action === "active"
                ? "opacity-50 pointer-events-none"
                : "opacity-100 pointer-events-auto"
            }`}
          >
            <form onSubmit={handleLogin}>
              <div className="text-center mb-10">
                <h1 className="text-5xl md:text-6xl font-extrabold mt-2 bg-linear-to-r from-gray-600 via-gray-400 to-white bg-clip-text text-transparent">
                  TaskFlows
                </h1>
                <p className="text-white/80 text-sm font-medium">Sign in</p>
              </div>

              <div className="relative mb-5">
                <input
                  type="text"
                  placeholder="Username or Email"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full h-14 bg-black/40 border border-white/20 rounded-2xl text-white px-5 pr-14 placeholder-white/50"
                />
                <FaUser className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50" />
              </div>

              <div className="relative mb-5">
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full h-14 bg-black/40 border border-white/20 rounded-2xl text-white px-5 pr-14 placeholder-white/50"
                />
                <FaLock className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50" />
              </div>

              {action !== "active" && authError && (
                <div className="mb-5 p-4 bg-red-500/20 border border-red-400/40 rounded-xl">
                  <p className="text-red-200 text-sm text-center">
                    {authError}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold rounded-2xl mb-6 disabled:opacity-50"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>

              <div className="text-center">
                <p className="text-white/85 text-sm">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={registerLink}
                    className="text-white font-bold hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          </div>

          {/* REGISTER */}
          <div
            className={`p-10 flex flex-col justify-center w-1/2 transition-opacity duration-700 ${
              action === "active"
                ? "opacity-100 pointer-events-auto"
                : "opacity-50 pointer-events-none"
            }`}
          >
            <form onSubmit={handleRegister}>
              <div className="text-center mb-6">
                <h1 className="text-2xl md:text-4xl font-extrabold bg-linear-to-r from-gray-600 via-gray-400 to-white bg-clip-text text-transparent">
                  Create Account
                </h1>
              </div>

              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className={`w-full h-12 bg-black/40 border rounded-xl text-white px-4 pr-12 placeholder-white/50 ${
                    formErrors.name ? "border-red-400" : "border-white/20"
                  }`}
                />
                <FaSmile className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50" />
                {formErrors.name && (
                  <p className="text-red-300 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  className={`w-full h-12 bg-black/40 border rounded-xl text-white px-4 pr-12 placeholder-white/50 ${
                    formErrors.username ? "border-red-400" : "border-white/20"
                  }`}
                />
                <FaUser className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50" />
                {formErrors.username && (
                  <p className="text-red-300 text-xs mt-1">
                    {formErrors.username}
                  </p>
                )}
              </div>

              <div className="relative mb-4">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className={`w-full h-12 bg-black/40 border rounded-xl text-white px-4 pr-12 placeholder-white/50 ${
                    formErrors.email ? "border-red-400" : "border-white/20"
                  }`}
                />
                <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50" />
                {formErrors.email && (
                  <p className="text-red-300 text-xs mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="relative mb-4">
                <input
                  type="password"
                  placeholder="Password (min 6 chars)"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className={`w-full h-12 bg-black/40 border rounded-xl text-white px-4 pr-12 placeholder-white/50 ${
                    formErrors.password ? "border-red-400" : "border-white/20"
                  }`}
                />
                <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50" />
                {formErrors.password && (
                  <p className="text-red-300 text-xs mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div className="mb-5">
                <label className="flex items-center text-white/85">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mr-3 accent-indigo-500 w-4 h-4"
                  />
                  I agree to the terms & conditions
                </label>
                {formErrors.terms && (
                  <p className="text-red-300 text-xs mt-1 ml-7">
                    {formErrors.terms}
                  </p>
                )}
              </div>

              {action === "active" && authError && (
                <div className="mb-5 p-4 bg-red-500/20 border border-red-400/40 rounded-xl">
                  <p className="text-red-200 text-sm text-center">
                    {authError}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={registrationStatus === "loading"}
                className="w-full h-12 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold rounded-xl mb-4 disabled:opacity-50"
              >
                {registrationStatus === "loading"
                  ? "Creating..."
                  : "Create Account"}
              </button>

              <div className="text-center">
                <p className="text-white/70 text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={loginLink}
                    className="text-white font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
