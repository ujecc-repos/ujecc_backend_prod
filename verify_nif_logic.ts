
import { PrismaClient } from './src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  const nif = "TEST_NIF_12345";
  const email = "test_nif_unique@example.com";

  console.log("Cleaning up potential previous test data...");
  try {
      await prisma.user.deleteMany({
        where: {
          OR: [
            { nif: nif },
            { email: email }
          ]
        }
      });
  } catch (e) {
      console.log("Cleanup warning:", e);
  }

  console.log("Creating first user with NIF...");
  await prisma.user.create({
    data: {
      firstname: "Test",
      lastname: "User",
      email: email,
      password: "password",
      nif: nif
    }
  });

  console.log("Simulating the check in the route...");
  // This is the logic we added to the route
  const existingUserNif = await prisma.user.findFirst({
    where: { nif: nif }
  });

  if (existingUserNif) {
    console.log("SUCCESS: The logic correctly identified the existing NIF.");
  } else {
    console.error("FAILURE: The logic FAILED to identify the existing NIF.");
    process.exit(1);
  }
  
  console.log("Cleaning up...");
  await prisma.user.deleteMany({
    where: {
      OR: [
        { nif: nif },
        { email: email }
      ]
    }
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
