/**
 * Äriloogika kiht — route'id delegueerivad siia.
 * Teised teenused (orders) küsivad kasutaja olemasolu enne tellimuse salvestamist.
 */

class UserService {
  constructor(userRepository) {
    this.repo = userRepository;
  }

  getUserById(userId) {
    const profile = this.repo.getPublicProfile(userId);
    if (!profile) {
      return { found: false, user: null };
    }
    return { found: true, user: profile };
  }

  listUsers(limit = 50) {
    const all = this.repo.listAll();
    return {
      items: all.slice(0, limit),
      total: all.length,
    };
  }

  /**
   * Sisemine kontroll tellimuse jaoks — viskab vea, kui kasutaja pole sobiv.
   */
  validateUserForOrder(userId) {
    return this.repo.assertActiveUser(userId);
  }
}

module.exports = { UserService };
