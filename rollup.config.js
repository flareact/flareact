import babel from "rollup-plugin-babel";
import external from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const pkg = require("./package.json");

export default {
  input: "src/index.js",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    external({
      includeDependencies: true,
    }),
    resolve(),
    babel({
      presets: ["@babel/preset-react"],
      plugins: ["@babel/plugin-proposal-optional-chaining"],
      exclude: "node_modules/**",
      runtimeHelpers: true,
    }),
    commonjs(),
  ],
};
