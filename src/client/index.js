import ReactDOM from "react-dom";
import Container from "./components/Container";
import { getPage } from "../worker";

const initialData = JSON.parse(
  document.getElementById("initial-data").getAttribute("data-json")
);

async function render() {
  // TODO: Find a smarter way to load this for initial page view, like with script tag
  const { pathname } = window.location;
  const pagePath = pathname === "/" ? "/index" : pathname;
  const page = await getPage(pagePath);

  ReactDOM.hydrate(
    <Container pageProps={initialData} Component={page.default} />,
    document.getElementById("__flareact")
  );
}

render();
