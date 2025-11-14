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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { api } from "@/data/api";

export default function CreateUserWithModal() {
  // MAIN FORM MODAL control
  const [formModalOpen, setFormModalOpen] = useState(false);

  // SUCCESS/ERROR MODAL control
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");

  // Input values
  const [loading, setLoading] = useState(false);
  const [contactType, setContactType] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
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
        // Close FORM modal → Open ERROR modal
        setFormModalOpen(false);
        setModalType("error");
        setModalMessage(data.message || "Failed to create user");
        setResultModalOpen(true);
        setLoading(false);
        return;
      }

      // Close FORM modal → Open SUCCESS modal
      setFormModalOpen(false);
      setModalType("success");
      setModalMessage(`User created: ${data.data.contact}`);
      setResultModalOpen(true);
    } catch (error) {
      setFormModalOpen(false);
      setModalType("error");
      setModalMessage("Something went wrong. Try again.");
      setResultModalOpen(true);
    }

    setLoading(false);
  };

  return (
    <>
      {/* BUTTON TO OPEN MAIN FORM */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogTrigger asChild>
          <Button>Create User</Button>
        </DialogTrigger>

        {/* FORM MODAL */}
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create User (Admin)</DialogTitle>
          </DialogHeader>

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

            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* SUCCESS + ERROR MODAL */}
      <Dialog open={resultModalOpen} onOpenChange={setResultModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle
              className={`${
                modalType === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {modalType === "success" ? "Success" : "Error"}
            </DialogTitle>
          </DialogHeader>

          <p className="text-gray-700 text-sm">{modalMessage}</p>

          <DialogFooter>
            <Button onClick={() => setResultModalOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
