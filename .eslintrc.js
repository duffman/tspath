/** @type {import("eslint").Linter.Config} */
module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaFeatures: {
			jsx: true
		},
		ecmaVersion: 2022,
		sourceType: "module",
		project: ["./tsconfig.json"]
	},
	plugins: [
		"@typescript-eslint",
	],
    extends: [
        "plugin:@typescript-eslint/recommended"
    ],
    rules: {
        "prefer-const": "off",
        "@typescript-eslint/no-inferrable-types": "warn",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-this-alias": "off"
    }
};
