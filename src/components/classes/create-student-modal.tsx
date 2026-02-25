"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createStudent, addStudentToClass } from "@/app/actions/classes";

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
}

export function CreateStudentModal({ isOpen, onClose, classId }: CreateStudentModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !grade.trim() ||
      !parentName.trim() ||
      !parentPhone.trim() ||
      !parentEmail.trim()
    ) {
      setError("All fields are required");
      return;
    }

    startTransition(async () => {
      try {
        const studentId = await createStudent({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          grade: grade.trim(),
          parentName: parentName.trim(),
          parentPhone: parentPhone.trim(),
          parentEmail: parentEmail.trim(),
        });
        await addStudentToClass(classId, studentId);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900">Create New Student</h3>
        <p className="mt-1 text-sm text-gray-500">
          The student will be automatically added to this class.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jane"
              required
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@school.edu"
              required
            />
            <Input
              label="Grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="7th Grade"
              required
            />
          </div>
          <Input
            label="Parent/Guardian Name"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="John Doe"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Parent Phone"
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="(555) 123-4567"
              required
            />
            <Input
              label="Parent Email"
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="parent@email.com"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create & Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
