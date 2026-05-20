const bcrypt = require('bcryptjs')

async function test() {
  const password = 'test'
  const hash = '$2b$10$4xtqreX2BLzKkv1Jm3DPAO5wrYX.XAfJXS2qpC3cqneh0APgIUO8W'
  const isValid = await bcrypt.compare(password, hash)
  console.log('Password:', password)
  console.log('Hash:', hash)
  console.log('IsValid:', isValid)
}

test()
