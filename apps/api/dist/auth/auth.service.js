'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthService = void 0;
const common_1 = require('@nestjs/common');
const bcrypt = __importStar(require('bcryptjs'));
const jwt = __importStar(require('jsonwebtoken'));
const user_repository_1 = require('./user.repository');
let AuthService = class AuthService {
  userRepository;
  jwtSecret = process.env.JWT_SECRET || 'dev-secret';
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async register(dto) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new common_1.ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: 'PROFESSIONAL',
    });
    return this.buildAuthResponse(user);
  }
  async login(dto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new common_1.UnauthorizedException('Invalid credentials');
    }
    this.ensureAccountActive(user);
    return this.buildAuthResponse(user);
  }
  async refresh(dto) {
    let payload;
    try {
      payload = jwt.verify(dto.refreshToken, this.jwtSecret);
    } catch {
      throw new common_1.UnauthorizedException('Invalid refresh token');
    }
    if (payload.type !== 'refresh') {
      throw new common_1.UnauthorizedException('Invalid refresh token');
    }
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new common_1.UnauthorizedException('Invalid refresh token');
    }
    this.ensureAccountActive(user);
    return this.buildAuthResponse(user);
  }
  ensureAccountActive(user) {
    if (user.status !== 'ACTIVE') {
      throw new common_1.UnauthorizedException('Account is not active');
    }
  }
  buildAuthResponse(user) {
    const tokens = this.issueTokens(user.id, user.email, user.role);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }
  issueTokens(userId, email, role) {
    const accessToken = jwt.sign(
      {
        sub: userId,
        email,
        role,
      },
      this.jwtSecret,
      {
        expiresIn: '15m',
      },
    );
    const refreshToken = jwt.sign(
      {
        sub: userId,
        email,
        role,
        type: 'refresh',
      },
      this.jwtSecret,
      {
        expiresIn: '7d',
      },
    );
    return {
      accessToken,
      refreshToken,
    };
  }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate(
  [(0, common_1.Injectable)(), __metadata('design:paramtypes', [user_repository_1.UserRepository])],
  AuthService,
);
