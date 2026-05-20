const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'test@example.com'
  const password = 'test'
  const hashedPassword = await bcrypt.hash(password, 10)

  console.log('Password:', password)
  console.log('Hash:', hashedPassword)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email,
      name: 'Test Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('User created/updated:', user.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
