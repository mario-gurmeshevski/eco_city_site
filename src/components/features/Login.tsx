import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { users } from "../../data/users";

interface User {
  id: number;
  name: string;
  surname: string;
  password: string;
  email: string;
  gender: string;
  age: number;
  municipality: string;
  points: number;
  co2saved: number;
  distanced: number;
  recyclings: number;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Load users from the imported data
  const loadUsers = (): User[] => {
    return users;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const users = await loadUsers();
      const user = users.find(
        (u) => u.email === email && u.password === password
      );
      console.log("Matched user:", user);

      if (user) {
        const userWithStats = {
          ...user,
          points: user.points ?? 0,
          co2saved: user.co2saved ?? 0,
          distanced: user.distanced ?? 0,
          recyclings: user.recyclings ?? 0,
        };

        console.log("Saving user to localStorage:", userWithStats);
        localStorage.setItem(
          "currentUser",
          JSON.stringify(userWithStats)
        );

        localStorage.setItem(
          "ecoCity_points",
          userWithStats.points.toString()
        );

        console.log("Dispatching userLoggedIn event");
        window.dispatchEvent(new Event("userLoggedIn"));
        window.dispatchEvent(new Event("userUpdated"));

        toast.success("Login successful! Redirecting...");
        navigate("/home");
      } else {
        toast.error("Invalid email or password");
      }
    } catch (err) {
      toast.error("An error occurred during login");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            EcoCity Login
          </h1>
          <p className="text-gray-600 mt-2">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-green-600 hover:underline"
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
