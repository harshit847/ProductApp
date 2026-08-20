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
import type { LeadFormValues } from "@/services/leads";
import type { Lead } from "@/utils/types";

const leadSchema = z.object({
  name: z.string().min(2),
  company: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  source: z.string().min(2),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  owner: z.string().min(2),
  value: z.coerce.number().min(0),
  notes: z.string().optional()
});

export function LeadForm({
  leadId,
  initialValues,
  submitLabel = "Save lead",
  onSave,
  onSaved,
  onCancel
}: {
  leadId?: string;
  initialValues?: Partial<LeadFormValues>;
  submitLabel?: string;
  onSave: (values: LeadFormValues) => Promise<Lead>;
  onSaved?: (values: LeadFormValues & { id?: string; updatedAt?: string }) => void;
  onCancel?: () => void;
}) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof leadSchema>>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: initialValues?.name || "",
      company: initialValues?.company || "",
      email: initialValues?.email || "",
      phone: initialValues?.phone || "",
      source: initialValues?.source || "Website",
      status: initialValues?.status || "NEW",
      priority: initialValues?.priority || "MEDIUM",
      owner: initialValues?.owner || "Unassigned",
      value: initialValues?.value || 0,
      notes: initialValues?.notes || ""
    }
  });

  useEffect(() => {
    form.reset({
      name: initialValues?.name || "",
      company: initialValues?.company || "",
      email: initialValues?.email || "",
      phone: initialValues?.phone || "",
      source: initialValues?.source || "Website",
      status: initialValues?.status || "NEW",
      priority: initialValues?.priority || "MEDIUM",
      owner: initialValues?.owner || "Unassigned",
      value: initialValues?.value || 0,
      notes: initialValues?.notes || ""
    });
  }, [form, initialValues]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await onSave(values);
      toast({
        title: leadId ? "Lead updated" : "Lead created",
        description: leadId ? `${values.name} was saved successfully.` : `${values.name} was added to the pipeline.`
      });
      onSaved?.({ ...values, id: result.id, updatedAt: result.updatedAt });
      if (!leadId) form.reset();
    } catch (error) {
      toast({
        title: leadId ? "Unable to update lead" : "Unable to save lead",
        description: error instanceof Error ? error.message : "Please try again."
      });
    }
  });

  return (
    <form className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <label className="text-[0.8125rem] font-medium text-foreground">Lead name</label>
        <Input placeholder="Lead name" {...form.register("name")} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[0.8125rem] font-medium text-foreground">Company</label>
        <Input placeholder="Company" {...form.register("company")} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[0.8125rem] font-medium text-foreground">Email</label>
        <Input placeholder="Email" {...form.register("email")} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[0.8125rem] font-medium text-foreground">Phone</label>
        <Input placeholder="Phone" {...form.register("phone")} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[0.8125rem] font-medium text-foreground">Source</label>
        <Input placeholder="Source" {...form.register("source")} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[0.8125rem] font-medium text-foreground">Owner</label>
        <Input placeholder="Owner" {...form.register("owner")} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[0.8125rem] font-medium text-foreground">Deal value</label>
        <Input type="number" placeholder="Deal value" {...form.register("value", { valueAsNumber: true })} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[0.8125rem] font-medium text-foreground">Status</label>
        <Select {...form.register("status")}>
          <option>NEW</option>
          <option>CONTACTED</option>
          <option>QUALIFIED</option>
          <option>PROPOSAL</option>
          <option>WON</option>
          <option>LOST</option>
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
        <label className="text-[0.8125rem] font-medium text-foreground">Notes</label>
        <Textarea placeholder="Lead notes" {...form.register("notes")} />
      </div>
      <div className="flex gap-2 pt-1 md:col-span-2 xl:col-span-3">
        <Button className="flex-1" type="submit">
          {submitLabel}
        </Button>
        {leadId && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
