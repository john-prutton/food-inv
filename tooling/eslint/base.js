import tsPlugin from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"

export default [
	{
		files: ["**/*.ts", "**/*.tsx"],
		ignores: ["dist/**/*"],
		languageOptions: {
			parser: tsParser,
			// globals: {},
		},
		plugins: { "@typescript-eslint": tsPlugin },
		rules: {
			// "no-unused-vars": "off",
			...tsPlugin.configs.recommended.rules,
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
		},
	},
]
