'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.UserRepository = void 0;
class UserRepository {
  users = [];
  async findByEmail(email) {
    return this.users.find((user) => user.email === email);
  }
  async findById(id) {
    return this.users.find((user) => user.id === id);
  }
  async create(data) {
    const user = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...data,
    };
    this.users.push(user);
    return user;
  }
}
exports.UserRepository = UserRepository;
