import { body, param, query } from "express-validator";

export const validateCreateResource = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 255 })
    .withMessage("Name must be less than 255 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ max: 100 })
    .withMessage("Category must be less than 100 characters"),
];

export const validateUpdateResource = [
  param("id").isUUID().withMessage("Invalid resource ID format"),
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ max: 255 })
    .withMessage("Name must be less than 255 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("category")
    .optional()
    .notEmpty()
    .withMessage("Category cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Category must be less than 100 characters"),
];

export const validateResourceId = [
  param("id").isUUID().withMessage("Invalid resource ID format"),
];

export const validateResourceFilters = [
  query("category")
    .optional()
    .isString()
    .withMessage("Category must be a string"),
  query("name").optional().isString().withMessage("Name must be a string"),
];
