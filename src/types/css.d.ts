// Allow importing plain CSS files (global and CSS modules)
declare module "*.css";
declare module "*.scss";
declare module "*.sass";

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}
