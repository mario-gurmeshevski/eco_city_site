import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { users } from "../../data/users";

interface UserFormData {
  name: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  age: number;
  municipality: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    age: 18,
    municipality: "",
  });
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "age" ? parseInt(value) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (
      !formData.name ||
      !formData.surname ||
      !formData.email ||
      !formData.password ||
      !formData.gender ||
      !formData.municipality
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if email already exists in the imported users
    const emailExists = users.some(
      (user: any) => user.email === formData.email
    );
    if (emailExists) {
      toast.error("Email already registered");
      return;
    }

    // Create new user
    const newUser = {
      id:
        users.length > 0
          ? Math.max(...users.map((u: any) => u.id)) + 1
          : 1,
      name: formData.name,
      surname: formData.surname,
      email: formData.email,
      password: formData.password,
      gender: formData.gender,
      age: formData.age,
      municipality: formData.municipality,
      points: 0, // Initialize with 0 points
      co2saved: 0,
      distanced: 0,
      recyclings: 0,
      walking: 0,
      biking: 0,
      public_transport: 0,
      car: 0,
    };

    // Store the new user as the current user
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    // Show success message and redirect
    toast.success("Registration successful! You can now log in.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            EcoCity Register
          </h1>
          <p className="text-gray-600 mt-2">Create a new account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="name"
                className="block text-gray-700 mb-2"
              >
                First Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="First name"
              />
            </div>
            <div>
              <label
                htmlFor="surname"
                className="block text-gray-700 mb-2"
              >
                Last Name *
              </label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 mb-2"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 mb-2"
            >
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your password"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 mb-2"
            >
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Confirm your password"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="gender"
                className="block text-gray-700 mb-2"
              >
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="age"
                className="block text-gray-700 mb-2"
              >
                Age *
              </label>
              <input
                type="number"
                id="age"
                name="age"
                min="18"
                max="100"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="municipality"
              className="block text-gray-700 mb-2"
            >
              Municipality *
            </label>
            <input
              type="text"
              id="municipality"
              name="municipality"
              value={formData.municipality}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your municipality"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Register
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-green-600 hover:underline"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
