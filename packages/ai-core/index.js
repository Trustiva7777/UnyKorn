const { BRAND_NAME } = require('@unykorn/shared');

function provisionPersonalAgent({ userId, role }) {
  return {
    id: `agent_${userId}`,
    role,
    brand: BRAND_NAME,
    createdAt: new Date().toISOString(),
    instructions: `Hello ${role}, your workspace is ready.`,
  };
}

module.exports = { provisionPersonalAgent };
