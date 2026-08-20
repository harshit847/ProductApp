// Seed data makes the demo credentials useful and gives the app a believable starting state.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Admin@12345", 12);
  const managerHash = await bcrypt.hash("Manager@12345", 12);
  const salesHash = await bcrypt.hash("Sales@12345", 12);

  const admin = await prisma.user.create({
    data: { id: "user_admin", name: "Priya Sharma", email: "admin@flowcrm.app", passwordHash, role: "ADMIN" }
  });

  const manager = await prisma.user.create({
    data: { id: "user_manager", name: "Rahul Verma", email: "manager@flowcrm.app", passwordHash: managerHash, role: "MANAGER" }
  });

  const sales = await prisma.user.create({
    data: { id: "user_sales", name: "Meera Joshi", email: "sales@flowcrm.app", passwordHash: salesHash, role: "SALES" }
  });

  await prisma.lead.createMany({
    data: [
      {
        id: "lead_1",
        name: "Aarav Mehta",
        company: "Northstar Labs",
        email: "aarav@northstarlabs.com",
        source: "Website",
        status: "QUALIFIED",
        priority: "HIGH",
        notes: "Requested annual pricing.",
        value: 12000,
        ownerId: sales.id
      },
      {
        id: "lead_2",
        name: "Sofia Patel",
        company: "Bluebird Retail",
        email: "sofia@bluebirdretail.com",
        source: "LinkedIn",
        status: "CONTACTED",
        priority: "MEDIUM",
        notes: "Waiting for demo feedback.",
        value: 8400,
        ownerId: manager.id
      },
      {
        id: "lead_3",
        name: "Daniel Kim",
        company: "Harbor Finance",
        email: "daniel@harborfinance.com",
        source: "Referral",
        status: "PROPOSAL",
        priority: "URGENT",
        notes: "Legal review in progress.",
        value: 24000,
        ownerId: admin.id
      }
    ]
  });

  await prisma.task.createMany({
    data: [
      { id: "task_1", title: "Send proposal to Northstar Labs", status: "IN_PROGRESS", priority: "HIGH", assigneeId: sales.id },
      { id: "task_2", title: "Call Bluebird Retail", status: "TODO", priority: "MEDIUM", assigneeId: manager.id },
      { id: "task_3", title: "Mark Harbor Finance as closed won", status: "DONE", priority: "LOW", assigneeId: admin.id, completedAt: new Date() }
    ]
  });

  await prisma.activityLog.createMany({
    data: [
      { type: "LEAD_CREATED", message: "Northstar Labs lead added", userId: sales.id },
      { type: "TASK_CREATED", message: "Bluebird Retail follow-up task added", userId: manager.id },
      { type: "PROFILE_UPDATED", message: "Admin profile refreshed", userId: admin.id }
    ]
  });

  console.log("Seed complete with demo users and sample CRM data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

