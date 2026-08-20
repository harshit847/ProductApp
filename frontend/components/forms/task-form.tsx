"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select } from "../ui/select";
import { useToast } from "@/hooks/use-toast";
import type { TaskFormValues } from "@/services/tasks";
import type { Task } from "@/utils/types";

const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string().optional(),
  assignee: z.string().optional()
});

function toInputDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function TaskForm({
  taskId,
  initialValues,
  submitLabel = "Save task",
  onSave,
  onSaved,
  onCancel
}: {
  taskId?: string;
  initialValues?: Partial<TaskFormValues>;
  submitLabel?: string;
  onSave: (values: TaskFormValues) => Promise<Task>;
  onSaved?: (values: TaskFormValues & { id?: string }) => void;
  onCancel?: () => void;
}) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      status: initialValues?.status || "TODO",
      priority: initialValues?.priority || "MEDIUM",
      dueDate: toInputDate(initialValues?.dueDate),
      assignee: initialValues?.assignee || ""
    }
  });

  useEffect(() => {
    form.reset({
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      status: initialValues?.status || "TODO",
      priority: initialValues?.priority || "MEDIUM",
      dueDate: toInputDate(initialValues?.dueDate),
      assignee: initialValues?.assignee || ""
    });
  }, [form, initialValues]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = { ...values, dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined };
      const result = await onSave(payload);
      toast({
        title: taskId ? "Task updated" : "Task created",
        description: taskId ? `${values.title} was saved successfully.` : `${values.title} was added to the board.`
      });
      onSaved?.({ ...payload, id: result.id });
      if (!taskId) form.reset();
    } catch (error) {
      toast({ title: taskId ? "Unable to update task" : "Unable to save task", description: error instanceof Error ? error.message : "Please try again." });
    }
  });

  return (
    <form className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <label className="text-[0.8125rem] font-medium text-foreground">Task title</label>
        <Input placeholder="Task title" {...form.register("title")} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[0.8125rem] font-medium text-foreground">Assignee</label>
        <Input placeholder="Assignee" {...form.register("assignee")} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[0.8125rem] font-medium text-foreground">Due date</label>
        <Input type="datetime-local" {...form.register("dueDate")} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[0.8125rem] font-medium text-foreground">Status</label>
        <Select {...form.register("status")}>
          <option>TODO</option>
          <option>IN_PROGRESS</option>
          <option>DONE</option>
        </Select>
      </div>
      <div className="space-y-1.5">
        <label className="text-[0.8125rem] font-medium text-foreground">Priority</label>
        <Select {...form.register("priority")}>
          <option>LOW</option>
          <option>MEDIUM</option>
          <option>HIGH</option>
          <option>URGENT</option>
        </Select>
      </div>
      <div className="space-y-1.5 md:col-span-2 xl:col-span-3">
        <label className="text-[0.8125rem] font-medium text-foreground">Description</label>
        <Textarea placeholder="Task description" {...form.register("description")} />
      </div>
      <div className="flex gap-2 md:col-span-2 xl:col-span-3">
        <Button className="flex-1" size="md" type="submit">
          {submitLabel}
        </Button>
        {taskId && (
          <Button type="button" variant="outline" size="md" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
