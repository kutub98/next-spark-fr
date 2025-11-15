/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle } from "lucide-react";
import { api } from "@/data/api";

export default function CreateUserWithModal() {
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);

  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");

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
        setModalType("error");
        setModalMessage(data.message || "Unable to create user");
      } else {
        setModalType("success");
        setModalMessage(`User created successfully (${data.data.contact})`);
      }

      setFormModalOpen(false);
      setResultModalOpen(true);
    } catch (err: any) {
      setModalType("error");
      setModalMessage("Network error. Please try again.");
      setFormModalOpen(false);
      setResultModalOpen(true);
    }

    setLoading(false);
  };

  const submitDisabled = loading || !contactType || !role;

  return (
    <>
      {/* Open Form Button */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#F06122] hover:bg-[#d9551c] text-white font-medium flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            New User
          </Button>
        </DialogTrigger>

        {/* Form Modal */}
        <DialogContent className=" max-h-[90vh] overflow-y-auto rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-start font-semibold text-gray-800">
              Create New User
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-start">
              Fill out the details below to add a new user to the system.
            </DialogDescription>
          </DialogHeader>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 mt-3">
            {/* SECTION — User Information */}
            <div className="space-y-4">
              <h4 className="text-sm text-start font-semibold text-gray-700 tracking-wide">
                Personal Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Full Name (Bangla)</Label>
                  <Input
                    name="fullNameBangla"
                    required
                    placeholder="মোহাম্মদ আলী"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Full Name (English)</Label>
                  <Input
                    name="fullNameEnglish"
                    required
                    placeholder="Mohammad Ali"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Contact</Label>
                <Input name="contact" required placeholder="Phone or Email" />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t"></div>

            {/* SECTION — Account Settings */}
            <div className="space-y-4 w-full ">
              <h4 className="text-sm font-semibold text-gray-700 tracking-wide">
                Account Settings
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                {/* Contact Type */}
                <div className="space-y-1 w-full">
                  <Label>Contact Type</Label>
                  <Select onValueChange={setContactType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Role */}
                <div className="space-y-1 w-full ">
                  <Label>User Role</Label>
                  <Select onValueChange={setRole}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="representative">
                        Representative
                      </SelectItem>
                      <SelectItem value="recognition">Recognition</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Profile Image */}
              <div className="space-y-1">
                <Label>Profile Image (Optional)</Label>
                <Input type="file" name="profileImage" />
              </div>
            </div>

            {/* Submit Button */}
            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={submitDisabled}
                className="w-full bg-[#F06122] hover:bg-[#d9551c] text-white py-2.5 text-base font-medium rounded-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating User...
                  </div>
                ) : (
                  "Create User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* SUCCESS / ERROR MODAL */}
      <Dialog open={resultModalOpen} onOpenChange={setResultModalOpen}>
        <DialogContent className="max-w-sm rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle
              className={`text-lg font-semibold ${
                modalType === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {modalType === "success" ? "User Created Successfully" : "Error"}
            </DialogTitle>
          </DialogHeader>

          <p className="text-gray-700 text-sm py-3">{modalMessage}</p>

          <DialogFooter>
            <Button
              onClick={() => setResultModalOpen(false)}
              className="bg-gray-900 hover:bg-gray-700 text-white rounded-md"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
