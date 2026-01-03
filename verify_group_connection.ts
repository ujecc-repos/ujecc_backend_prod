
import { prisma } from './src/utils/client';

async function main() {
  try {
    // 1. Get a group
    const group = await prisma.groupe.findFirst();
    if (!group) {
      console.log("No groups found. Creating one for testing...");
      // Create a dummy group if none exists
      const newGroup = await prisma.groupe.create({
        data: {
          name: "Test Group",
          description: "Test Description"
        }
      });
      console.log("Created group:", newGroup.id);
      testUserCreation(newGroup.id);
    } else {
      console.log("Found group:", group.id);
      testUserCreation(group.id);
    }
  } catch (error) {
    console.error("Error finding/creating group:", error);
  }
}

async function testUserCreation(groupId: string) {
    const email = `test_group_${Date.now()}@example.com`;
    const password = "password123";
    const firstname = "Group";
    const lastname = "Tester";

    console.log(`Creating user with groupId: ${groupId}`);

    // Simulate the logic we added in user.routes.ts
    // We can't call the route directly without running the server and making an HTTP request,
    // but we can verify if the prisma syntax works as expected.
    
    const userData = {
        firstname,
        lastname,
        email,
        password, // In real app this is hashed
        role: "Membre"
    };

    const createData: any = { ...userData };
    
    // This is the logic we added
    if (groupId) {
        createData.groups = { connect: { id: groupId } };
    }

    try {
        const user = await prisma.user.create({
            data: createData,
            include: {
                groups: true
            }
        });

        console.log("User created successfully:", user.id);
        console.log("User groups:", user.groups);

        if (user.groups.some(g => g.id === groupId)) {
            console.log("SUCCESS: User is connected to the group.");
        } else {
            console.error("FAILURE: User is NOT connected to the group.");
        }

        // Cleanup
        await prisma.user.delete({ where: { id: user.id } });
        // Optional: delete group if we created it? No, keep it simple.

    } catch (error) {
        console.error("Error creating user:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
