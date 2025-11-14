/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { api } from "@/data/api";

export default function CreateUserPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [contactType, setContactType] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    // Add Select fields manually
    formData.append("contactType", contactType);
    formData.append("role", role);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${api}/auth/admin/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        setSuccess("Failed to create user");
        setLoading(false);
        return;
      }

      setSuccess(`User created: ${data.data.contact}`);
    } catch (err: any) {
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md"
    >
      <h1 className="text-xl font-semibold mb-4">Create User (Admin)</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Full Name (Bangla)</Label>
          <Input name="fullNameBangla" required />
        </div>

        <div>
          <Label>Full Name (English)</Label>
          <Input name="fullNameEnglish" required />
        </div>

        <div>
          <Label>Contact</Label>
          <Input name="contact" required />
        </div>

        {/* CONTACT TYPE */}
        <div>
          <Label>Contact Type</Label>
          <Select onValueChange={setContactType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ROLE */}
        <div>
          <Label>Role</Label>
          <Select onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="volunteer">Volunteer</SelectItem>
              <SelectItem value="representative">Representative</SelectItem>
              <SelectItem value="recognition">Recognition</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Profile Image</Label>
          <Input type="file" name="profileImage" />
        </div>

        <Button disabled={loading} type="submit" className="w-full">
          {loading ? "Creating..." : "Create User"}
        </Button>

        {success && <p className="text-green-600 text-sm">{success}</p>}
      </form>
    </motion.div>
  );
}
