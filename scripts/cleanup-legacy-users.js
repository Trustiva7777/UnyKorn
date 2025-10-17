const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    await p.wallet.deleteMany({ where: { user: { email: { endsWith: '@unykorn.local' } } } });
    await p.user.deleteMany({ where: { email: { endsWith: '@unykorn.local' } } });
    console.log('Legacy users removed.');
  } finally {
    await p.$disconnect();
  }
})();
