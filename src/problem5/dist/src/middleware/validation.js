"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResourceFilters = exports.validateResourceId = exports.validateUpdateResource = exports.validateCreateResource = void 0;
const express_validator_1 = require("express-validator");
exports.validateCreateResource = [
    (0, express_validator_1.body)("name")
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ max: 255 })
        .withMessage("Name must be less than 255 characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .isString()
        .withMessage("Description must be a string"),
    (0, express_validator_1.body)("category")
        .notEmpty()
        .withMessage("Category is required")
        .isLength({ max: 100 })
        .withMessage("Category must be less than 100 characters"),
];
exports.validateUpdateResource = [
    (0, express_validator_1.param)("id").isUUID().withMessage("Invalid resource ID format"),
    (0, express_validator_1.body)("name")
        .optional()
        .notEmpty()
        .withMessage("Name cannot be empty")
        .isLength({ max: 255 })
        .withMessage("Name must be less than 255 characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .isString()
        .withMessage("Description must be a string"),
    (0, express_validator_1.body)("category")
        .optional()
        .notEmpty()
        .withMessage("Category cannot be empty")
        .isLength({ max: 100 })
        .withMessage("Category must be less than 100 characters"),
];
exports.validateResourceId = [
    (0, express_validator_1.param)("id").isUUID().withMessage("Invalid resource ID format"),
];
exports.validateResourceFilters = [
    (0, express_validator_1.query)("category")
        .optional()
        .isString()
        .withMessage("Category must be a string"),
    (0, express_validator_1.query)("name").optional().isString().withMessage("Name must be a string"),
];
//# sourceMappingURL=validation.js.map