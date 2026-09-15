"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./auth/auth.module");
const company_module_1 = require("./companies/company.module");
const hiring_module_1 = require("./hiring/hiring.module");
const moderation_module_1 = require("./moderation/moderation.module");
const professional_profile_module_1 = require("./professionals/professional-profile.module");
const publishing_module_1 = require("./publishing/publishing.module");
const review_module_1 = require("./reviews/review.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            professional_profile_module_1.ProfessionalProfileModule,
            company_module_1.CompanyModule,
            review_module_1.ReviewModule,
            hiring_module_1.HiringModule,
            publishing_module_1.PublishingModule,
            moderation_module_1.ModerationModule,
        ],
    })
], AppModule);
