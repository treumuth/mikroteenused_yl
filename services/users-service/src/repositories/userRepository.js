const fs = require('fs');
const { AppError } = require('@raamatupood/common');

/**
 * Kasutajate "andmebaas" mälus. Alglaadimisel loetakse seed.json —
 * see on lihtsuse huvides; päris süsteemis oleks eraldi DB iga teenuse taga.
 */
class UserRepository {
  constructor(seedPath, logger) {
    this.logger = logger;
    this.usersById = new Map();
    this.loadSeed(seedPath);
  }

  loadSeed(seedPath) {
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed file missing: ${seedPath}`);
    }
    const raw = fs.readFileSync(seedPath, 'utf8');
    const data = JSON.parse(raw);
    for (const user of data.users || []) {
      this.usersById.set(user.id, { ...user });
    }
    this.logger.info('Users loaded from seed', { count: this.usersById.size, seedPath });
  }

  findById(id) {
    return this.usersById.get(id) || null;
  }

  listAll() {
    return Array.from(this.usersById.values());
  }

  /**
   * Tagastab avaliku profiili (ilma tundlike väljadeta — siin on kõik juba avalik).
   */
  getPublicProfile(id) {
    const user = this.findById(id);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      active: user.active,
      memberSince: user.memberSince,
    };
  }

  assertActiveUser(id) {
    const user = this.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND', { userId: id });
    }
    if (!user.active) {
      throw new AppError('User account is not active', 403, 'USER_INACTIVE', { userId: id });
    }
    return user;
  }
}

module.exports = { UserRepository };
